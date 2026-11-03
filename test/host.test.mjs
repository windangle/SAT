/**
 * Offline unit tests for the SuperAgentTeam Host rules.
 *
 * The plugin is a plain-JavaScript bundle with no build step, so the pure
 * helpers are extracted from the source and exercised directly.
 *
 * Run: node test/host.test.mjs
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, '..', 'index.js'), 'utf8');

/** Cut one top-level helper out of the source and return it as a function. */
function extract(startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  if (start < 0) throw new Error(`marker not found: ${startMarker}`);
  const end = source.indexOf(endMarker, start);
  if (end < 0) throw new Error(`end marker not found: ${endMarker}`);
  return source.slice(start, end);
}

const failures = [];
function check(name, condition, detail) {
  if (condition) console.log(`  PASS  ${name}`);
  else { console.log(`  FAIL  ${name}${detail ? ' — ' + detail : ''}`); failures.push(name); }
}

/* ------------------------------------------------------ the rule layer -- */

const lexicon = extract('const SKILL_LEXICON = [', '/** Model-facing guidance injected');
const helpers = extract('const SKILL_LEXICON = [', '/** Model-facing guidance injected');

const scope = { SKILL_LEXICON: undefined, SKILL_MATCHERS: undefined };
// eslint-disable-next-line no-new-func
new Function('scope', `${helpers}\nObject.assign(scope, { SKILL_MATCHERS, skillTags, mentionsName, tokenize, keywordHits })`)(scope);
const { skillTags, mentionsName } = scope;

console.log('rule layer');
const tagsOf = (text) => [...skillTags(text)];
check('"build" is a build request, not a UI request',
  JSON.stringify(tagsOf('build the bundle').sort()) === JSON.stringify(['build']),
  JSON.stringify(tagsOf('build the bundle')));
check('"guide" carries no skill', tagsOf('guide').length === 0);
check('"quick" carries no skill', tagsOf('quick').length === 0);
check('"drops" carries no skill', tagsOf('drops').length === 0);
check('"prefix" carries no skill', tagsOf('prefix').length === 0);
check('"perfect" carries no skill', tagsOf('perfect').length === 0);
check('"test" is a test request', tagsOf('run the tests').includes('test'));
check('a CJK request keeps its skills', tagsOf('端到端测试 验收').includes('test'));
check('a CJK request keeps its ui skill', tagsOf('UI 验收').includes('ui'));
check('a CJK build request is a build request', tagsOf('构建打包').includes('build'));

console.log('explicit naming');
check('a named teammate is recognised', mentionsName('ask tester to run it', 'tester'));
check('a named teammate in CJK is recognised', mentionsName('请让 tester 去跑', 'tester'));
check('a name is not matched inside another word', !mentionsName('build the bundle', 'ui'));
check('a name is not matched inside another word', !mentionsName('the latest build', 'test'));
check('a two-letter name is not auto-matched', !mentionsName('square brackets', 'qa'));

/* --------------------------------------------------------------- gates -- */

console.log('gates');
const gateScope = {};
const gateSource = extract('const GATE_SCOPE_PREFIX', '/** Model-facing text for one gate. */');
const gateTitleSource = extract('/** Model-facing text for one gate. */', 'function parseArguments');
// eslint-disable-next-line no-new-func
new Function('scope', `${gateSource}\n${gateTitleSource}\nObject.assign(scope, { gateKindOf, gateKindOfSubject, gateSubjectText, gateDisplayText, gateTitle, GATE_REJECTED_MARKER })`)(gateScope);
const { gateKindOf, gateSubjectText, gateDisplayText, gateTitle } = gateScope;

check('a gate subject carries its kind',
  gateKindOf({ subject: '[GATE:merge] 合并插件', writeScopes: [] }) === 'merge');
check('the gate subject text drops the machine prefix',
  gateSubjectText('[GATE:merge] 合并插件') === '合并插件',
  gateSubjectText('[GATE:merge] 合并插件'));
check('the gate subject text KEEPS the rejection marker',
  gateSubjectText('[GATE:merge] REJECTED — 合并插件') === 'REJECTED — 合并插件',
  gateSubjectText('[GATE:merge] REJECTED — 合并插件'));
check('the display text drops the rejection marker',
  gateDisplayText('[GATE:merge] REJECTED — 合并插件') === '合并插件',
  gateDisplayText('[GATE:merge] REJECTED — 合并插件'));
check('re-wrapping a gate does not stack prefixes',
  gateTitle('merge', '[GATE:merge] 合并插件') === '[GATE:merge] 合并插件',
  gateTitle('merge', '[GATE:merge] 合并插件'));
check('re-wrapping a gate KEEPS the rejection marker',
  gateTitle('merge', 'REJECTED — 合并插件') === '[GATE:merge] REJECTED — 合并插件',
  gateTitle('merge', 'REJECTED — 合并插件'));
check('re-wrapping a rejected gate does not stack prefixes',
  gateTitle('merge', '[GATE:merge] REJECTED — 合并插件') === '[GATE:merge] REJECTED — 合并插件',
  gateTitle('merge', '[GATE:merge] REJECTED — 合并插件'));
check('a plain task is not a gate', gateKindOf({ subject: '普通工单', writeScopes: [] }) === undefined);
check('a legacy scope marker still identifies a gate',
  gateKindOf({ subject: 'x', writeScopes: ['super-agent-team/gate-merge'] }) === 'merge');

console.log(failures.length ? `\n${failures.length} FAILURE(S)` : '\nALL PASS');
process.exit(failures.length ? 1 : 0);
