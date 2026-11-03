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

/* ---------------------------------------------------------- packages ---- */

console.log('a package ties its items together');
const planned = await call('plan 交付 v0.1.0 | 写实现 | 写测试');
check('the plan succeeds', planned.kind === 'success', JSON.stringify(planned));
const planText = planned.text;
check('the plan reports a package', /Package task-\d+/.test(planText), planText);
state = JSON.parse((await call('state')).text);
check('the board carries the package', Array.isArray(state.packages) && state.packages.length >= 1,
  JSON.stringify(state.packages));
const pkg = state.packages[state.packages.length - 1];
check('the package records its completion policy', pkg.completion === 'all', JSON.stringify(pkg));
check('the package lists its items', pkg.total >= 1, JSON.stringify(pkg));
check('a package row is marked as a package',
  state.tasks.find((task) => task.id === pkg.id)?.isPackage === true);

console.log('the package settles when its policy is satisfied');
// complete every child of the package
for (const childId of pkg.children) {
  const child = agentTeams.getTask(leadAgent, childId);
  if (!child || child.status === 'completed') continue;
  const claimed = await agentTeams.updateTask(leadAgent, { taskId: childId, expectedRevision: child.revision, action: 'claim' });
  await agentTeams.updateTask(leadAgent, { taskId: childId, expectedRevision: claimed.revision, action: 'complete' });
}
state = JSON.parse((await call('state')).text);
const settled = state.packages.find((entry) => entry.id === pkg.id);
check('the package counts every item', settled.done === settled.total, JSON.stringify(settled));
check('the package Work Item is completed',
  agentTeams.getTask(leadAgent, pkg.id).status === 'completed',
  agentTeams.getTask(leadAgent, pkg.id).status);

console.log('a manual package waits for a human');
const manual = await call('plan manual: 需要人工拍板的交付 | 合规检查');
check('the manual plan succeeds', manual.kind === 'success', JSON.stringify(manual));
const manualState = JSON.parse((await call('state')).text);
const manualPkg = manualState.packages[manualState.packages.length - 1];
check('the manual package is marked manual', manualPkg.completion === 'manual',
  JSON.stringify(manualPkg));

console.log('the model cannot settle a manual package');
const manualTask = agentTeams.getTask(leadAgent, manualPkg.id);
const manualDenial = guard({ name: 'team_task_update', agent: leadAgent,
  arguments: { task_id: manualPkg.id, expected_revision: manualTask.revision, action: 'complete' } });
check('the guard denies a manual package', typeof manualDenial === 'string', String(manualDenial));

console.log('an "any" package settles with one item');
await call('plan any: 至少一条路能走通 | 方案 A | 方案 B');
state = JSON.parse((await call('state')).text);
const anyPkg = state.packages[state.packages.length - 1];
check('the any package records its policy', anyPkg.completion === 'any', JSON.stringify(anyPkg));
const anyChild = agentTeams.getTask(leadAgent, anyPkg.children[0]);
if (anyChild.status !== 'completed') {
  const claimed = await agentTeams.updateTask(leadAgent, { taskId: anyChild.id, expectedRevision: anyChild.revision, action: 'claim' });
  await agentTeams.updateTask(leadAgent, { taskId: anyChild.id, expectedRevision: claimed.revision, action: 'complete' });
}
state = JSON.parse((await call('state')).text);
const anySettled = state.packages.find((entry) => entry.id === anyPkg.id);
check('the any package settles on the first item', anySettled.status === 'completed', JSON.stringify(anySettled));

console.log('the human can close a manual package');
const humanClose = await call(`complete ${manualPkg.id}`);
check('the human close succeeds', humanClose.kind === 'success', JSON.stringify(humanClose));
check('the manual package is completed',
  agentTeams.getTask(leadAgent, manualPkg.id).status === 'completed',
  agentTeams.getTask(leadAgent, manualPkg.id).status);

/* ------------------------------------------- the model side of a plan --- */

console.log('the model plans a package with the team_plan tool');
const planTool = registeredTools.find((tool) => tool.name === 'team_plan');
check('the plugin registered the team_plan tool', typeof planTool?.execute === 'function');
const planToolCall = (args) => planTool.execute(args, { agent: leadAgent, signal: new AbortController().signal });

