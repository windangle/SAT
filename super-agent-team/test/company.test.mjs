/**
 * Agent Company layer tests.
 *
 * The company org state is profile-wide (ctx.storage KV), not session-scoped.
 * These tests drive the real plugin code through a fake Host that reproduces
 * the KV backend's one-live-handle rule and the command/tool registries.
 *
 * Run: node test/company.test.mjs
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

function loadPlugin() {
  const module = { exports: {} };
  // eslint-disable-next-line no-new-func
  new Function('module', 'exports', source.replace(/^export /gm, '') + '\nmodule.exports = { apply, Config };')(module, module.exports);
  return module.exports;
}

function makeWorld() {
  const records = { org: {} };
  const commands = {};
  const tools = {};
  const leadAgent = { id: 'agent-lead', session: { id: 'agent-lead' } };
  const world = { knowledge: null };

  const storage = {
    backend: {
      openUnits: new Set(),
      get(name) {
        if (name !== 'json') return undefined;
        const self = this;
        return {
          kv: {
            async open(descriptor) {
              if (self.openUnits.has(descriptor.name)) {
                throw new Error(`unit '${descriptor.name}' is already open; a unit has exactly one live handle`);
              }
              self.openUnits.add(descriptor.name);
              return {
                async loadAll() {
                  return { tables: { org: { ...records.org } }, global: undefined };
                },
                async putRecord(table, key, value) {
                  if (!/^[a-zA-Z0-9_-]+$/.test(key)) throw new Error(`per-record key '${key}' is not path-safe`);
                  records[table][key] = value;
                },
                async deleteRecord(table, key) { delete records[table][key]; },
                async close() { self.openUnits.delete(descriptor.name); },
              };
            },
          },
        };
      },
    },
  };

  const ctx = {
    agentTeams: {
      listMembers: () => [{ id: 'lead', name: 'lead', role: 'lead', status: 'running', description: '', diagnostics: [] }],
      listTasks: () => [],
      tryMembership: (agent) => (agent ? { root: agent, id: 'team-1', role: 'lead', name: 'lead' } : undefined),
      getTask: () => undefined,
      createTask: async () => ({ id: 'task-x', revision: 1 }),
      updateTask: async () => ({ id: 'task-x', revision: 2 }),
      spawnTeammate: async () => ({ member: { name: 'x' } }),
    },
    agents: { list: () => [leadAgent], get: (id) => (id === 'agent-lead' ? leadAgent : undefined) },
    tools: {
      register(definition) { tools[definition.name] = definition; return () => {}; },
      guard() { return () => {}; },
    },
    systemPrompt: { section() { return () => {}; }, getSectionOrder() { return 40; } },
    commands: {
      register(definition) { commands[definition.name] = definition; return () => {}; },
      list: () => Object.keys(commands),
    },
    timer: { interval() { return () => {}; } },
    get(name) {
      if (name === 'storage') return storage;
      if (name === 'workspaceRegistry') {
        return { list: () => [{ id: 'ws-1', title: 'DSH插件', path: '/ws/dsh', sessionIds: ['agent-lead', 'session-a', 'session-b'] }] };
      }
      if (name === 'sessions') {
        const all = {
          'session-a': { id: 'session-a', title: 'SuperAgentTeam插件方案与演示' },
          'session-b': { id: 'session-b', title: '个人工作台插件' },
        };
        return { list: () => Object.values(all), get: (id) => all[id] };
      }
      if (name === 'sessionTitle') {
        return { get: (session) => ({ title: session.title }), rename: () => ({}) };
      }
      if (name === 'sessionController') return undefined;
      if (name === 'approval') return undefined;
      if (name === 'fs') {
        return {
          resolve: async (path) => ({ path }),
          readText: async () => '',
          writeText: async (target, content, _expected, _signal, policy) => {
            world.knowledge = { path: target.path, content, policy };
            return {};
          },
        };
      }
      if (name === 'workingDirectory') return { get: () => '/workspace', defaultDirectory: '/workspace' };
      if (name === 'commands') return ctx.commands;
      throw new Error(`cannot get property "${name}" without inject`);
    },
    effect(fn) { const disposer = fn(); return () => (typeof disposer === 'function' ? disposer() : undefined); },
    on() { return () => {}; },
    inject(_deps, fn) { fn(ctx); return () => {}; },
    provide() { return () => {}; },
  };
  leadAgent.ctx = { systemPrompt: ctx.systemPrompt, tools: ctx.tools };

  return { ctx, records, commands, tools, agent: leadAgent, get knowledge() { return world.knowledge; } };
}

async function run(world, line) {
  const handler = world.commands.company.handler;
  return await handler({ agent: world.agent, rawInput: line, signal: new AbortController().signal });
}

async function state(world) {
  const result = await run(world, 'state');
  return JSON.parse(result.text);
}

/* --------------------------------------------------------------- tests -- */

