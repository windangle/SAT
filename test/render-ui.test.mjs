/**
 * Offline UI test for the SuperAgentTeam control deck.
 *
 * This is a sibling of `render.test.mjs` — it copies that file's miniature
 * React renderer rather than importing it, so the two can move independently.
 * On top of the render assertions it checks two behaviours that need a
 * controllable clock:
 *
 *   1. the "Recently completed" section, and
 *   2. the conditional poll: the panel must not hammer the Host every eight
 *      seconds when the board is quiet and nothing is unsettled.
 *
 * Run: node test/render-ui.test.mjs
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, '..', 'client.js'), 'utf8');

/* ------------------------------------------------------------- fake clock -- */

const realSetTimeout = globalThis.setTimeout;
const realClearTimeout = globalThis.clearTimeout;

let clockNow = 0;
let timerSeq = 0;
const timers = new Map();

globalThis.setTimeout = (fn, delay) => {
  const id = ++timerSeq;
  timers.set(id, { fn, at: clockNow + (delay || 0) });
  return id;
};
globalThis.clearTimeout = (id) => { timers.delete(id); };

/** Move the clock forward, running the timers that come due. */
async function advance(ms) {
  const target = clockNow + ms;
  for (;;) {
    const due = [...timers.entries()]
      .filter(([, timer]) => timer.at <= target)
      .sort((a, b) => a[1].at - b[1].at || a[0] - b[0]);
    if (!due.length) break;
    const [id, timer] = due[0];
    timers.delete(id);
    clockNow = timer.at;
    await timer.fn();
    // Let the promise chain of the tick settle before the next timer.
    for (let i = 0; i < 5; i += 1) await Promise.resolve();
  }
  clockNow = target;
}

/* ----------------------------------------------------------- React stub -- */

const stateSlots = [];
const memoSlots = [];
const effectSlots = [];
const callbackSlots = [];
const refSlots = [];
let slotIndex = 0;

function depsChanged(previous, deps) {
  if (!previous || !previous.deps || !deps) return true;
  if (previous.deps.length !== deps.length) return true;
  return deps.some((dep, i) => !Object.is(dep, previous.deps[i]));
}

function useState(initial) {
  const index = slotIndex++;
  if (!stateSlots[index]) {
    stateSlots[index] = { value: typeof initial === 'function' ? initial() : initial };
  }
  const set = (next) => {
    const slot = stateSlots[index];
    slot.value = typeof next === 'function' ? next(slot.value) : next;
  };
  return [stateSlots[index].value, set];
}

function useMemo(factory, deps) {
  const index = slotIndex++;
  const previous = memoSlots[index];
  if (depsChanged(previous, deps)) memoSlots[index] = { deps: deps ? [...deps] : undefined, value: factory() };
  return memoSlots[index].value;
}

function useCallback(fn, deps) {
  const index = slotIndex++;
  const previous = callbackSlots[index];
  if (depsChanged(previous, deps)) callbackSlots[index] = { deps: deps ? [...deps] : undefined, value: fn };
  return callbackSlots[index].value;
}

function useEffect(effect, deps) {
  const index = slotIndex++;
  const previous = effectSlots[index];
  if (depsChanged(previous, deps)) {
    effectSlots[index] = { deps: deps ? [...deps] : undefined, cleanup: undefined };
    pendingEffects.push(() => {
      if (previous && typeof previous.cleanup === 'function') previous.cleanup();
      const disposer = effect();
      effectSlots[index].cleanup = typeof disposer === 'function' ? disposer : undefined;
    });
  }
}

function useRef(initial) {
  const index = slotIndex++;
  if (!refSlots[index]) refSlots[index] = { current: initial };
  return refSlots[index];
}

function createElement(type, props, ...children) {
  // React calls function components during render; the stub does the same so
  // the component tree is fully expanded.
  if (typeof type === 'function') return type({ ...(props || {}), children });
  return { type, props: { ...(props || {}), children } };
}