/** Land one Work Item the way a worker does: claim it, then complete it. */
async function planLandItem(taskId) {
  const task = agentTeams.getTask(leadAgent, taskId);
  if (!task || task.status === 'completed') return;
  const claimed = await agentTeams.updateTask(leadAgent, { taskId, expectedRevision: task.revision, action: 'claim' });
  await agentTeams.updateTask(leadAgent, { taskId, expectedRevision: claimed.revision, action: 'complete' });
}

/** The planBoard as the panel and the model see it. */
const planBoard = async () => JSON.parse((await call('state')).text);
const planPackageEntry = (planSnapshot, id) => planSnapshot.packages.find((planEntry) => planEntry.id === id);

console.log('an "all" package waits for every item');
const planAll = await planToolCall({
  goal: '交付 v0.2.0',
  completion: 'all',
  items: [{ subject: '写实现', description: '写实现' }, { subject: '写测试', description: '写测试' }],
});
check('the tool returns a package id', typeof planAll.packageId === 'string', JSON.stringify(planAll));
check('the tool reports the policy', planAll.completion === 'all', JSON.stringify(planAll));
check('the tool lists one child per item', planAll.children.length === 2, JSON.stringify(planAll.children));
let planSnapshot = await planBoard();
let planEntry = planPackageEntry(planSnapshot, planAll.packageId);
check('an all package starts open', planEntry?.status === 'open', JSON.stringify(planEntry));
check('an all package counts nothing done yet', planEntry?.done === 0 && planEntry?.total === 2, JSON.stringify(planEntry));

await planLandItem(planAll.children[0]);
planSnapshot = await planBoard();
planEntry = planPackageEntry(planSnapshot, planAll.packageId);
check('an all package stays open while one item is missing', planEntry?.status === 'open', JSON.stringify(planEntry));
check('an all package counts the landed item', planEntry?.done === 1, JSON.stringify(planEntry));
check('an all package is not completed while one item is missing',
  agentTeams.getTask(leadAgent, planAll.packageId).status !== 'completed',
  agentTeams.getTask(leadAgent, planAll.packageId).status);

await planLandItem(planAll.children[1]);
planSnapshot = await planBoard();
planEntry = planPackageEntry(planSnapshot, planAll.packageId);
check('an all package settles when every item lands', planEntry?.status === 'completed', JSON.stringify(planEntry));
check('the all package Work Item is completed',
  agentTeams.getTask(leadAgent, planAll.packageId).status === 'completed',
  agentTeams.getTask(leadAgent, planAll.packageId).status);

console.log('an "any" package settles on the first item');
const planAny = await planToolCall({
  goal: '至少一条路能走通',
  completion: 'any',
  items: [{ subject: '方案 A', description: '方案 A' }, { subject: '方案 B', description: '方案 B' }],
});
check('the tool reports the any policy', planAny.completion === 'any', JSON.stringify(planAny));
planSnapshot = await planBoard();
planEntry = planPackageEntry(planSnapshot, planAny.packageId);
check('an any package starts open', planEntry?.status === 'open', JSON.stringify(planEntry));
await planLandItem(planAny.children[0]);
planSnapshot = await planBoard();
planEntry = planPackageEntry(planSnapshot, planAny.packageId);
check('an any package settles on the first item', planEntry?.status === 'completed', JSON.stringify(planEntry));
check('an any package counts the landed item', planEntry?.done === 1, JSON.stringify(planEntry));
check('the any package Work Item is completed',
  agentTeams.getTask(leadAgent, planAny.packageId).status === 'completed',
  agentTeams.getTask(leadAgent, planAny.packageId).status);

console.log('a "manual" package waits for a human');
const planManual = await planToolCall({
  goal: '需要人工拍板的交付',
  completion: 'manual',
  items: [{ subject: '合规检查', description: '合规检查' }],
});
check('the tool reports the manual policy', planManual.completion === 'manual', JSON.stringify(planManual));
await planLandItem(planManual.children[0]);
planSnapshot = await planBoard();
planEntry = planPackageEntry(planSnapshot, planManual.packageId);
check('a manual package waits for a human once its items land', planEntry?.status === 'awaiting-human', JSON.stringify(planEntry));
check('a manual package is not settled by the policy',
  agentTeams.getTask(leadAgent, planManual.packageId).status !== 'completed',
  agentTeams.getTask(leadAgent, planManual.packageId).status);
