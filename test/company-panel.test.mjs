/**
 * Render test for the Agent公司 dashboard ordering.
 *
 * The Chairman's complaint: the panel read like a company brochure. It must
 * open with "needs your decision" and "my projects"; org / workload / CEA
 * role card belong in a collapsed secondary fold.
 *
 * Run: node test/company-panel.test.mjs
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, '..', 'client.js'), 'utf8');

const failures = [];
function check(name, condition, detail) {
  if (condition) console.log(`  PASS  ${name}`);
  else { console.log(`  FAIL  ${name}${detail ? ' — ' + detail : ''}`); failures.push(name); }
}

/* ----------------------------------------------------------- React stub -- */
// Real React keeps hook state per component instance. Our stub does the same
// (keyed by component name + call order), otherwise a state update that adds
// children would shuffle hook slots and corrupt them.
const frames = new Map();
let callCounts = new Map();
let currentFrame = null;
const pendingEffects = [];

function frameFor(fn) {
  const n = callCounts.get(fn) || 0;
  callCounts.set(fn, n + 1);
  const key = `${fn.name || 'anon'}:${n}`;
  let frame = frames.get(key);
  if (!frame) { frame = { state: [], index: 0 }; frames.set(key, frame); }
  frame.index = 0;
  return frame;
}
function useState(initial) {
  const f = currentFrame;
  const index = f.index++;
  if (f.state.length <= index) f.state[index] = typeof initial === 'function' ? initial() : initial;
  const set = (next) => { f.state[index] = typeof next === 'function' ? next(f.state[index]) : next; };
  return [f.state[index], set];
}
function useEffect(effect) { pendingEffects.push(effect); }
function useMemo(factory) { return factory(); }
function useCallback(fn) { return fn; }
function useRef(initial) { return { current: initial }; }
function createElement(type, props, ...children) {
  if (typeof type === 'function') {
    const frame = frameFor(type);
    const previous = currentFrame;
    currentFrame = frame;
    try { return type({ ...(props || {}), children }); }
    finally { currentFrame = previous; }
  }
  return { type, props: { ...(props || {}), children } };
}
const React = { createElement, useState, useEffect, useMemo, useCallback, useRef };

/* --------------------------------------------------------- plugin loader -- */
const registrations = new Map();
let dictionaries = {};
globalThis.window = {
  __ModuleLoader__: {
    load(config) {
      const plugin = config.factory((name) => {
        if (name === 'react') return React;
        throw new Error(`the panel must not require "${name}"`);
      });
      globalThis.__satCoPlugin = plugin;
    },
  },
};
// eslint-disable-next-line no-new-func
new Function(source)();
const plugin = globalThis.__satCoPlugin;

/* ------------------------------------------------------------ fake world -- */
const COMPANY_STATE = {
  version: 1,
  company: {
    name: 'Agent公司',
    chairman: '董事长（你）',
    cea: { identity: '公司的经营者', mission: '把意图变成成果', capabilities: [], requirements: [], habits: [], delegatedAuthority: [], forbidden: [], acceptance: '' },
    model: 'A',
    headquarters: { bound: true, workspaceId: 'ws-hq', sessionId: 's-hq', title: '董事长办公室' },
    charter: [{ id: 'c1', question: '运行模型', decision: 'A', rationale: 'x', status: 'locked', decidedAt: '2026-11-04' }],
  },
  departments: [{ id: 'd1', name: '研发', mission: 'm', positionIds: ['pos-a'] }],
  positions: [{ id: 'pos-a', name: '插件研发工程师', status: 'active', jd: { mission: 'm' }, leader: { name: 'a-lead', capabilities: [] }, headcount: 1, load: 0 }],
  pms: [{ id: 'pm-1', name: '工具类 PM', class: '工具类', knowledge: [{ topic: 'K', summary: 'S' }], projects: [] }],
  projects: [
    { id: 'proj-1', title: 'DSH 插件体系', status: 'executing', goal: '把调度范式落到 DSH', pmId: 'pm-1', workItems: ['Router', '工单', '硬闸'], positionIds: ['pos-a'], deliverable: '', ceaReview: '', chairmanDecision: '' },
    { id: 'proj-2', title: 'Agent 公司化改造', status: 'acceptance', goal: '升级为公司制', pmId: 'pm-1', workItems: ['组织层'], positionIds: [], deliverable: '方案 + 面板', ceaReview: 'CEA 已自审', chairmanDecision: '' },
  ],
  decisions: [
    { id: 'dec-1', kind: 'requirement', subject: '需求确认：补一份部门岗位说明', detail: 'CEA 的理解…', status: 'pending', projectId: 'proj-1', createdAt: '2026-11-04',
      routing: { project: { mode: 'existing', title: 'DSH插件' }, task: { mode: 'new', title: '补说明' }, reason: '命中存量工作区' } },
    { id: 'dec-2', kind: 'deliverable', subject: '验收：Agent 公司化改造', detail: '成果…', status: 'pending', projectId: 'proj-2', createdAt: '2026-11-04' },
  ],
  events: [{ kind: 'company', text: '公司成立', at: '2026-11-04' }],
  _current: { sessionId: 'session-a', workspaceId: 'ws-1', workspaceTitle: 'DSH插件' },
  inventory: { workspaces: [{ id: 'ws-1', title: 'DSH插件', path: '/ws' }], sessions: [], byWorkspace: {} },
};