const React = { createElement, useState, useEffect, useMemo, useCallback, useRef };

let pendingEffects = [];

/* --------------------------------------------------------- plugin loader -- */

let registered = null;
const dictionaries = {};
globalThis.window = {
  __ModuleLoader__: {
    load(config) {
      const plugin = config.factory((name) => {
        if (name === 'react') return React;
        throw new Error(`the panel must not require "${name}"`);
      });
      globalThis.__satPlugin = plugin;
    },
  },
};

// eslint-disable-next-line no-new-func
new Function(source)();

const plugin = globalThis.__satPlugin;

/* ------------------------------------------------------------ fake world -- */

const BASE_MEMBERS = [
  { name: 'lead', role: 'lead', status: 'inactive', description: '', model: 'MiniMax-M3.1-Flash', provider: '', diagnostics: [] },
  { name: 'tester', role: 'teammate', status: 'inactive', description: 'Run end-to-end 测试.', model: 'MiniMax-M3.1-Flash', provider: 'spawn', diagnostics: [] },
];

const BASE_TASKS = [
  { id: 'task-1', revision: 1, subject: '[GATE:merge] 合并插件', displaySubject: '合并插件', description: '', status: 'completed', owner: 'lead', blockedBy: [], ready: false, writeScopes: [], writeScopeWarnings: [], gate: 'merge' },
  { id: 'task-2', revision: 2, subject: '端到端测试与 UI 验收', displaySubject: '端到端测试与 UI 验收', description: '', status: 'completed', owner: 'tester', blockedBy: [], ready: false, writeScopes: [], writeScopeWarnings: [], gate: null },
];

/** A quiet board: nothing pending, nothing running, nothing to settle. */
const QUIET_STATE = {
  teamId: 'session-lead',
  role: 'lead',
  name: 'lead',
  members: BASE_MEMBERS,
  tasks: BASE_TASKS,
  gates: [{ id: 'task-1', kind: 'merge', subject: '合并插件', detail: '', status: 'approved', revision: 1 }],
  packages: [],
  routes: [],
  alerts: [],
};

const BUSY_STATE = {
  ...QUIET_STATE,
  gates: [{ id: 'task-1', kind: 'merge', subject: '合并插件', detail: '', status: 'pending', revision: 1 }],
};

/** The projection; the test swaps it to simulate the board moving. */
let projection = {
  members: [
    { id: 'session-lead', name: 'lead', role: 'lead', phase: 'active' },
    { id: 'session-t', name: 'tester', role: 'teammate', phase: 'active' },
  ],
  tasks: [
    { id: 'task-2', revision: 2, subject: '端到端测试与 UI 验收', description: '', status: 'completed', blockedBy: [], writeScopes: [], ownerName: 'tester', ready: false, writeScopeWarnings: [] },
  ],
};

let hostState = QUIET_STATE;
const calls = [];
const commands = {
  async execute(sessionId, line, attachments, signal) {
    calls.push({ sessionId, line, at: clockNow });
    if (line === '/super-team state') return { kind: 'success', text: JSON.stringify(hostState) };
    return { kind: 'success', text: 'ok' };
  },
};

function makeContext(injected) {
  const context = {
    slots: {
      inject(_key, callback) { callback(); return () => {}; },
      register(options, component) { registered = { options, component }; return () => {}; },
    },
    locale: {
      register(ns, first, second) {
        if (typeof first === 'string') dictionaries[first] = second;
        else dictionaries[ns] = first;
        return () => {};
      },
      bind() {
        return (key, params) => {
          const table = Object.values(dictionaries)[0] || {};
          const english = table.en || {};
          let text = english[key] !== undefined ? english[key] : key;
          if (params) {
            for (const [name, value] of Object.entries(params)) text = text.split('{' + name + '}').join(String(value));
          }
          return text;
        };
      },
    },
    get(name) {
      if (!injected.includes(name)) throw new Error(`cannot get property "${name}" without inject`);
      return undefined;
    },
    effect(fn) { const disposer = fn(); return () => (typeof disposer === 'function' ? disposer() : undefined); },
    on() { return () => {}; },
  };
  context.remote = { commands };
  context.remoteCommands = { commands };
  return context;
}

