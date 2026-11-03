/**
 * Host contract test for SuperAgentTeam.
 *
 * The first review found that the pure-function tests missed a wrong use of
 * the Host task contract: the Host only completes an *in-progress* task, and
 * completing one ignores the subject and the description. This harness
 * therefore models the Host's task state machine and drives the real plugin
 * code through requestGate → decideGate.
 *
 * Run: node test/contract.test.mjs
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, '..', 'index.js'), 'utf8');

const failures = [];
function check(name, condition, detail) {
  if (condition) console.log(`  PASS  ${name}`);
  else { console.log(`  FAIL  ${name}${detail ? ' — ' + detail : ''}`); failures.push(name); }
}

/* ------------------------------------------- a model of the Host service -- */

/**
 * A fake `ctx.agentTeams` that mirrors the Host rules the reviewer read out
 * of the runtime: completing requires an in-progress task, completing
 * ignores the subject and the description, claiming requires a ready and
 * unowned pending task, and every mutation is a compare-and-set.
 */
function makeAgentTeams() {
  const tasks = new Map();
  let seq = 0;
  const members = [
    { id: 'agent-lead', name: 'lead', role: 'lead', status: 'running', description: '', diagnostics: [] },
    { id: 'agent-t', name: 'tester', role: 'teammate', status: 'running', description: 'Run end-to-end 测试 and QA 验收.', diagnostics: [] },
  ];
  return {
    tasks,
    createTask(_agent, request) {
      const id = `task-${++seq}`;
      const task = {
        id,
        revision: 1,
        subject: request.subject,
        description: request.description ?? '',
        status: 'pending',
        ownerName: undefined,
        blockedBy: request.blockedBy ?? [],
        writeScopes: request.writeScopes ?? [],
        ready: true,
        writeScopeWarnings: [],
      };
      tasks.set(id, task);
      return { ...task };
    },
    listTasks() { return [...tasks.values()].map((task) => ({ ...task })); },
    getTask(_agent, id) { const task = tasks.get(id); return task ? { ...task } : undefined; },
    updateTask(_agent, request) {
      const task = tasks.get(request.taskId);
      if (!task) throw new Error('TEAM_TASK_STALE_REVISION');
      if (request.expectedRevision !== task.revision) throw new Error('TEAM_TASK_STALE_REVISION');
      switch (request.action) {
        case 'claim':
          if (task.status !== 'pending') throw new Error('only a pending task can be claimed');
          if (!task.ready) throw new Error('the task is not ready');
          if (task.ownerName) throw new Error('the task already has an owner');
          task.status = 'in_progress';
          task.ownerName = 'lead';
          break;
        case 'edit':
          if (request.subject !== undefined) task.subject = request.subject;
          if (request.description !== undefined) task.description = request.description;
          if (request.writeScopes !== undefined) task.writeScopes = request.writeScopes;
          break;
        case 'complete':
          if (task.status !== 'in_progress') throw new Error('only an in-progress task can complete');
          // The Host ignores the subject and the description here.
          task.status = 'completed';
          break;
        case 'reopen':
          task.status = 'pending';
          break;
        case 'delete':
          tasks.delete(request.taskId);
          return { ...task, status: 'deleted' };
        default:
          throw new Error(`unsupported action ${request.action}`);
      }
      task.revision += 1;
      return { ...task };
    },
    listMembers() { return members.map((member) => ({ ...member })); },
    tryMembership(agent) {
      if (!agent) return undefined;
      return { root: agent, id: 'team-1', role: 'lead', name: 'lead' };
    },
    sendMessage(_agent, request) {
      if (request.target === 'lead') throw new Error('cannot message itself');
      return { messageId: 'message-1' };
    },
  };
}

/* ---------------------------------------------- the plugin under test --- */

const leadAgent = { id: 'agent-lead' };
const agentTeams = makeAgentTeams();
let commandHandler = null;
let guard = null;
const registeredTools = [];
const ctx = {
  agentTeams,
  agents: { list: () => [leadAgent], get: (id) => (id === leadAgent.id ? leadAgent : undefined) },
  tools: {
    register(definition) { registeredTools.push(definition); return () => {}; },
    guard(fn) { guard = fn; return () => {}; },
  },
  systemPrompt: {
    section() { return () => {}; },
    context() { return () => {}; },
    getSectionOrder() { return 40; },
  },
  commands: {
    register(definition) { commandHandler = definition.handler; return () => {}; },
  },
  timer: { interval() { return () => {}; } },
  effect(fn) { const disposer = fn(); return () => (typeof disposer === 'function' ? disposer() : undefined); },
  on() { return () => {}; },
  // A soft inject hands the callback a context that carries the service.
  inject(_deps, fn) { fn({ commands: ctx.commands }); return () => {}; },
  provide() { return () => {}; },
};

// The plugin installs its tools into the agent's own context.
leadAgent.ctx = { systemPrompt: ctx.systemPrompt, tools: ctx.tools };

// Load the whole module: `apply` closes over the module-level helpers.
const module = { exports: {} };
// eslint-disable-next-line no-new-func
new Function('module', 'exports', source.replace(/^export /gm, '') + '\nmodule.exports = { apply };')(module, module.exports);
module.exports.apply(ctx);

check('the plugin registered the human control surface', typeof commandHandler === 'function');

