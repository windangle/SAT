/**
 * Feature tests for the SuperAgentTeam Host half.
 *
 * These cover the pieces that the plain contract test cannot reach: the
 * plugin's own Config schema, the durable routing ledger, the stall
 * recovery, the completion tracker, the approval seam and the roster
 * template.
 *
 * Run: node test/features.test.mjs
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

/* ------------------------------------------------------- the plugin load -- */

function loadPlugin() {
  const module = { exports: {} };
  // eslint-disable-next-line no-new-func
  new Function('module', 'exports', source.replace(/^export /gm, '') + '\nmodule.exports = { apply, Config, DEFAULTS };')(module, module.exports);
  return module.exports;
}

/* --------------------------------------------------------- the fake Host -- */

function makeWorld(options = {}) {
  const tasks = new Map();
  const records = { ledger: {}, completions: {} };
  const approvals = [];
  const spawned = [];
  let seq = 0;

  const agentTeams = {
    tasks,
    async createTask(_agent, request) {
      const id = `task-${++seq}`;
      const task = {
        id, revision: 1, subject: request.subject, description: request.description ?? '',
        status: 'pending', ownerName: undefined, blockedBy: request.blockedBy ?? [],
        writeScopes: request.writeScopes ?? [], ready: true, writeScopeWarnings: [],
      };
      tasks.set(id, task);
      return { ...task };
    },
    listTasks() { return [...tasks.values()].map((task) => ({ ...task })); },
    getTask(_agent, id) { const task = tasks.get(id); return task ? { ...task } : undefined; },
    async updateTask(_agent, request) {
      const task = tasks.get(request.taskId);
      if (!task) throw new Error('TEAM_TASK_STALE_REVISION');
      if (request.expectedRevision !== task.revision) throw new Error('TEAM_TASK_STALE_REVISION');
      switch (request.action) {
        case 'claim':
          if (task.status !== 'pending') throw new Error('only a pending task can be claimed');
          if (task.ownerName) throw new Error('the task already has an owner');
          task.status = 'in_progress';
          task.ownerName = 'lead';
          break;
        case 'release':
          if (task.status !== 'in_progress') throw new Error('only an in-progress task can be released');
          task.status = 'pending';
          task.ownerName = undefined;
          break;
        case 'edit':
          if (request.subject !== undefined) task.subject = request.subject;
          if (request.description !== undefined) task.description = request.description;
          if (request.writeScopes !== undefined) task.writeScopes = request.writeScopes;
          break;
        case 'complete':
          if (task.status !== 'in_progress') throw new Error('only an in-progress task can complete');
          task.status = 'completed';
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
    listMembers() {
      return options.members ?? [
        { id: 'agent-lead', name: 'lead', role: 'lead', status: 'running', description: '', diagnostics: [] },
      ];
    },
    tryMembership(agent) {
      if (!agent) return undefined;
      return { root: agent, id: 'team-1', role: 'lead', name: 'lead' };
    },
    async sendMessage() { return { messageId: 'message-1' }; },
    async spawnTeammate(_caller, request) {
      spawned.push(request.name);
      return { member: { id: `agent-${request.name}`, name: request.name, role: 'teammate', status: 'running', description: request.description, diagnostics: [] } };
    },
  };

  const storage = {
    backend: {
      get(name) {
        if (name !== 'json') return undefined;
        return {
          kv: {
            // The real backend allows exactly one live handle per unit.
            openUnits: new Set(),
            async open(descriptor) {
              if (this.openUnits.has(descriptor.name)) {
                throw new Error(`unit '${descriptor.name}' is already open; a unit has exactly one live handle`);
              }
              this.openUnits.add(descriptor.name);
              const table = descriptor.tables ?? [];
              const self = this;
              return {
                async loadAll() {
                  const out = {};
                  for (const name of table) out[name] = { ...records[name] };
                  return { tables: out, global: undefined };
                },
                async putRecord(tableName, key, value) {
                  if (!/^[a-zA-Z0-9_-]+$/.test(key)) throw new Error(`unit 'x': per-record key '${key}' is not path-safe`);
                  records[tableName][key] = value;
                },
                async deleteRecord(tableName, key) { delete records[tableName][key]; },
                async close() { self.openUnits.delete(descriptor.name); },
              };
            },
          },
        };
      },
    },
  };

  const approval = options.approval === undefined ? undefined : {
    async request(req) {
      approvals.push(req);
      return options.approval;
    },
  };

  const fs = {
    async resolve(path) { return { path }; },
    async readText(target) {
      if (options.files && options.files[target.path] !== undefined) return options.files[target.path];
      throw new Error(`no such file: ${target.path}`);
    },
  };

  const ctx = {
    __tools: {},
    agentTeams,
    agents: { list: () => [leadAgent], get: (id) => (id === 'agent-lead' ? leadAgent : undefined) },
    tools: {
      register(definition) { ctx.__tools[definition.name] = definition; return () => {}; },
      guard(fn) { ctx.__guard = fn; return () => {}; },
    },
    systemPrompt: { section() { return () => {}; }, context() { return () => {}; }, getSectionOrder() { return 40; } },
    commands: { register(definition) { ctx.__handler = definition.handler; return () => {}; } },
    timer: { interval(fn) { ctx.__tick = fn; return () => {}; } },
    get(name) {
      if (name === 'storage') return storage;
      if (name === 'approval') return approval;
      if (name === 'fs') return fs;
      if (name === 'workingDirectory') return { get: () => options.cwd ?? '/workspace', defaultDirectory: '/workspace' };
      if (name === 'commands') return { list: () => [] };
      throw new Error(`cannot get property "${name}" without inject`);
    },
    effect(fn) { const disposer = fn(); return () => (typeof disposer === 'function' ? disposer() : undefined); },
    on() { return () => {}; },
    // A soft inject hands the callback a context that carries the service.
    inject(_deps, fn) { fn(ctx); return () => {}; },
    provide() { return () => {}; },
  };
  const leadAgent = { id: 'agent-lead', session: { id: 'agent-lead' } };
  // The plugin installs its tools in the agent's own context.
  leadAgent.ctx = { systemPrompt: ctx.systemPrompt, tools: ctx.tools };
  return { ctx, agentTeams, records, approvals, spawned, agent: leadAgent };
}

/* ------------------------------------------------------------- the tests -- */

console.log('the Config schema');
const { Config, DEFAULTS } = loadPlugin();
check('the schema is a standard schema', Boolean(Config?.['~standard']?.validate));
const empty = Config['~standard'].validate({});
check('an empty config is accepted', empty.value !== undefined && empty.issues === undefined);
check('the defaults are filled in', empty.value.ledgerLimit === DEFAULTS.ledgerLimit, JSON.stringify(empty.value));
const bad = Config['~standard'].validate({ watchdogIntervalMs: 5 });
check('an out-of-range value is refused', Array.isArray(bad.issues) && bad.issues.length === 1, JSON.stringify(bad));
check('the refusal names the field', bad.issues?.[0]?.path?.[0] === 'watchdogIntervalMs');
const good = Config['~standard'].validate({ watchdogIntervalMs: 30_000, autoReleaseStalled: false });
check('a valid override is kept', good.value.watchdogIntervalMs === 30_000 && good.value.autoReleaseStalled === false, JSON.stringify(good.value));
check('the untouched fields keep their defaults', good.value.stallAfterMs === DEFAULTS.stallAfterMs);

console.log('the durable routing ledger');
{
  const world = makeWorld();
  loadPlugin().apply(world.ctx, Config['~standard'].validate({}).value);
  await world.ctx.__handler({ agent: world.agent, rawInput: 'intake 写一份说明文档', signal: new AbortController().signal });
  // the write is fire and forget; give it a tick to land
  await new Promise((resolve) => setTimeout(resolve, 5));
  check('a routing decision is written down', Object.keys(world.records.ledger).length >= 1, JSON.stringify(world.records.ledger));
  check('the record carries the team', Object.values(world.records.ledger)[0]?.teamId === 'team-1');

  // a fresh instance reads the ledger back — the unit was closed, so the
  // "one live handle per unit" rule does not block it
  const second = makeWorld();
  second.records.ledger = { ...world.records.ledger };
  loadPlugin().apply(second.ctx, Config['~standard'].validate({}).value);
  const state = JSON.parse((await second.ctx.__handler({ agent: second.agent, rawInput: 'state', signal: new AbortController().signal })).text);
  check('a fresh instance restores the ledger', state.routes.length >= 1, JSON.stringify(state.routes));
  await second.ctx.__handler({ agent: second.agent, rawInput: 'intake 再来一条', signal: new AbortController().signal });
  await new Promise((resolve) => setTimeout(resolve, 5));
  check('a fresh instance can write into the same unit', Object.keys(second.records.ledger).length >= 2, JSON.stringify(Object.keys(second.records.ledger)));
  check('the persistence status reports the backend',
    JSON.parse((await second.ctx.__handler({ agent: second.agent, rawInput: 'state', signal: new AbortController().signal })).text).persistence === 'json');
}

console.log('the completion tracker');
{
  const world = makeWorld();
  loadPlugin().apply(world.ctx, Config['~standard'].validate({}).value);
  const task = await world.agentTeams.createTask(world.agent, { subject: '写单元测试', description: '' });
  await world.agentTeams.updateTask(world.agent, { taskId: task.id, expectedRevision: 1, action: 'claim' });
  // the board is looked at while the item is still in progress
  await world.ctx.__handler({ agent: world.agent, rawInput: 'state', signal: new AbortController().signal });
  await world.agentTeams.updateTask(world.agent, { taskId: task.id, expectedRevision: 2, action: 'complete' });
  const state = JSON.parse((await world.ctx.__handler({ agent: world.agent, rawInput: 'state', signal: new AbortController().signal })).text);
  check('a completion is noticed', state.completions.length === 1, JSON.stringify(state.completions));
  check('the completion names the Work Item', state.completions[0]?.taskId === task.id);
  check('the completion names the subject', state.completions[0]?.subject === '写单元测试');
  const again = JSON.parse((await world.ctx.__handler({ agent: world.agent, rawInput: 'state', signal: new AbortController().signal })).text);
  check('a completion is not counted twice', again.completions.length === 1, JSON.stringify(again.completions));
}

console.log('the approval seam');
{
  const world = makeWorld({ approval: 'allowed-once' });
  loadPlugin().apply(world.ctx, Config['~standard'].validate({}).value);
  const gate = await world.ctx.__tools.team_gate_request.execute(
    { kind: 'merge', subject: '合并插件', detail: '需要人工确认' },
    { agent: world.agent, signal: new AbortController().signal },
  );
  check('the gate is raised through the approval seam', world.approvals.length === 1, JSON.stringify(world.approvals));
  check('the approval request names the tool', world.approvals[0]?.toolName === 'team_gate_request', JSON.stringify(world.approvals[0]));
  check('the approval request carries a localized reason', Boolean(world.approvals[0]?.displayReason?.zh));
  check('an allowed gate is settled as approved', gate.status === 'approved', JSON.stringify(gate));
  check('the settled gate is completed on the board',
    world.agentTeams.listTasks().find((t) => t.subject.includes('合并插件'))?.status === 'completed');
}

console.log('the roster template');
{
  const roster = JSON.stringify({
    members: [
      { name: 'tester', description: '跑测试', prompt: '你是测试同学' },
      { name: 'reviewer', description: '看代码', prompt: '你是评审同学' },
    ],
  });
  const world = makeWorld({ files: { '/workspace/.team/roster.json': roster } });
  loadPlugin().apply(world.ctx, Config['~standard'].validate({}).value);
  const result = await world.ctx.__handler({ agent: world.agent, rawInput: 'template', signal: new AbortController().signal });
  check('the template is materialised', world.spawned.length === 2, JSON.stringify(world.spawned));
  check('the result reports the members', result.text.includes('tester') && result.text.includes('reviewer'), result.text);
}
{
  const world = makeWorld({ files: {} });
  loadPlugin().apply(world.ctx, Config['~standard'].validate({}).value);
  const result = await world.ctx.__handler({ agent: world.agent, rawInput: 'template', signal: new AbortController().signal });
  check('a missing roster is reported, not thrown', result.kind === 'error', JSON.stringify(result));
  check('the message says where to put it', result.text.includes('.team/roster.json'), result.text);
}

console.log('the stall recovery');
{
  const world = makeWorld({
    members: [
      { id: 'agent-lead', name: 'lead', role: 'lead', status: 'running', description: '', diagnostics: [] },
      { id: 'agent-t', name: 'tester', role: 'teammate', status: 'inactive', description: '', diagnostics: [] },
      { id: 'agent-d', name: 'dead', role: 'teammate', status: 'failed', description: '', diagnostics: ['boom'] },
    ],
  });
  loadPlugin().apply(world.ctx, Config['~standard'].validate({ stallAfterMs: 0 }).value);

  // a teammate that will not come back
  const stuck = await world.agentTeams.createTask(world.agent, { subject: '卡住的活', description: '' });
  await world.agentTeams.updateTask(world.agent, { taskId: stuck.id, expectedRevision: 1, action: 'claim' });
  world.agentTeams.tasks.get(stuck.id).ownerName = 'dead';
  world.agentTeams.tasks.get(stuck.id).status = 'in_progress';

  // a teammate that is merely idle
  const idle = await world.agentTeams.createTask(world.agent, { subject: '没人管的活', description: '' });
  await world.agentTeams.updateTask(world.agent, { taskId: idle.id, expectedRevision: 1, action: 'claim' });
  world.agentTeams.tasks.get(idle.id).ownerName = 'tester';
  world.agentTeams.tasks.get(idle.id).status = 'in_progress';

  world.ctx.__tick();
  await new Promise((resolve) => setTimeout(resolve, 5));
  world.ctx.__tick();
  await new Promise((resolve) => setTimeout(resolve, 5));

  const deadTask = world.agentTeams.getTask(world.agent, stuck.id);
  const idleTask = world.agentTeams.getTask(world.agent, idle.id);
  check('a failed owner loses the Work Item at once', deadTask.status === 'pending' && !deadTask.ownerName, JSON.stringify(deadTask));
  check('an idle owner loses the Work Item after the grace period', idleTask.status === 'pending' && !idleTask.ownerName, JSON.stringify(idleTask));
  check('a released Work Item can be claimed again', idleTask.ready === true, JSON.stringify(idleTask));
}
{
  const world = makeWorld({
    members: [
      { id: 'agent-lead', name: 'lead', role: 'lead', status: 'running', description: '', diagnostics: [] },
      { id: 'agent-t', name: 'tester', role: 'teammate', status: 'inactive', description: '', diagnostics: [] },
    ],
  });
  loadPlugin().apply(world.ctx, Config['~standard'].validate({ stallAfterMs: 0, autoReleaseStalled: false }).value);
  const idle = await world.agentTeams.createTask(world.agent, { subject: '不该被抢的活', description: '' });
  await world.agentTeams.updateTask(world.agent, { taskId: idle.id, expectedRevision: 1, action: 'claim' });
  world.agentTeams.tasks.get(idle.id).ownerName = 'tester';
  world.agentTeams.tasks.get(idle.id).status = 'in_progress';
  world.ctx.__tick();
  await new Promise((resolve) => setTimeout(resolve, 5));
  world.ctx.__tick();
  await new Promise((resolve) => setTimeout(resolve, 5));
  const task = world.agentTeams.getTask(world.agent, idle.id);
  check('the recovery can be switched off', task.status === 'in_progress' && task.ownerName === 'tester', JSON.stringify(task));
}

console.log(failures.length ? `\n${failures.length} FAILURE(S)` : '\nALL PASS');
process.exit(failures.length ? 1 : 0);