/* ---------------------------------------------------------------- render -- */

const injected = plugin.inject ?? [];
const ctx = makeContext(injected);
plugin.apply(ctx);
if (!registered) throw new Error('the plugin did not register a view');

let currentSessionId = 'session-lead';
const props = {
  get sessionId() { return currentSessionId; },
  useSession: (selector) => selector({ subagent: undefined, openState: 'ready' }),
  useSessions: (selector) => selector({
    phase: 'ready',
    projectionsBySession: { 'session-lead': { values: { agentTeam: projection } } },
    byId: {},
  }),
};

async function render(passes = 4) {
  let tree = null;
  for (let pass = 0; pass < passes; pass += 1) {
    slotIndex = 0;
    pendingEffects = [];
    tree = registered.component(props);
    const effects = pendingEffects;
    pendingEffects = [];
    for (const effect of effects) effect();
    for (let i = 0; i < 5; i += 1) await Promise.resolve();
  }
  return tree;
}

/**
 * Unmount whatever is mounted and start over.
 *
 * The miniature renderer keeps its hook slots between renders, exactly like
 * React keeps its own state. A scenario that needs a fresh mount — the panel
 * opening, a session switch — has to reset them, otherwise the poll effect
 * does not re-run and the panel never pulls the snapshot again.
 */
async function freshMount() {
  for (const slot of effectSlots) {
    if (slot && typeof slot.cleanup === 'function') slot.cleanup();
  }
  stateSlots.length = 0;
  memoSlots.length = 0;
  effectSlots.length = 0;
  callbackSlots.length = 0;
  refSlots.length = 0;
  timers.clear();
  calls.length = 0;
  return render();
}

function textOf(node, out = []) {
  if (node === null || node === undefined || node === false) return out;
  if (typeof node === 'string' || typeof node === 'number') { out.push(String(node)); return out; }
  if (Array.isArray(node)) { node.forEach((child) => textOf(child, out)); return out; }
  if (node.type === 'style') return out;
  if (node.props) textOf(node.props.children, out);
  return out;
}

/* --------------------------------------------------------------- asserts -- */

const failures = [];
function check(name, condition, detail) {
  if (condition) console.log(`  PASS  ${name}`);
  else { console.log(`  FAIL  ${name}${detail ? ' — ' + detail : ''}`); failures.push(name); }
}

/* ------------------------------------------------- 1. the completions -- */

console.log('the recently completed section');
hostState = {
  ...QUIET_STATE,
  completions: [
    { taskId: 'task-2', subject: '端到端测试与 UI 验收', owner: 'tester', at: 1793693289232 },
    { taskId: 'task-77', subject: '收尾的那件事', owner: null, at: 1793693200000 },
  ],
};
let tree = await freshMount();
let text = textOf(tree).join(' ');

check('the panel renders the recently completed section', text.includes('Recently completed'), text.slice(0, 120));
check('a completion shows its subject', text.includes('收尾的那件事'), text.slice(0, 200));
check('a completion shows its owner', text.includes('tester'));
check('a completion without an owner falls back to the empty-owner copy', text.includes('unowned'));
check('a completion shows its time', text.includes(new Date(1793693289232).toLocaleTimeString()),
  new Date(1793693289232).toLocaleTimeString());

console.log('the recently completed section is capped');
hostState = {
  ...QUIET_STATE,
  completions: Array.from({ length: 40 }, (_, index) => ({
    taskId: `task-${index}`,
    subject: `收尾第 ${index} 件事`,
    owner: 'tester',
    at: 1793693289232,
  })),
};
tree = await freshMount();
text = textOf(tree).join(' ');
check('at most twenty completions are rendered',
  text.includes('收尾第 0 件事') && text.includes('收尾第 19 件事') && !text.includes('收尾第 20 件事'),
  'index 20 present means the cap is broken');

