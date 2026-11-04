/**
 * Offline render test for the SuperAgentTeam control deck.
 *
 * The browser automation could not drive the panel: every action is guarded
 * by a whole-page safety check, and the very session the panel belongs to
 * re-renders continuously while the agent is running. This harness loads the
 * real `client.js`, stubs React with a miniature renderer, feeds the panel a
 * realistic Host snapshot plus a realistic Session projection, and asserts
 * on the rendered tree.
 *
 * Run: node test/render.test.mjs
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, '..', 'client.js'), 'utf8');

/* ----------------------------------------------------------- React stub -- */

const hookState = [];
let hookIndex = 0;
let pendingEffects = [];

function useState(initial) {
  const index = hookIndex++;
  if (hookState.length <= index) hookState[index] = typeof initial === 'function' ? initial() : initial;
  const set = (next) => {
    hookState[index] = typeof next === 'function' ? next(hookState[index]) : next;
  };
  return [hookState[index], set];
}
function useEffect(effect) { pendingEffects.push(effect); }
function useMemo(factory) { return factory(); }
function useCallback(fn) { return fn; }
function useRef(initial) { return { current: initial }; }
function createElement(type, props, ...children) {
  // React calls function components during render; the stub does the same so
  // the component tree is fully expanded.
  if (typeof type === 'function') return type({ ...(props || {}), children });
  return { type, props: { ...(props || {}), children } };
}

const React = { createElement, useState, useEffect, useMemo, useCallback, useRef };

/* --------------------------------------------------------- plugin loader -- */

let registered = null;
let dictionaries = {};
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

/** The Host snapshot the panel receives over the `super-team` command. */
const HOST_STATE = {
  teamId: 'session-lead',
  role: 'lead',
  name: 'lead',
  members: [
    { name: 'lead', role: 'lead', status: 'running', description: '', model: 'MiniMax-M3.1-Flash', provider: '', diagnostics: [] },
    { name: 'tester', role: 'teammate', status: 'running', description: 'Run end-to-end 测试 and QA 验收.', model: 'MiniMax-M3.1-Flash', provider: 'spawn', diagnostics: [] },
    { name: 'reviewer', role: 'teammate', status: 'inactive', description: 'Review code 评审.', model: 'MiniMax-M3.1-Flash', provider: 'spawn', diagnostics: [] },
  ],
  tasks: [
    { id: 'task-1', revision: 1, subject: '[GATE:merge] 合并插件', description: '需要人工确认', status: 'pending', owner: null, blockedBy: [], ready: true, writeScopes: [], writeScopeWarnings: [], gate: 'merge' },
    { id: 'task-2', revision: 2, subject: '端到端测试与 UI 验收', description: '跑一遍验收', status: 'in_progress', owner: 'tester', blockedBy: [], ready: false, writeScopes: [], writeScopeWarnings: [], gate: null },
    { id: 'task-3', revision: 1, subject: '评审本次改动', description: '看看 diff', status: 'completed', owner: 'reviewer', blockedBy: [], ready: false, writeScopes: [], writeScopeWarnings: [], gate: null },
  ],
  gates: [
    { id: 'task-1', kind: 'merge', subject: '合并插件', detail: '需要人工确认', status: 'pending', revision: 1 },
  ],
  routes: [
    { time: 1793693289232, subject: '端到端测试与 UI 验收', stage: 'rule', target: 'tester', reason: 'skill affinity on test, ui', taskId: 'task-2' },
  ],
  alerts: [
    { time: 1793693289232, kind: 'stalled', taskId: 'task-9', owner: 'tester', detail: 'owner "tester" is inactive' },
  ],
};

/** The Session projection, with the projection's own vocabulary. */
const PROJECTION = {
  members: [
    { id: 'session-lead', name: 'lead', role: 'lead', phase: 'active' },
    { id: 'session-t', name: 'tester', role: 'teammate', phase: 'active' },
    { id: 'session-r', name: 'reviewer', role: 'teammate', phase: 'failed', error: 'member creation failed' },
  ],
  tasks: [
    { id: 'task-2', revision: 2, subject: '端到端测试与 UI 验收', description: '跑一遍验收', status: 'in_progress', blockedBy: [], writeScopes: [], ownerName: 'tester', ready: false, writeScopeWarnings: [] },
  ],
};