const executed = [];
const ctx = {
  slots: {
    inject(_key, callback) { callback(); return () => {}; },
    register(options, component) {
      registrations.set(`${options.name}:${options.id ?? options.key ?? ''}`, component);
      return () => {};
    },
  },
  locale: {
    register(ns, first, second) {
      if (typeof first === 'string') dictionaries[first] = second;
      else dictionaries[ns] = first;
      return () => {};
    },
    bind(ns) {
      const table = (dictionaries[ns] || {}).zh || {};
      return (key) => table[key] !== undefined ? table[key] : key;
    },
  },
  remote: {
    commands: {
      execute: async (_sessionId, line) => {
        executed.push(line);
        if (line === '/company state') return JSON.stringify(COMPANY_STATE);
        return 'ok';
      },
    },
  },
  get(name) {
    if (name === 'commands') return { register() { return () => {}; } };
    throw new Error(`cannot get property "${name}" without inject`);
  },
  effect(fn) { fn(); return () => {}; },
  on() { return () => {}; },
  inject(_deps, fn) { fn(ctx); return () => {}; },
  provide() { return () => {}; },
};

plugin.apply(ctx);
const CompanyPanel = registrations.get('main:super-agent-company');
check('the global Agent公司 panel is registered', typeof CompanyPanel === 'function');

/* ---------------------------------------------------------------- render -- */
function textOf(node, out = []) {
  if (node === null || node === undefined || node === false) return out;
  if (typeof node === 'string' || typeof node === 'number') { out.push(String(node)); return out; }
  if (Array.isArray(node)) { node.forEach((child) => textOf(child, out)); return out; }
  if (node.type === 'style') return out;
  if (node.props) textOf(node.props.children, out);
  return out;
}

function classNames(node, out = []) {
  if (!node || typeof node !== 'object') return out;
  if (Array.isArray(node)) { node.forEach((child) => classNames(child, out)); return out; }
  if (node.props) {
    if (node.props.className) out.push(node.props.className);
    classNames(node.props.children, out);
  }
  return out;
}

async function renderPanel() {
  let tree = null;
  for (let pass = 0; pass < 5; pass += 1) {
    callCounts = new Map();
    pendingEffects.length = 0;
    const root = frameFor(CompanyPanel);
    const previous = currentFrame;
    currentFrame = root;
    try {
      tree = CompanyPanel({
        useSessions: (selector) => selector({ byId: { 'session-a': { running: true } } }),
      });
    } finally { currentFrame = previous; }
    for (const effect of pendingEffects) await effect();
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  return tree;
}

const tree = await renderPanel();
const text = textOf(tree).join(' ');
const at = (needle) => text.indexOf(needle);

console.log('the panel opens with decisions and projects');
check('the panel loads the company state over the command channel',
  executed.includes('/company state'), executed.join(','));
check('"需要我决策" is rendered', at('需要我决策') >= 0);
check('"我的项目" is rendered', at('我的项目') >= 0);
check('decisions come before projects', at('需要我决策') >= 0 && at('我的项目') > at('需要我决策'),
  `decisions@${at('需要我决策')} projects@${at('我的项目')}`);
check('projects come before the brief box',
  at('我的项目') < at('给 CEA 派任务'), `projects@${at('我的项目')} brief@${at('给 CEA 派任务')}`);
check('both project titles are visible', at('DSH 插件体系') >= 0 && at('Agent 公司化改造') >= 0);
check('both pending decisions are visible',
  at('需求确认：补一份部门岗位说明') >= 0 && at('验收：Agent 公司化改造') >= 0);
check('project status is shown', at('待你验收') >= 0 && at('进行中') >= 0);
check('project work items are shown', at('Router') >= 0 && at('工单') >= 0);
check('project/task routing is surfaced on the decision', at('项目 = 工作区') >= 0);
check('the HQ binding is shown in the header', at('董事长办公室') >= 0);

console.log('the company introduction is demoted to a collapsed fold');
check('the CEA role card is NOT in the initial view', at('CEA · 岗位说明书') < 0);
const classes = classNames(tree);
check('no department org-chart blocks in the initial view', !classes.includes('sat-co-dept'), classes.join(','));
check('no CEA role boxes in the initial view', !classes.includes('sat-co-role-box'));
check('no charter cards section in the initial view', !classes.includes('sat-co-charter'));
check('no workspace/session inventory in the initial view', at('/ws') < 0);
check('exactly one collapsible fold wraps the secondary content',
  classes.filter((c) => c === 'sat-co-fold').length === 1);
check('the charter is NOT in the initial view', at('治理章程（已拍板）') < 0);
check('the secondary fold header IS present (one click away)', at('次要') >= 0);

console.log(failures.length ? `\n${failures.length} FAILURE(S)` : '\nALL PASS');
process.exit(failures.length ? 1 : 0);