console.log('a Host without the field');
hostState = { ...QUIET_STATE };
delete hostState.completions;
tree = await freshMount();
text = textOf(tree).join(' ');
check('the panel still renders without completions', tree !== null && tree !== undefined);
check('the recently completed section is not rendered', !text.includes('Recently completed'));
check('the roster still renders', text.includes('tester'));

console.log('a Host that answers with something that is not an array');
hostState = { ...QUIET_STATE, completions: 'not-a-list' };
tree = await freshMount();
text = textOf(tree).join(' ');
check('a malformed completions field does not crash the panel', tree !== null && tree !== undefined);
check('a malformed completions field renders no section', !text.includes('Recently completed'));

/* --------------------------------------------------------- 2. the poll -- */

console.log('the poll backs off when the board is quiet');
hostState = QUIET_STATE;
projection = {
  members: [
    { id: 'session-lead', name: 'lead', role: 'lead', phase: 'active' },
    { id: 'session-t', name: 'tester', role: 'teammate', phase: 'active' },
  ],
  tasks: [
    { id: 'task-2', revision: 2, subject: '端到端测试与 UI 验收', description: '', status: 'completed', blockedBy: [], writeScopes: [], ownerName: 'tester', ready: false, writeScopeWarnings: [] },
  ],
};
await freshMount();
const afterMount = calls.length;
check('the panel pulls the Host snapshot as soon as it opens', afterMount === 1, `calls=${afterMount}`);

await advance(8000);
const afterFast = calls.length;
check('the poll asks again on the fast cadence', afterFast === 2, `calls=${afterFast}`);

await advance(29000);
const afterQuiet = calls.length;
check('a quiet board backs off to thirty seconds', afterQuiet === 2, `calls=${afterQuiet}`);

await advance(1000);
const afterSlow = calls.length;
check('the slow poll asks again after thirty seconds', afterSlow === 3, `calls=${afterSlow}`);

console.log('the poll stays fast while work is unsettled');
hostState = BUSY_STATE;
await freshMount();
await advance(8000);
const busyFirst = calls.length;
await advance(8000);
const busySecond = calls.length;
check('a pending gate keeps the fast cadence', busySecond === busyFirst + 1,
  `${busyFirst} -> ${busySecond}`);

console.log('a moving board keeps the fast cadence');
hostState = QUIET_STATE;
await freshMount();
await advance(8000);
const quietFirst = calls.length;
// The board moves: a task changes its revision.
projection = {
  ...projection,
  tasks: [
    { id: 'task-2', revision: 3, subject: '端到端测试与 UI 验收', description: '', status: 'completed', blockedBy: [], writeScopes: [], ownerName: 'tester', ready: false, writeScopeWarnings: [] },
  ],
};
await render();
await advance(8000);
const movedFirst = calls.length;
await advance(8000);
const movedSecond = calls.length;
check('a changed board is pulled straight away', movedFirst > quietFirst, `${quietFirst} -> ${movedFirst}`);
check('the change costs one immediate pull and one fast tick',
  movedFirst === quietFirst + 2, `${quietFirst} -> ${movedFirst}`);
check('the board settles back into the slow cadence', movedSecond === movedFirst,
  `${movedFirst} -> ${movedSecond}`);

console.log('a session switch pulls the snapshot again');
const beforeSwitch = calls.length;
currentSessionId = 'session-other';
await render();
const afterSwitch = calls.length;
check('switching sessions pulls the Host snapshot straight away',
  afterSwitch === beforeSwitch + 1, `${beforeSwitch} -> ${afterSwitch}`);
currentSessionId = 'session-lead';

console.log(failures.length ? `\n${failures.length} FAILURE(S)` : '\nALL PASS');
process.exit(failures.length ? 1 : 0);