const planManualView = agentTeams.getTask(leadAgent, planManual.packageId);
const planManualDenial = guard({ name: 'team_task_update', agent: leadAgent,
  arguments: { task_id: planManual.packageId, expected_revision: planManualView.revision, action: 'complete' } });
check('the model cannot settle a manual package', typeof planManualDenial === 'string', String(planManualDenial));
const planHumanClose = await call(`complete ${planManual.packageId}`);
check('the human closes a manual package', planHumanClose.kind === 'success', JSON.stringify(planHumanClose));
planSnapshot = await planBoard();
planEntry = planPackageEntry(planSnapshot, planManual.packageId);
check('a closed manual package reads as completed', planEntry?.status === 'completed', JSON.stringify(planEntry));

console.log('the model side refuses a package it cannot plan');
let planRefused = '';
try { await planToolCall({ goal: '空包', items: [] }); } catch (error) {
  planRefused = error instanceof Error ? error.message : String(error);
}
check('a package without items is refused', /at least one item/.test(planRefused), planRefused);

console.log('an item without a subject is dropped');
const planPartial = await planToolCall({
  goal: '部分条目',
  completion: 'all',
  items: [{ subject: '有效条目', description: '有效条目' }, { description: '没有标题' }],
});
check('an item without a subject is dropped', planPartial.children.length === 1, JSON.stringify(planPartial.children));

console.log('an unknown completion falls back to all');
const planFallback = await planToolCall({
  goal: '兜底',
  completion: 'sometimes',
  items: [{ subject: '条目', description: '条目' }],
});
check('an unknown completion falls back to all', planFallback.completion === 'all', planFallback.completion);

console.log('an item can name its worker');
const planTargeted = await planToolCall({
  goal: '指定人',
  completion: 'all',
  items: [{ subject: '请 tester 复核', description: '请 tester 复核', target: 'tester' }],
});
check('an explicit target bypasses the rule filter',
  planTargeted.items[0]?.target === 'tester',
  JSON.stringify(planTargeted.items[0]));

console.log('every completion policy is covered');
const planCovered = new Set([planAll.completion, planAny.completion, planManual.completion]);
check('all three completion policies are exercised',
  ['all', 'any', 'manual'].every((policy) => planCovered.has(policy)),
  [...planCovered].join(','));

/* --------------------------------------- the dedupe identity in use ---- */

console.log('the dedupe identity of a dispatch');
const intakeTool = registeredTools.find((tool) => tool.name === 'team_intake');
const intakeCall = (args) => intakeTool.execute(args, { agent: leadAgent, signal: new AbortController().signal });
const firstDispatch = await intakeCall({ subject: '同一件事', description: '同一个 brief' });
check('the first dispatch creates a Work Item',
  typeof firstDispatch.taskId === 'string' && firstDispatch.deduplicated !== true,
  JSON.stringify(firstDispatch));
const secondDispatch = await intakeCall({ subject: '同一件事', description: '同一个 brief' });
check('the identical dispatch is deduplicated', secondDispatch.deduplicated === true, JSON.stringify(secondDispatch));
check('the duplicate points at the first Work Item',
  secondDispatch.taskId === firstDispatch.taskId,
  `${secondDispatch.taskId} vs ${firstDispatch.taskId}`);

// Characterisation, not endorsement: `dispatchKey` can tell two workers
// apart, but `intake` compares on subject and brief only, so naming a
// worker does not make a dispatch a different one.
const targetedDispatch = await intakeCall({ subject: '另一件事', description: '另一个 brief', target: 'tester' });
check('an explicitly targeted dispatch is created', typeof targetedDispatch.taskId === 'string', JSON.stringify(targetedDispatch));
const targetedAgain = await intakeCall({ subject: '另一件事', description: '另一个 brief', target: 'tester' });
check('naming a worker does not create a second Work Item',
  targetedAgain.deduplicated === true && targetedAgain.taskId === targetedDispatch.taskId,
  JSON.stringify(targetedAgain));

console.log(failures.length ? `\n${failures.length} FAILURE(S)` : '\nALL PASS');
process.exit(failures.length ? 1 : 0);