const commands = {
  calls: [],
  async execute(sessionId, line, attachments, signal) {
    commands.calls.push({ sessionId, line, attachments, signalIsAbortSignal: Boolean(signal && typeof signal.aborted === 'boolean') });
    if (line === '/super-team state') return { kind: 'success', text: JSON.stringify(HOST_STATE) };
    return { kind: 'success', text: 'ok' };
  },
};

/**
 * A guarded Client context throws for a service it does not declare. The
 * stub enforces the plugin's own `inject` list, so a lookup of an
 * undeclared service fails here exactly as it fails in the browser.
 */
let activeLocale = 'en';
let registeredNamespaces = new Set();
const deferredEffects = [];

function makeContext(injected, withRemote = true) {
  registeredNamespaces = new Set();
  activeLocale = 'en';
  const context = {
    slots: {
      inject(_key, callback) { callback(); return () => {}; },
      register(options, component) { registered = { options, component }; return () => {}; },
    },
    locale: {
      // A namespace has to exist before bind() — the real service throws
      // otherwise. This is what makes a deferred ctx.effect registration
      // observable in the harness.
      register(ns, first, second) {
        if (typeof first === 'string') dictionaries[first] = second;
        else dictionaries[ns] = first;
        registeredNamespaces.add(ns);
        return () => { registeredNamespaces.delete(ns); };
      },
      bind(ns) {
        if (!registeredNamespaces.has(ns)) throw new Error(`locale namespace "${ns}" is not registered`);
        return (key, params) => {
          const table = dictionaries[ns] || {};
          const dict = table[activeLocale] || table.en || {};
          let text = dict[key] !== undefined ? dict[key] : key;
          if (params) {
            for (const [name, value] of Object.entries(params)) {
              text = text.split('{' + name + '}').join(String(value));
            }
          }
          return text;
        };
      },
    },
    get(name) {
      if (!injected.includes(name)) throw new Error(`cannot get property "${name}" without inject`);
      return undefined;
    },
    // ctx.effect is deferred in the real Harness: the callback is not run
    // at registration time. Anything needed synchronously (like a locale
    // namespace) cannot be registered from inside it.
    effect(fn) { deferredEffects.push(fn); return () => {}; },
    on() { return () => {}; },
  };
  // The Harness client services are a nested namespace: the leaf path must
  // be declared too, exactly as the shipped client plugins do it.
  context.remote = { commands };
  context.remoteCommands = { commands };
  return context;
}

/* ---------------------------------------------------------------- render -- */

const injected = plugin.inject ?? [];
check('the plugin declares the remote namespace it uses',
  injected.includes('remote') && injected.includes('remote.commands'), injected.join(','));
const ctx = makeContext(injected);
plugin.apply(ctx);

if (!registered) throw new Error('the plugin did not register a view');

const props = {
  sessionId: 'session-lead',
  useSession: (selector) => selector({ subagent: undefined, openState: 'ready' }),
  useSessions: (selector) => selector({
    phase: 'ready',
    projectionsBySession: { 'session-lead': { values: { agentTeam: PROJECTION } } },
    byId: {},
  }),
};

async function render() {
  let tree = null;
  for (let pass = 0; pass < 6; pass += 1) {
    hookIndex = 0;
    pendingEffects = [];
    tree = registered.component(props);
    const effects = pendingEffects;
    pendingEffects = [];
    for (const effect of effects) effect();
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  return tree;
}

/** Flatten a rendered element tree into its text content. */
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

/* --------------------------------------------------------------- asserts -- */

const failures = [];
function check(name, condition, detail) {
  if (condition) console.log(`  PASS  ${name}`);
  else { console.log(`  FAIL  ${name}${detail ? ' — ' + detail : ''}`); failures.push(name); }
}

const tree = await render();
const text = textOf(tree).join(' ');

check('the view renders without throwing', tree !== null && tree !== undefined);
check('the roster shows every member', text.includes('tester') && text.includes('reviewer') && text.includes('lead'));
check('the roster shows a live status', text.includes('running'));
check('no literal "undefined" reaches the page', !text.includes('undefined'), text.match(/.{0,40}undefined.{0,40}/)?.[0]);
check('a claimed Work Item shows its owner', text.includes('Owner: tester'));
check('the board shows every Work Item', text.includes('端到端测试与 UI 验收') && text.includes('评审本次改动'));
check('the gate is listed with its kind', text.includes('gate:merge'));
check('the gate offers a human decision', text.includes('Allow') && text.includes('Deny'));
check('the routing ledger is shown', text.includes('skill affinity on test, ui'));
check('the watchdog alert is shown', text.includes('stalled'));
check('the intake box is present', text.includes('Dispatch work'));

const classes = classNames(tree).join(' ');
check('the dispatch button is enabled', !/sat-btn[^\s]*disabled/.test(classes));

const commandsSeen = commands.calls.map((call) => call.line);
check('the panel reads the board over the command channel', commandsSeen.includes('/super-team state'));
check('the panel passes a real AbortSignal', commands.calls.every((call) => call.signalIsAbortSignal));

/* ------------------------------------------------ the dispatch action --- */

/** Find a rendered button whose text matches and press it. */
function findButton(node, needle) {
  if (!node || typeof node !== 'object') return null;
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findButton(child, needle);
      if (found) return found;
    }
    return null;
  }
  if (node.type === 'button' && textOf(node).join(' ').includes(needle)) return node;
  return findButton(node.props ? node.props.children : null, needle);
}