console.log('the company org is seeded');
const { apply, Config } = loadPlugin();
check('the Config schema is still a standard schema', Boolean(Config?.['~standard']?.validate));
{
  const world = makeWorld();
  apply(world.ctx, Config['~standard'].validate({}).value);
  check('the /company command is registered', typeof world.commands.company?.handler === 'function');
  const org = await state(world);
  check('the org has a chairman and a CEA', Boolean(org.company?.chairman && org.company?.cea?.name === 'CEA'));
  check('the org has active positions with JDs', org.positions.length >= 10 && org.positions.every((p) => p.jd?.mission !== undefined));
  check('the org has departments grouping positions', org.departments.length >= 4 && org.departments.every((d) => d.positionIds.length > 0));
  check('every position belongs to a department', org.positions.every((p) => org.departments.some((d) => d.positionIds.includes(p.id))));
  check('planned positions are marked 待招', org.positions.some((p) => p.status === 'planned'));
  check('there are 3 PMs each owning a project class', org.pms.length === 3 && org.pms.every((pm) => pm.class && pm.knowledge.length >= 1));
  check('each position Leader owns a capability ledger', org.positions.every((p) => Array.isArray(p.leader?.capabilities)));
  const cea = org.company.cea;
  check('CEA has a structured identity', Boolean(cea.identity && cea.mission && cea.reportsTo));
  check('CEA has capabilities, requirements and habits',
    cea.capabilities.length >= 6 && cea.requirements.length >= 5 && cea.habits.length >= 5);
  check('CEA has an authority boundary and forbidden list',
    cea.delegatedAuthority.length >= 1 && cea.forbidden.length >= 3 && Boolean(cea.acceptance));
  check('the company is named Agent公司', org.company.name === 'Agent公司');
  check('PMs own business knowledge', org.pms.length >= 1 && org.pms.every((pm) => Array.isArray(pm.knowledge)));
  check('the state carries the current workspace', org._current?.workspaceTitle === 'DSH插件', JSON.stringify(org._current));
}

console.log('CEA side: tools exist, chairman decisions do not');
{
  const world = makeWorld();
  apply(world.ctx, Config['~standard'].validate({}).value);
  const names = Object.keys(world.tools);
  for (const name of ['company_status', 'company_brief', 'company_position_design', 'company_dispatch', 'company_deliver']) {
    check(`model has ${name}`, names.includes(name));
  }
  check('the model has NO approve tool', !names.some((n) => /approve|reject/i.test(n)), names.join(','));
}

console.log('CEA briefs and waits for the chairman');
{
  const world = makeWorld();
  apply(world.ctx, Config['~standard'].validate({}).value);
  const before = await state(world);
  await run(world, 'brief 做一个移动端审批卡片');
  const after = await state(world);
  check('a new project is created', after.projects.length === before.projects.length + 1);
  check('the project waits for the requirement to be confirmed',
    after.projects[after.projects.length - 1].status === 'confirming');
  const decision = after.decisions.find((d) => d.kind === 'requirement' && d.status === 'pending');
  check('a requirement decision is raised', Boolean(decision));
  check('the CEA restates the requirement', decision?.detail.includes('做一个移动端审批卡片'));

  await run(world, 'approve ' + decision.id);
  const settled = await state(world);
  check('the chairman can confirm the requirement',
    settled.decisions.find((d) => d.id === decision.id)?.status === 'approved');
  check('a confirmed requirement lets the project execute',
    settled.projects.find((p) => p.id === decision.projectId)?.status === 'executing');
}

console.log('CEA designs a position, the chairman approves the JD');
{
  const world = makeWorld();
  apply(world.ctx, Config['~standard'].validate({}).value);
  const before = await state(world);
  await run(world, 'position 安全工程师 | 负责依赖审计与越权检查');
  const draft = await state(world);
  const decision = draft.decisions.find((d) => d.kind === 'position' && d.status === 'pending');
  check('a JD decision is raised', Boolean(decision));
  check('the position is not active before approval',
    !draft.positions.some((p) => p.name === '安全工程师'));
  await run(world, 'approve ' + decision.id);
  const approved = await state(world);
  const position = approved.positions.find((p) => p.name === '安全工程师');
  check('the chairman approval creates the position', Boolean(position));
  check('the new position has a Leader and a JD', Boolean(position?.leader?.name && position?.jd?.mission));
  check('the org grew by one position', approved.positions.length === before.positions.length + 1);
}