const call = (line) => commandHandler({ agent: leadAgent, rawInput: line, signal: new AbortController().signal });

/* ------------------------------------------------------------ the gates -- */

console.log('a gate is raised');
const gate = agentTeams.createTask(leadAgent, { subject: '[GATE:merge] 合并插件', description: '需要人工确认' });
check('the gate starts pending', agentTeams.getTask(leadAgent, gate.id).status === 'pending');

console.log('the human approves it');
const approved = await call(`approve ${gate.id}`);
check('the approval succeeds', approved.kind === 'success', JSON.stringify(approved));
const approvedTask = agentTeams.getTask(leadAgent, gate.id);
check('the gate is completed', approvedTask.status === 'completed', approvedTask.status);
check('the gate keeps its subject', approvedTask.subject === '[GATE:merge] 合并插件', approvedTask.subject);
let state = JSON.parse((await call('state')).text);
check('the board reports the gate as approved',
  state.gates.find((entry) => entry.id === gate.id)?.status === 'approved',
  JSON.stringify(state.gates));
check('the board hides the machine prefix from the human',
  state.gates.find((entry) => entry.id === gate.id)?.subject === '合并插件',
  JSON.stringify(state.gates));

console.log('the human rejects another gate');
const gate2 = agentTeams.createTask(leadAgent, { subject: '[GATE:release] 发布插件', description: '发布前确认' });
const rejected = await call(`reject ${gate2.id}`);
check('the rejection succeeds', rejected.kind === 'success', JSON.stringify(rejected));
const rejectedTask = agentTeams.getTask(leadAgent, gate2.id);
check('the rejected gate is completed', rejectedTask.status === 'completed', rejectedTask.status);
check('the rejected gate keeps the rejection marker',
  rejectedTask.subject === '[GATE:release] REJECTED — 发布插件',
  rejectedTask.subject);
state = JSON.parse((await call('state')).text);
const rejectedEntry = state.gates.find((entry) => entry.id === gate2.id);
check('the board reports the gate as rejected, not approved',
  rejectedEntry?.status === 'rejected',
  JSON.stringify(rejectedEntry));
check('the board shows the rejected gate without the marker',
  rejectedEntry?.subject === '发布插件',
  JSON.stringify(rejectedEntry));

console.log('a settled gate cannot be settled again');
const again = await call(`approve ${gate.id}`);
check('the second decision is refused', again.kind === 'error', JSON.stringify(again));

/* ------------------------------------------------------- the guard ------ */

console.log('the model cannot settle a gate');
const gate3 = agentTeams.createTask(leadAgent, { subject: '[GATE:sensitive] 敏感操作', description: '' });
const denial = guard({ name: 'team_task_update', agent: leadAgent, arguments: { task_id: gate3.id, expected_revision: 1, action: 'complete' } });
check('the guard denies a gate mutation', typeof denial === 'string' && denial.includes('hard gate'), String(denial));
const allowed = guard({ name: 'team_task_update', agent: leadAgent, arguments: { task_id: 'task-99', expected_revision: 1, action: 'complete' } });
check('the guard allows an ordinary task', allowed === undefined, String(allowed));

/* ------------------------------------------------- the legacy scopes --- */

console.log('the legacy gate scope is removable');
const legacy = agentTeams.createTask(leadAgent, { subject: '[GATE:merge] 老闸门', description: '', writeScopes: ['super-agent-team/gate-merge'] });
const cleaned = await call('clean-scopes');
check('the cleanup succeeds', cleaned.kind === 'success', JSON.stringify(cleaned));
check('the legacy scope is gone',
  agentTeams.getTask(leadAgent, legacy.id).writeScopes.length === 0,
  JSON.stringify(agentTeams.getTask(leadAgent, legacy.id).writeScopes));

/* ------------------------------------------------------ idempotency ---- */

console.log('the same request does not create a second Work Item');
const first = await call('intake 端到端测试与 UI 验收');
check('the first dispatch is routed', first.kind === 'success', JSON.stringify(first));
const beforeCount = agentTeams.tasks.size;
const second = await call('intake 端到端测试与 UI 验收');
check('the second dispatch is deduplicated', second.text.includes('no second one was created'), JSON.stringify(second));
check('the board did not grow', agentTeams.tasks.size === beforeCount,
  `${beforeCount} -> ${agentTeams.tasks.size}`);
check('the routing ledger records the duplicate',
  JSON.parse((await call('state')).text).routes.some((entry) => entry.stage === 'duplicate'));

console.log('a duplicate does not block a genuine re-run');
const rerun = await call('intake 端到端测试与 UI 验收');
check('the re-run is refused while the first is unclaimed', rerun.text.includes('no second one was created'), JSON.stringify(rerun));

console.log('the human can delete a Work Item');
const toDelete = agentTeams.createTask(leadAgent, { subject: 'QA 残留工单', description: '' });
const deleted = await call(`delete ${toDelete.id}`);
check('the delete succeeds', deleted.kind === 'success', JSON.stringify(deleted));
check('the Work Item is gone', agentTeams.getTask(leadAgent, toDelete.id) === undefined);

console.log(failures.length ? `\n${failures.length} FAILURE(S)` : '\nALL PASS');
process.exit(failures.length ? 1 : 0);