/** Find a rendered element of a given type. */
function findElement(node, type) {
  if (!node || typeof node !== 'object') return null;
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findElement(child, type);
      if (found) return found;
    }
    return null;
  }
  if (node.type === type) return node;
  return findElement(node.props ? node.props.children : null, type);
}

const dispatchButton = findButton(tree, 'Dispatch');
check('the panel renders a dispatch button', dispatchButton !== null);

// Type a request into the intake box, then press Dispatch. This is the
// human path that used to crash on an undefined AbortSignal.
const textarea = findElement(tree, 'textarea');
check('the panel renders an intake box', textarea !== null);
if (textarea && typeof textarea.props.onChange === 'function') {
  textarea.props.onChange({ target: { value: '跑一遍端到端验收' } });
  const typed = await render();
  const button = findButton(typed, 'Dispatch');
  if (button && typeof button.props.onClick === 'function') {
    button.props.onClick();
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  const lines = commands.calls.map((call) => call.line);
  check('dispatching reaches the Host command channel',
    lines.some((line) => line.startsWith('/super-team intake ')),
    lines.join(' | '));
}

/* ------------------------------------------------ the gate decision ----- */

// The human gate decision travels the same channel as the dispatch. The
// model cannot take this path: the Host tool guard refuses it.
const allowButton = findButton(tree, 'Allow');
check('the gate renders an Allow button', allowButton !== null);
if (allowButton && typeof allowButton.props.onClick === 'function') {
  allowButton.props.onClick();
  await new Promise((resolve) => setTimeout(resolve, 10));
  const lines = commands.calls.map((call) => call.line);
  check('approving a gate reaches the Host command channel',
    lines.includes('/super-team approve task-1'),
    lines.join(' | '));
}

/* --------------------------------------- the projection fallback path --- */

// A profile without the Host control channel must still render the roster
// and the board, using the projection's own vocabulary: `phase` instead of
// `status`, and `ownerName` instead of `owner`.
const fallbackCtx = makeContext(injected, false);
fallbackCtx.remote = undefined;
registered = null;
plugin.apply(fallbackCtx);
hookState.length = 0;
const fallbackTree = await render();
const fallbackText = textOf(fallbackTree).join(' ');

check('the fallback path still renders', fallbackTree !== null);
check('the fallback roster names every member',
  fallbackText.includes('tester') && fallbackText.includes('reviewer') && fallbackText.includes('lead'));
check('the fallback maps phase to a status',
  fallbackText.includes('failed') && fallbackText.includes('idle'),
  fallbackText.slice(0, 200));
check('the fallback maps ownerName to the owner', fallbackText.includes('tester'));
check('the fallback shows no undefined', !fallbackText.includes('undefined'));

// Regression: the locale dictionary must be registered synchronously.
// ctx.effect is deferred here, so the old code (register inside effect →
// bind immediately) would leave the panel on its built-in English fallback.
activeLocale = 'zh';
hookState.length = 0;
const zhTree = await render();
const zhText = textOf(zhTree).join(' ');
check('the panel follows the Harness locale (zh)', zhText.includes('成员名册'), zhText.slice(0, 160));
check('the panel does not stay on the English fallback',
  !zhText.includes('Roster 3') && !zhText.includes('Work board'), zhText.slice(0, 160));
activeLocale = 'en';

console.log(failures.length ? `\n${failures.length} FAILURE(S)` : '\nALL PASS');
process.exit(failures.length ? 1 : 0);