console.log('CEA dispatches to a position, not a person');
{
  const world = makeWorld();
  apply(world.ctx, Config['~standard'].validate({}).value);
  const before = await state(world);
  await run(world, 'dispatch proj-dsh-plugins | pos-plugin-dev | 实现公司总览面板');
  const after = await state(world);
  const position = after.positions.find((p) => p.id === 'pos-plugin-dev');
  check('the position load increases', position.load === before.positions.find((p) => p.id === 'pos-plugin-dev').load + 1);
  check('the work item is recorded on the project',
    after.projects.find((p) => p.id === 'proj-dsh-plugins').workItems.includes('实现公司总览面板'));
  check('a low-load position has its Leader work directly',
    after.events[0].text.includes('Leader 直接干'), after.events[0].text);
}

console.log('delivery is complete only after the chairman accepts');
{
  const world = makeWorld();
  apply(world.ctx, Config['~standard'].validate({}).value);
  const before = await state(world);
  const pending = before.decisions.find((d) => d.kind === 'deliverable' && d.status === 'pending');
  check('a deliverable decision is pending by default', Boolean(pending));
  await run(world, 'reject ' + pending.id + ' | 需要补上岗位能力积累的证据');
  const rejected = await state(world);
  check('the chairman can reject a delivery',
    rejected.decisions.find((d) => d.id === pending.id)?.status === 'rejected');
  check('a rejected delivery is not complete',
    rejected.projects.find((p) => p.id === pending.projectId)?.status === 'executing');

  // a fresh delivery
  await run(world, 'deliver proj-company | 公司总览面板 + 文档 | CEA 自审通过。');
  const delivered = await state(world);
  const fresh = delivered.decisions.find((d) => d.kind === 'deliverable' && d.status === 'pending');
  await run(world, 'approve ' + fresh.id);
  const accepted = await state(world);
  check('the chairman can accept a delivery',
    accepted.projects.find((p) => p.id === fresh.projectId)?.chairmanDecision === 'accepted');
  check('an accepted project is complete',
    accepted.projects.find((p) => p.id === fresh.projectId)?.status === 'accepted');
}

console.log('the company survives a plugin reload (profile-wide state)');
{
  const world = makeWorld();
  apply(world.ctx, Config['~standard'].validate({}).value);
  await run(world, 'brief 立项一个跨工作区项目');
  const first = await state(world);

  const second = makeWorld();
  second.records.org = { ...world.records.org };
  apply(second.ctx, Config['~standard'].validate({}).value);
  const restored = await state(second);
  check('a fresh plugin instance reads the same org', restored.projects.length === first.projects.length);
  check('the pending decisions are restored', restored.decisions.length === first.decisions.length);
}

console.log('CEA confirms the project (=workspace) and task (=session) before dispatch');
{
  const world = makeWorld();
  apply(world.ctx, Config['~standard'].validate({}).value);
  const seeded = await state(world);
  check('the state enumerates real workspaces', seeded.inventory.workspaces[0]?.title === 'DSH插件');
  check('the state enumerates real sessions with titles',
    seeded.inventory.byWorkspace['ws-1'].some((x) => x.title === 'SuperAgentTeam插件方案与演示'),
    JSON.stringify(seeded.inventory.byWorkspace));

  // A task that names an existing workspace → route into the existing project
  await run(world, 'brief 在 DSH插件 里补一份部门岗位预设说明');
  const proposed = await state(world);
  const decision = proposed.decisions.find((d) => d.kind === 'requirement' && d.status === 'pending');
  check('a requirement decision carries a routing proposal', Boolean(decision.routing));
  check('the CEA proposes the existing workspace for a matching task',
    decision.routing.project.mode === 'existing' && decision.routing.project.workspaceId === 'ws-1',
    JSON.stringify(decision.routing.project));
  check('the decision text shows the project/task positioning',
    decision.detail.includes('项目 / 任务定位') && decision.detail.includes('一个工作区对应一个项目'));

  // The chairman overrides the routing before approving
  await run(world, 'route ' + decision.id + ' | 新:移动审批 | 新:移动端审批卡片');
  const rerouted = await state(world);
  const changed = rerouted.decisions.find((d) => d.id === decision.id);
  check('the chairman can change the project to a new workspace',
    changed.routing.project.mode === 'new' && changed.routing.project.title === '移动审批',
    JSON.stringify(changed.routing.project));
  check('the chairman can change the task to a new session',
    changed.routing.task.mode === 'new' && changed.routing.task.title === '移动端审批卡片');
  check('a route change is written to the audit log',
    rerouted.events.some((e) => e.kind === 'route'));

  // Approving materializes the routing
  await run(world, 'approve ' + decision.id);
  const approved = await state(world);
  const project = approved.projects.find((p) => p.id === decision.projectId);
  check('approval records the routing on the project', Boolean(project.routing));
  check('a new workspace is not created behind the chairman\'s back',
    Boolean(project.provisioning && project.provisioning.workspace === '移动审批'),
    JSON.stringify(project.provisioning));
  check('one workspace = one project, one session = one task is stated',
    approved.decisions.find((d) => d.id === decision.id).detail.includes('一个会话对应一个任务'));

  // The chairman creates them in the GUI, then binds the real ids
  await run(world, 'bind ' + project.id + ' | ws-99 | session-99');
  const bound = await state(world);
  const boundProject = bound.projects.find((p) => p.id === project.id);
  check('the chairman can bind real workspace/session ids',
    boundProject.workspaceId === 'ws-99' && boundProject.sessionId === 'session-99');
  check('binding clears the pending provisioning', !boundProject.provisioning);
}

console.log('the three architecture decisions are settled');
{
  const world = makeWorld();
  apply(world.ctx, Config['~standard'].validate({}).value);
  const org = await state(world);
  check('the operating model is A', org.company.model === 'A');
  check('all three decisions are locked in the charter',
    org.company.charter.length === 3 && org.company.charter.every((c) => c.status === 'locked' && c.rationale));
  check('model B is explicitly deferred, not improvised',
    org.company.charter.some((c) => c.id === 'charter-model' && c.rationale.includes('模型 B')));
  check('CEA HQ is a dedicated workspace+session',
    org.company.charter.some((c) => c.id === 'charter-hq' && c.decision.includes('总部')));
  check('knowledge policy keeps both KV and plain text',
    Boolean(org.company.knowledgePolicy?.structure && org.company.knowledgePolicy?.prose));

  // HQ binding
  await run(world, 'hq ws-hq | session-hq | 董事长办公室');
  const bound = await state(world);
  check('the chairman can bind the CEA HQ',
    bound.company.headquarters.bound && bound.company.headquarters.workspaceId === 'ws-hq');
  check('binding HQ is audited', bound.events.some((e) => e.kind === 'governance'));

  // Knowledge export
  const exported = await run(world, 'export');
  check('export reports a file', /\.agent-company\.md/.test(exported.text), exported.text);
  check('plain-text knowledge was written', Boolean(world.knowledge));
  check('export writes inside the target workspace, no escalation',
    world.knowledge?.policy?.mode === 'workspace-write' &&
    world.knowledge?.policy?.workspaceRoot === '/ws/dsh' &&
    world.knowledge?.path === '/ws/dsh/.agent-company.md',
    JSON.stringify(world.knowledge?.policy));
  const text = world.knowledge?.content || '';
  check('plain text carries PM business knowledge', text.includes('PM 业务知识') && text.includes('DSH 插件产物'));
  check('plain text carries project memory', text.includes('项目一览') && text.includes('DSH 插件体系'));
  check('plain text carries position capability ledgers', text.includes('岗位能力档案') && text.includes('Cordis 插件架构'));
  check('plain text carries the settled charter', text.includes('治理章程') && text.includes('单 CEA 总部会话'));
  const after = await state(world);
  check('export is recorded on the company', Boolean(after.company.lastKnowledgeExport?.file));
  check('export is audited', after.events.some((e) => e.kind === 'knowledge'));
}

console.log('the charter survives a reload and back-fills older state');
{
  const world = makeWorld();
  apply(world.ctx, Config['~standard'].validate({}).value);
  const legacy = await state(world);
  delete legacy.company.charter;
  delete legacy.company.headquarters;
  delete legacy.company.model;
  delete legacy.departments;
  world.records.org.main = legacy;

  const second = makeWorld();
  second.records.org.main = { ...world.records.org.main };
  apply(second.ctx, Config['~standard'].validate({}).value);
  const migrated = await state(second);
  check('an older state gets the charter back-filled', migrated.company.charter.length === 3);
  check('an older state gets departments back-filled', migrated.departments.length >= 4);
  check('back-fill does not lose existing projects', migrated.projects.length === 2);
}

console.log(failures.length ? `\n${failures.length} FAILURE(S)` : '\nALL PASS');
process.exit(failures.length ? 1 : 0);
