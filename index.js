/**
 * SuperAgentTeam — Host half.
 *
 * A Super-agent scheduling layer on top of the Harness Agent Teams service:
 *
 *  - **Router** (DS Super-agent): every incoming work request passes a
 *    two-stage filter. Stage one is a deterministic rule engine (explicit
 *    name mention, skill-tag affinity, description keyword overlap). Stage
 *    two is the model: a request the rules cannot place is escalated to the
 *    Team Lead as an unowned Work Item instead of being dropped or guessed.
 *    Routing decisions are engineering, not prompt, so the behaviour does not
 *    depend on a model choosing to delegate.
 *  - **Work Items** (Munk AI): every routed request becomes a durable task on
 *    the shared Team board with an owner, blockers and advisory write scopes.
 *  - **Hard gates** (Munk AI): a gate is a Work Item that carries the
 *    `gate:<kind>` marker. Work that depends on it lists the gate as a
 *    blocker, so the native task DAG refuses to release the work until a
 *    human approves the gate. A monotonic tool guard keeps the model from
 *    approving its own gate.
 *  - **Watchdog** (DS Super-agent): a periodic scan reports failed members,
 *    stalled work and unclaimed ready work.
 *
 * The plugin owns no new durable format: roster, work items and gate state
 * live in the Lead Session's Team log, and only the routing ledger and the
 * watchdog alerts are plugin-local.
 */

export const inject = ['agents', 'agentTeams', 'tools', 'systemPrompt', 'timer']

/** Plugin-local ledger bounds. */
const MAX_LEDGER = 60
const WATCHDOG_INTERVAL_MS = 60_000

/**
 * Rule-stage skill lexicon. A teammate's skills are the lexicon terms that
 * appear in its description; a request carries the terms it mentions.
 *
 * Latin terms match on a word boundary: a bare substring match would read
 * "build" as "ui" and hand build work to a UI engineer. A word-boundary
 * prefix match ("\bbuild\w*") also covers the inflected forms — build,
 * builds, building — without matching "prefix". CJK terms have no word
 * boundaries and match as substrings.
 */
const SKILL_LEXICON = [
  { tag: 'test', terms: ['test', 'testing', 'qa', 'e2e', '测试', '验收', '回归', '端到端'] },
  { tag: 'review', terms: ['review', '评审', '审查', 'code review', 'lint'] },
  { tag: 'ui', terms: ['ui', 'ux', '界面', '前端', '页面', '样式', 'css', 'screenshot'] },
  { tag: 'docs', terms: ['doc', 'documentation', '文档', '说明', 'readme'] },
  { tag: 'build', terms: ['build', 'rebuild', 'compile', '构建', '编译', '打包', 'bundle'] },
  { tag: 'release', terms: ['release', 'publish', '发布', 'deploy', '部署', '上线'] },
  { tag: 'data', terms: ['data', 'database', '数据', '分析', '统计', '报表'] },
  { tag: 'ops', terms: ['ops', '运维', 'ci', 'pipeline', 'monitor'] },
  { tag: 'perf', terms: ['perf', 'performance', '性能', '优化', 'profil'] },
  { tag: 'fix', terms: ['bug', 'fix', 'repair', '修复', '缺陷', '报错'] },
];

/**
 * Terms that must match exactly. A prefix match would fire on unrelated
 * words: "ci" inside "special", "ui" inside "quick", "data" inside "metadata".
 */
const EXACT_SKILL_TERMS = new Set(['ci', 'ui', 'ux', 'qa', 'ops', 'perf', 'css', 'e2e', 'lint', 'data', 'database'])

/** One compiled matcher per lexicon term. */
const SKILL_MATCHERS = SKILL_LEXICON.flatMap((entry) => entry.terms.map((term) => {
  const latin = /^[a-z0-9][a-z0-9+#.-]*$/.test(term)
  const exact = EXACT_SKILL_TERMS.has(term)
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return {
    tag: entry.tag,
    term,
    latin,
    pattern: latin ? new RegExp(exact ? `\\b${escaped}\\b` : `\\b${escaped}\\w*`) : undefined,
  }
}))

/** Common English words that carry no routing signal. */
const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'into', 'please', 'should',
  'must', 'make', 'use', 'run', 'add', 'new', 'all', 'any', 'you', 'your', 'are',
  'was', 'has', 'have', 'can', 'will', 'not', 'but', 'its', 'our', 'they', 'them',
  'also', 'then', 'than', 'when', 'what', 'which', 'who', 'how', 'why', 'some',
  'task', 'work', 'item', 'file', 'files', 'code', 'need', 'needs', 'want', 'get',
])

/** Split free text into comparable tokens: latin words plus CJK bigrams. */
function tokenize(text) {
  const tokens = new Set()
  const lower = String(text ?? '').toLowerCase()
  for (const match of lower.matchAll(/[a-z][a-z0-9_+#.-]{1,}/g)) {
    const token = match[0].replace(/[._-]+$/, '')
    if (token.length >= 3 && !STOP_WORDS.has(token)) tokens.add(token)
  }
  for (const run of lower.match(/[\u4e00-\u9fff]+/g) ?? []) {
    if (run.length === 1) { tokens.add(run); continue }
    for (let i = 0; i + 1 < run.length; i += 1) tokens.add(run.slice(i, i + 2))
  }
  return tokens
}

/** Skill tags carried by one text. */
function skillTags(text) {
  const lower = String(text ?? '').toLowerCase()
  const tags = new Set()
  for (const matcher of SKILL_MATCHERS) {
    const hit = matcher.latin ? matcher.pattern.test(lower) : lower.includes(matcher.term)
    if (hit) tags.add(matcher.tag)
  }
  return tags
}

/**
 * Whether a request explicitly names one teammate. Latin names match on a
 * word boundary and must be at least three characters, so a teammate called
 * "ui" is not picked up by "build" and a teammate called "qa" is not picked
 * up by every text that happens to contain "qa". Such short or ambiguous
 * names are still reachable through the explicit `target` parameter.
 */
function mentionsName(text, name) {
  const lower = String(text ?? '').toLowerCase()
  const target = String(name ?? '').toLowerCase()
  if (!target) return false
  if (/^[a-z0-9][a-z0-9_-]*$/.test(target)) {
    if (target.length < 3) return false
    const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(`\\b${escaped}\\b`).test(lower)
  }
  return target.length >= 2 && lower.includes(target)
}

/** Token overlap between a request and one teammate description. */
function keywordHits(requestTokens, description) {
  let hits = 0
  for (const token of tokenize(description)) if (requestTokens.has(token)) hits += 1
  return hits
}

/**
 * A gate Work Item is marked on the board so both sides can recognise it.
 *
 * The marker lives in the subject only. `writeScopes` holds real path
 * prefixes, and the Host compares them for overlap, so a synthetic scope
 * would report a false conflict against the plugin's own directory.
 */
const GATE_SCOPE_PREFIX = 'super-agent-team/gate-'
const GATE_SUBJECT_PREFIX = '[GATE:'
const GATE_REJECTED_MARKER = 'REJECTED'

function gateKindOf(task) {
  const scoped = (task?.writeScopes ?? []).find((scope) => scope.startsWith(GATE_SCOPE_PREFIX))
  if (scoped) return scoped.slice(GATE_SCOPE_PREFIX.length)
  return gateKindOfSubject(task?.subject)
}

/** The gate kind carried by a subject, or undefined when it is not a gate. */
function gateKindOfSubject(subject) {
  const text = String(subject ?? '')
  if (!text.startsWith(GATE_SUBJECT_PREFIX)) return undefined
  const end = text.indexOf(']')
  if (end <= GATE_SUBJECT_PREFIX.length) return undefined
  return text.slice(GATE_SUBJECT_PREFIX.length, end)
}

/**
 * The subject of a gate without the machine prefix. The rejection marker is
 * deliberately kept: it is the durable record of the human's verdict, and it
 * is what tells a rejected gate apart from an approved one after a reload.
 */
function gateSubjectText(subject) {
  return String(subject ?? '').replace(/^\[GATE:[^\]]*\]\s*/, '').trim()
}

/** The human-facing subject of a gate, without the machine prefix or the marker. */
function gateDisplayText(subject) {
  return gateSubjectText(subject)
    .replace(new RegExp(`^${GATE_REJECTED_MARKER}\\s*[—-]\\s*`), '')
    .trim()
}

function isGateTask(task) {
  return gateKindOf(task) !== undefined
}

/**
 * A Work Package: one request, split by the Team Lead into several Work
 * Items.
 *
 * The package is a Work Item of its own, so it shows up on the shared board
 * next to its children. The link to those children rides in its description
 * as a compact marker, which keeps the whole structure inside the durable
 * Team log: a plugin reload rebuilds the tree from the board alone, with no
 * side storage to lose.
 *
 * The completion policy is the Lead's call per package, because the right
 * rule depends on the work: `all` (every item must land), `any` (one
 * acceptable path is enough), `manual` (the items are done, a human closes
 * the package).
 */
const PACKAGE_MARKER = '@@sat-package'
const PACKAGE_POLICIES = new Set(['all', 'any', 'manual'])

/** Build the description of a package Work Item. */
function packageDescription(text, policy, children) {
  const marker = `${PACKAGE_MARKER} completion=${policy} children=${children.join(',')}`
  return text ? `${text}\n\n${marker}` : marker
}

/** Read the package record out of a Work Item, or undefined when it is not one. */
function packageOf(task) {
  const description = String(task?.description ?? '')
  const at = description.indexOf(PACKAGE_MARKER)
  if (at < 0) return undefined
  const line = description.slice(at)
  const policy = /completion=([a-z]+)/.exec(line)?.[1]
  if (!policy || !PACKAGE_POLICIES.has(policy)) return undefined
  const children = (/children=([^\s]*)/.exec(line)?.[1] ?? '').split(',').filter(Boolean)
  return { policy, children }
}

/**
 * The identity of a dispatch. Two requests are the same work only when the
 * title, the worker and the brief all match: matching on the title alone
 * would swallow the second half of a legitimate decomposition, and dropping
 * the worker would swallow "run this on both the tester and the reviewer".
 */
function dispatchKey(subject, target, description) {
  return `${String(subject ?? '').trim()}::${target ?? ''}::${String(description ?? '').trim()}`
}

/** Model-facing text for one gate. */
function gateTitle(kind, subject) {
  return `${GATE_SUBJECT_PREFIX}${kind}] ${gateSubjectText(subject)}`
}
/**
 * Parse the arguments of an arbitrary tool execution defensively: the guard
 * receives whatever the runtime captured, which may be an object or a JSON
 * string.
 */
function parseArguments(raw) {
  if (raw && typeof raw === 'object') return raw
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch { return {} }
  }
  return {}
}

/** Model-facing guidance injected into every Team member's system prompt. */
function teamPolicy() {
  return `SuperAgentTeam scheduling is available in this session.

Work requests reach the team through the Router, not through a human relaying them. Use team_intake to hand a request to the Router: it filters the request with a rule engine, creates a durable Work Item on the shared board, and notifies the chosen worker. The Router escalates a request it cannot place to the Team Lead as an unowned Work Item rather than guessing, so an unclaimed board item means the Lead still has to decide its owner. Use team_status for the roster, the board, the pending gates and the recent routing ledger.

Gates are human decisions. A gate is a Work Item whose subject starts with [GATE:<kind>]; work that lists a gate as a blocker stays blocked until a human approves it, and a rejected gate also releases its dependents so the work can be replanned. Use team_gate_request to raise one before any merge, release, or sensitive change. You cannot approve your own gate: the tool guard rejects any attempt to change a gate Work Item, and only the human control surface settles it. Use team_watchdog to look for failed members, stalled work and unclaimed ready work.`
}

/** Resolve a prompt-section order without assuming a sibling plugin exists. */
function sectionOrder(scoped, name, fallback) {
  try {
    const order = scoped.systemPrompt.getSectionOrder(name)
    return typeof order === 'number' ? order : fallback
  } catch {
    return fallback
  }
}

export function apply(ctx) {
  /** Routing ledger and watchdog alerts, per Team. */
  const ledgers = new Map()

  function ledger(teamId) {
    let entry = ledgers.get(teamId)
    if (!entry) {
      entry = { routes: [], alerts: [] }
      ledgers.set(teamId, entry)
    }
    return entry
  }

  /**
   * Record one routing decision. The stored entry is returned so a later
   * step — the notification — can update it in place; storing a copy would
   * leave the ledger showing a stale state.
   */
  function pushRoute(teamId, record) {
    const book = ledger(teamId)
    const entry = { time: Date.now(), ...record }
    book.routes.unshift(entry)
    if (book.routes.length > MAX_LEDGER) book.routes.length = MAX_LEDGER
    return entry
  }

  /** The stable identity of one watchdog alert, used to deduplicate scans. */
  function alertKey(alert) {
    return `${alert.kind}:${alert.taskId ?? alert.member ?? ''}`
  }

  /** Resolve the calling Team member, refusing callers outside a Team. */
  function requireMember(agent, toolName) {
    if (!agent) throw new Error(`${toolName} requires a live Team member (the Team Lead or a teammate).`)
    const membership = ctx.agentTeams.tryMembership(agent)
    if (!membership) throw new Error(`${toolName} requires a live Team member (the Team Lead or a teammate).`)
    return membership
  }

  // ---------------------------------------------------------------- Router --

  /**
   * Stage one of the two-stage filter: place a request on the roster with
   * deterministic rules. Returns the winning teammate and the reason, or
   * undefined when no rule places the request.
   */
  function ruleRoute(members, request) {
    const text = `${request.subject}\n${request.description ?? ''}`
    const requestTokens = tokenize(text)
    const requestTags = skillTags(text)

    let best
    for (const member of members) {
      if (member.role !== 'teammate') continue
      if (member.status === 'failed') continue
      const explicit = mentionsName(text, member.name)
      const memberTags = skillTags(member.description ?? '')
      const sharedTags = [...requestTags].filter((tag) => memberTags.has(tag))
      const hits = keywordHits(requestTokens, member.description ?? '')
      let score = 0
      let reason = ''
      if (explicit) {
        score = 1000
        reason = `the request names "${member.name}"`
      } else if (sharedTags.length > 0) {
        score = 100 + sharedTags.length * 10
        reason = `skill affinity on ${sharedTags.join(', ')}`
      } else if (hits >= 2) {
        score = 10 + hits
        reason = `${hits} keyword hits in the teammate description`
      }
      if (score > 0 && (!best || score > best.score)) best = { member, score, reason }
    }

    if (!best) return undefined
    return { target: best.member, reason: best.reason, stage: 'rule' }
  }

  /**
   * The Router: filter, then dispatch. A request the rules cannot place is
   * escalated to the Lead as an unowned Work Item.
   *
   * The signal is never optional: the Team service composes it into
   * `AbortSignal.any([...])`, which throws on a missing entry, so an
   * undefined signal would break every human-driven dispatch.
   */
  async function intake(agent, request, signal = new AbortController().signal, options = {}) {
    const membership = requireMember(agent, 'team_intake')
    const teamId = membership.id
    const members = ctx.agentTeams.listMembers(agent)

    // An explicit target bypasses the filter but still creates a Work Item.
    const explicitTarget = request.target
      ? members.find((member) => member.name === request.target)
      : undefined
    if (request.target && !explicitTarget) {
      const names = members.map((member) => member.name).join(', ')
      throw new Error(`No member named "${request.target}" is on this roster (${names}).`)
    }
    if (explicitTarget && explicitTarget.status === 'failed') {
      throw new Error(`"${explicitTarget.name}" failed to start, so it cannot take work.`)
    }

    const placement = explicitTarget
      ? { target: explicitTarget, reason: 'an explicit target was requested', stage: 'direct' }
      : ruleRoute(members, request)

    const writeScopes = Array.isArray(request.writeScopes) ? request.writeScopes : []

    // Idempotency: the same work must not create a second Work Item while
    // the first one is still waiting for an owner. A Work Item that somebody
    // already picked up, or that is done, does not block a fresh request —
    // re-running the same check after a fix is legitimate work. The identity
    // is the title, the worker and the brief: the brief alone would swallow
    // the second half of a legitimate decomposition, and the brief plus the
    // title would swallow "run this on both the tester and the reviewer". A
    // package asks for its items explicitly and skips this check entirely.
    //
    // The worker of a waiting Work Item is not recorded on the Work Item
    // itself, so it is read back from the routing ledger. After a reload the
    // ledger is empty and the brief alone decides again, which can only
    // decline to create a second item, never create one.
    const dedupe = options.dedupe !== false
    const targetName = placement ? placement.target.name : 'lead'
    const routedTarget = (taskId) =>
      ledger(teamId).routes.find((route) => route.taskId === taskId)?.target ?? ''
    const key = dispatchKey(request.subject, targetName, request.description)
    const live = dedupe
      ? ctx.agentTeams.listTasks(agent).find((task) =>
        task.status === 'pending' && !task.ownerName
        && dispatchKey(task.subject, routedTarget(task.id), task.description) === key)
      : undefined
    if (live) {
      pushRoute(teamId, {
        subject: request.subject,
        stage: 'duplicate',
        target: targetName,
        reason: 'an identical unclaimed Work Item already exists; no second one was created',
        taskId: live.id,
      })
      return {
        routed: true,
        escalated: false,
        deduplicated: true,
        stage: 'duplicate',
        target: targetName,
        taskId: live.id,
        subject: request.subject,
        reason: 'an identical unclaimed Work Item already exists; no second one was created',
      }
    }

    if (!placement) {
      // Stage two: hand the decision to the model (the Lead) instead of
      // guessing. The Work Item stays unowned until somebody places it.
      const task = await ctx.agentTeams.createTask(agent, {
        subject: request.subject,
        description: request.description ?? '',
        ...(writeScopes.length ? { writeScopes } : {}),
      })
      pushRoute(teamId, {
        subject: request.subject,
        stage: 'escalated',
        target: 'lead',
        reason: 'no rule placed the request; escalated to the Team Lead',
        taskId: task.id,
      })
      if (membership.role !== 'lead') {
        await ctx.agentTeams.sendMessage(agent, {
          target: 'lead',
          content: [{
            type: 'text',
            text: `SuperAgentTeam Router could not place a work request and escalated it to you as Work Item ${task.id}: ${request.subject}\n\n${request.description ?? ''}\n\nPlease assign an owner or answer directly.`,
          }],
          signal,
        })
      }
      return {
        routed: false,
        escalated: true,
        stage: 'escalated',
        target: 'lead',
        taskId: task.id,
        subject: request.subject,
        reason: 'no rule placed the request; escalated to the Team Lead',
      }
    }

    const task = await ctx.agentTeams.createTask(agent, {
      subject: request.subject,
      description: request.description ?? '',
      ...(writeScopes.length ? { writeScopes } : {}),
    })
    // The ledger entry is written before the notification, so a failed
    // notification still leaves a record of the dispatch instead of an
    // orphaned Work Item that nobody was told about.
    const entry = pushRoute(teamId, {
      subject: request.subject,
      stage: placement.stage,
      target: placement.target.name,
      reason: placement.reason,
      taskId: task.id,
      notified: false,
    })
    // A member cannot message itself. The Lead asking for work to be routed
    // to the Lead is a legitimate request, but there is nobody to notify.
    if (placement.target.name === membership.name) {
      entry.notified = false
      entry.reason = `${placement.reason}; the target is the caller, so no message was sent`
      return {
        routed: true,
        escalated: false,
        stage: placement.stage,
        target: placement.target.name,
        taskId: task.id,
        subject: request.subject,
        reason: entry.reason,
      }
    }
    try {
      await ctx.agentTeams.sendMessage(agent, {
        target: placement.target.name,
        content: [{
          type: 'text',
          text: `SuperAgentTeam Router assigned you Work Item ${task.id}: ${request.subject}\n\n${request.description ?? ''}\n\nReason: ${placement.reason}. Claim the task, do the work, then complete it.`,
        }],
        signal,
      })
      entry.notified = true
    } catch (error) {
      entry.reason = `${placement.reason}; notification failed: ${error instanceof Error ? error.message : String(error)}`
      throw error
    }
    return {
      routed: true,
      escalated: false,
      stage: placement.stage,
      target: placement.target.name,
      taskId: task.id,
      subject: request.subject,
      reason: placement.reason,
    }
  }

  // ------------------------------------------------------------ Packages --

  /**
   * Plan one request as a Work Package: the Lead splits it into several Work
   * Items, each routed to the worker that fits, and the package itself
   * becomes a Work Item that ties them together on the board.
   *
   * The completion policy is the Lead's call, because the right rule depends
   * on the work: `all` (every item must land), `any` (one acceptable path
   * is enough), `manual` (the items are done, a human closes the package).
   */
  async function plan(agent, request, signal = new AbortController().signal) {
    const membership = requireMember(agent, 'team_plan')
    const teamId = membership.id
    const policy = PACKAGE_POLICIES.has(request.completion) ? request.completion : 'all'
    const items = Array.isArray(request.items) ? request.items.filter((item) => item && item.subject) : []
    if (!items.length) throw new Error('team_plan needs at least one item with a subject.')

    // The children first: the package Work Item carries their ids, so it can
    // only be written once they exist.
    const dispatched = []
    for (const item of items) {
      dispatched.push(await intake(agent, {
        subject: item.subject,
        description: item.description ?? '',
        target: item.target,
        writeScopes: item.writeScopes,
      }, signal, { dedupe: false }))
    }
    const children = dispatched.map((entry) => entry.taskId).filter(Boolean)

    const goal = String(request.goal ?? '工作包')
    const packageTask = await ctx.agentTeams.createTask(agent, {
      subject: goal,
      description: packageDescription(request.description ?? '', policy, children),
    })
    pushRoute(teamId, {
      subject: goal,
      stage: 'package',
      target: 'human',
      reason: `work package of ${children.length} item(s), completion "${policy}"`,
      taskId: packageTask.id,
    })
    return {
      packageId: packageTask.id,
      goal,
      completion: policy,
      children,
      items: dispatched,
    }
  }

  /**
   * Settle one package Work Item. The Host only completes an in-progress
   * task and ignores the subject and the description, so the package is
   * claimed, then annotated, then completed.
   */
  async function settlePackage(agent, taskId, note) {
    const view = ctx.agentTeams.getTask(agent, taskId)
    if (!view) throw new Error(`No Work Item "${taskId}" on this board.`)
    const record = packageOf(view)
    if (!record) throw new Error(`Work Item "${taskId}" is not a work package.`)
    if (view.status === 'completed') {
      throw new Error(`Package ${taskId} was already settled (${view.subject}).`)
    }
    let revision = view.revision
    if (view.status === 'pending') {
      const claimed = await ctx.agentTeams.updateTask(agent, {
        taskId,
        expectedRevision: revision,
        action: 'claim',
      })
      revision = claimed.revision
    }
    const stamp = new Date().toISOString()
    const edited = await ctx.agentTeams.updateTask(agent, {
      taskId,
      expectedRevision: revision,
      action: 'edit',
      description: `${view.description}\n\nSettled ${stamp}.${note ? ` ${note}` : ''}`,
    })
    await ctx.agentTeams.updateTask(agent, {
      taskId,
      expectedRevision: edited.revision,
      action: 'complete',
    })
    return { packageId: taskId, goal: view.subject, completion: record.policy }
  }

  // ---------------------------------------------------------------- Gates --
  /** Raise a human hard gate. The gate is a Work Item other work can block on. */
  async function requestGate(agent, request) {
    const membership = requireMember(agent, 'team_gate_request')
    const kind = String(request.kind ?? 'sensitive')
    const subject = String(request.subject ?? 'Approval required')
    const task = await ctx.agentTeams.createTask(agent, {
      subject: gateTitle(kind, subject),
      description: request.detail ?? '',
    })
    pushRoute(membership.id, {
      subject,
      stage: 'gate',
      target: 'human',
      reason: `hard gate "${kind}" raised and waiting for a human decision`,
      taskId: task.id,
    })
    return { gateId: task.id, kind, subject, status: 'pending' }
  }

  /**
   * Settle a gate. Only the human control surface calls this.
   *
   * Both verdicts put the gate into a terminal state, because the task DAG
   * releases blocked work only when its blocker completes. A rejected gate
   * therefore unblocks its dependents as well — the human said no, so the
   * work must be replanned rather than wait forever. The verdict itself is
   * carried by the Work Item, so it survives a plugin reload.
   *
   * The Host's task state machine constrains the sequence: only an
   * in-progress task can be completed, and completing one ignores the
   * subject and the description. So the gate is claimed first, then edited
   * to carry the verdict, then completed — each step against the revision
   * the previous step returned.
   */
  async function decideGate(agent, taskId, decision) {
    const membership = requireMember(agent, 'super-team')
    const teamId = membership.id
    const view = ctx.agentTeams.getTask(agent, taskId)
    if (!view) throw new Error(`No Work Item "${taskId}" on this board.`)
    const kind = gateKindOf(view)
    if (!kind) throw new Error(`Work Item "${taskId}" is not a gate.`)
    if (view.status === 'completed') {
      throw new Error(`Gate ${taskId} was already settled (${gateDisplayText(view.subject)}).`)
    }
    const stamp = new Date().toISOString()
    const approved = decision === 'approve'
    const subject = approved
      ? gateTitle(kind, gateSubjectText(view.subject))
      : gateTitle(kind, `${GATE_REJECTED_MARKER} — ${gateSubjectText(view.subject)}`)
    const description = approved
      ? `Approved by the human at ${stamp}.`
      : `Rejected by the human at ${stamp}. Work that depended on this gate must be replanned.`

    let revision = view.revision
    if (view.status === 'pending') {
      const claimed = await ctx.agentTeams.updateTask(agent, {
        taskId,
        expectedRevision: revision,
        action: 'claim',
      })
      revision = claimed.revision
    }
    const edited = await ctx.agentTeams.updateTask(agent, {
      taskId,
      expectedRevision: revision,
      action: 'edit',
      subject,
      description,
    })
    await ctx.agentTeams.updateTask(agent, {
      taskId,
      expectedRevision: edited.revision,
      action: 'complete',
    })

    pushRoute(teamId, {
      subject: gateDisplayText(subject),
      stage: 'gate',
      target: 'human',
      reason: `gate "${kind}" ${approved ? 'approved' : 'rejected'}`,
      taskId,
    })
    return { gateId: taskId, kind, status: approved ? 'approved' : 'rejected' }
  }

  /**
   * Remove the synthetic gate scope that earlier releases wrote into a gate
   * Work Item's write scopes. Those scopes are real path prefixes, so the
   * Host compares them for overlap and reports a false conflict against the
   * plugin's own directory. The gate marker lives in the subject now, so the
   * scope is redundant.
   */
  async function cleanGateScopes(agent) {
    const membership = requireMember(agent, 'super-team')
    const tasks = ctx.agentTeams.listTasks(agent)
    const cleaned = []
    for (const task of tasks) {
      if (!isGateTask(task)) continue
      const legacy = (task.writeScopes ?? []).filter((scope) => scope.startsWith(GATE_SCOPE_PREFIX))
      if (!legacy.length) continue
      const kept = (task.writeScopes ?? []).filter((scope) => !scope.startsWith(GATE_SCOPE_PREFIX))
      await ctx.agentTeams.updateTask(agent, {
        taskId: task.id,
        expectedRevision: task.revision,
        action: 'edit',
        writeScopes: kept,
      })
      cleaned.push({ taskId: task.id, removed: legacy })
    }
    return { teamId: membership.id, cleaned }
  }

  // ------------------------------------------------------------- Watchdog --

  /**
   * Scan one Team for failed members, stalled work and unclaimed ready work.
   *
   * Every member may ask for a scan: the roster and the board belong to the
   * Team, not to the Lead, and the membership resolves to the same Team for
   * all of them. The scan therefore reads the board through the Team root,
   * which is a live member itself.
   */
  function scanTeam(caller) {
    const membership = ctx.agentTeams.tryMembership(caller)
    if (!membership) return []
    const root = membership.root
    const teamId = membership.id
    const members = ctx.agentTeams.listMembers(root)
    const tasks = ctx.agentTeams.listTasks(root)
    const found = []

    for (const member of members) {
      if (member.status === 'failed') {
        found.push({ kind: 'member-failed', member: member.name, detail: member.diagnostics?.join('; ') || 'member creation failed' })
      }
    }
    for (const task of tasks) {
      if (task.status === 'in_progress' && task.ownerName) {
        const owner = members.find((member) => member.name === task.ownerName)
        if (owner && (owner.status === 'inactive' || owner.status === 'failed')) {
          found.push({ kind: 'stalled', taskId: task.id, owner: task.ownerName, detail: `owner "${task.ownerName}" is ${owner.status}` })
        }
      }
      if (task.status === 'pending' && task.ready && !task.ownerName
        && !isGateTask(task) && packageOf(task) === undefined) {
        found.push({ kind: 'unclaimed', taskId: task.id, detail: task.subject })
      }
    }
    // The alert list is rebuilt from this scan instead of appended to, so a
    // condition that persists does not flood the ledger with copies of
    // itself, and a condition that clears disappears from it.
    const book = ledger(teamId)
    const previous = new Map(book.alerts.map((alert) => [alertKey(alert), alert]))
    book.alerts = found.map((alert) => {
      const before = previous.get(alertKey(alert))
      if (before && before.detail === (alert.detail ?? '')) return before
      return { time: Date.now(), ...alert }
    })
    return found
  }

  // ---------------------------------------------------------------- Tools --

  /** Render a canonical tool value as text content. */
  function renderJson(_args, value) {
    return [{ type: 'text', text: JSON.stringify(value, null, 2) }]
  }

  const OUTPUT_OBJECT = { type: 'object', additionalProperties: true }

  /**
   * Derive the package tree from the board. The package record lives in the
   * Work Item's own description, so this needs no side storage: the tree is
   * always exactly what the durable board says.
   */
  function derivePackages(tasks) {
    const byId = new Map(tasks.map((task) => [task.id, task]))
    const packages = []
    for (const task of tasks) {
      const record = packageOf(task)
      if (!record) continue
      const children = record.children.map((id) => byId.get(id)).filter(Boolean)
      const done = children.filter((child) => child.status === 'completed').length
      let status = 'open'
      if (task.status === 'completed') status = 'completed'
      else if (record.policy === 'manual') status = done === children.length && children.length ? 'awaiting-human' : 'open'
      else if (record.policy === 'any' && done > 0) status = 'settled-by-policy'
      else if (record.policy === 'all' && children.length && done === children.length) status = 'settled-by-policy'
      packages.push({
        id: task.id,
        goal: task.subject,
        completion: record.policy,
        children: record.children,
        done,
        total: children.length,
        status,
        revision: task.revision,
      })
    }
    return packages
  }

  /**
   * Settle the packages whose policy is already satisfied. The `manual`
   * policy is never settled here: a human closes those.
   */
  async function settleReadyPackages(agent) {
    const tasks = ctx.agentTeams.listTasks(agent)
    const ready = derivePackages(tasks).filter((entry) => entry.status === 'settled-by-policy')
    for (const entry of ready) {
      try {
        await settlePackage(agent, entry.id, `${entry.completion} ${entry.done}/${entry.total} item(s) landed`)
      } catch {
        /* a package that cannot settle now is retried on the next scan */
      }
    }
  }

  /** The whole board state of one Team, for the model and for the panel. */
  async function snapshot(agent) {
    const membership = requireMember(agent, 'team_status')
    const teamId = membership.id
    const members = ctx.agentTeams.listMembers(agent)
    // A package whose policy is satisfied is settled before the board is
    // read, so the panel never shows a finished package as still open.
    await settleReadyPackages(agent)
    const tasks = ctx.agentTeams.listTasks(agent)
    const board = ledger(teamId)

    // Gates are derived from the durable board, so the gate list and every
    // verdict survive a plugin reload; nothing about a gate lives only in
    // plugin memory.
    const gates = tasks.filter(isGateTask).map((task) => {
      const kind = gateKindOf(task) ?? 'sensitive'
      const marked = gateSubjectText(task.subject)
      const rejected = marked.startsWith(GATE_REJECTED_MARKER)
      return {
        id: task.id,
        kind,
        subject: gateDisplayText(task.subject),
        detail: task.description,
        status: rejected ? 'rejected' : task.status === 'completed' ? 'approved' : 'pending',
        revision: task.revision,
      }
    })

    return {
      teamId,
      role: membership.role,
      name: membership.name,
      members: members.map((member) => ({
        name: member.name,
        role: member.role,
        status: member.status,
        description: member.description ?? '',
        model: member.model ?? '',
        provider: member.provider ?? '',
        diagnostics: member.diagnostics ?? [],
      })),
      tasks: tasks.map((task) => ({
        id: task.id,
        revision: task.revision,
        subject: task.subject,
        displaySubject: isGateTask(task) ? gateDisplayText(task.subject) : task.subject,
        description: task.description,
        status: task.status,
        owner: task.ownerName ?? null,
        blockedBy: task.blockedBy,
        ready: task.ready,
        writeScopes: task.writeScopes,
        writeScopeWarnings: task.writeScopeWarnings ?? [],
        gate: gateKindOf(task) ?? null,
        isPackage: packageOf(task) !== undefined,
        package: (() => {
          for (const entry of derivePackages(tasks)) {
            if (entry.children.includes(task.id)) return entry.id
          }
          return null
        })(),
      })),
      gates,
      packages: derivePackages(tasks),
      routes: board.routes,
      alerts: board.alerts,
      availableCommands: commandCatalog(agent),
    }
  }

  /** The command names this agent can run, for diagnosis. */
  function commandCatalog(agent) {
    try {
      const commands = ctx.get('commands')
      if (!commands) return []
      return commands.list(agent).map((descriptor) => descriptor.name)
    } catch {
      return []
    }
  }

  /** Install the SuperAgentTeam tool set inside one exact Agent scope. */
  function installTools(agent) {
    const scoped = agent.ctx
    const disposers = []
    const register = (disposer) => { disposers.push(disposer) }

    try {
      register(scoped.systemPrompt.section({
        name: 'super-agent-team:policy',
        order: sectionOrder(scoped, 'TEAM_POLICY', 40),
        text: teamPolicy(),
      }))

      register(scoped.tools.register({
        name: 'team_intake',
        description: 'Hand a work request to the SuperAgentTeam Router. The Router filters the request with a rule engine, creates a durable Work Item on the shared board and notifies the worker it chose. A request the rules cannot place is escalated to the Team Lead as an unowned Work Item instead of being guessed at.',
        parameters: {
          type: 'object',
          properties: {
            subject: { type: 'string', description: 'Concise work-item title.' },
            description: { type: 'string', description: 'Full request, acceptance criteria and context.' },
            target: { type: 'string', description: 'Optional teammate name that bypasses the rule filter.' },
            write_scopes: {
              type: 'array',
              items: { type: 'string' },
              description: 'Advisory workspace-relative prefixes this work expects to modify.',
            },
          },
          required: ['subject', 'description'],
          additionalProperties: false,
        },
        output: { schema: OUTPUT_OBJECT, render: renderJson },
        async execute(args, exec) {
          const agent = exec.agent
          requireMember(agent, 'team_intake')
          const result = await intake(agent, {
            subject: args.subject,
            description: args.description,
            target: args.target,
            writeScopes: args.write_scopes,
          }, exec.signal)
          return result
        },
      }))

      register(scoped.tools.register({
        name: 'team_plan',
        description: 'Split one request into a Work Package: several Work Items, each routed to the worker that fits, tied together by a package Work Item on the board. Choose the completion policy per package: all (every item must land), any (one acceptable path is enough), or manual (the items are done and a human closes the package).',
        parameters: {
          type: 'object',
          properties: {
            goal: { type: 'string', description: 'What the whole package is trying to achieve.' },
            completion: {
              type: 'string',
              enum: ['all', 'any', 'manual'],
              description: 'When the package counts as done. Choose per package: all, any or manual.',
            },
            description: { type: 'string', description: 'Context every item shares.' },
            items: {
              type: 'array',
              description: 'The items the request splits into.',
              items: {
                type: 'object',
                properties: {
                  subject: { type: 'string', description: 'Concise item title.' },
                  description: { type: 'string', description: 'What this item must deliver.' },
                  target: { type: 'string', description: 'Optional teammate name that bypasses the rule filter.' },
                },
                required: ['subject'],
              },
            },
          },
          required: ['goal', 'items'],
          additionalProperties: false,
        },
        output: { schema: OUTPUT_OBJECT, render: renderJson },
        async execute(args, exec) {
          return await plan(exec.agent, args, exec.signal)
        },
      }))

      register(scoped.tools.register({
        name: 'team_status',
        description: 'Read the SuperAgentTeam board: roster with live status, Work Items with owners and blockers, pending human gates, the recent routing ledger and watchdog alerts.',
        parameters: { type: 'object', properties: {}, additionalProperties: false },
        output: { schema: OUTPUT_OBJECT, render: renderJson },
        async execute(_args, exec) {
          return await snapshot(exec.agent)
        },
      }))

      register(scoped.tools.register({
        name: 'team_gate_request',
        description: 'Raise a human hard gate before a merge, release or sensitive change. The gate becomes a Work Item that dependent work can block on, so nothing ships until a human approves it. You cannot approve your own gate.',
        parameters: {
          type: 'object',
          properties: {
            kind: { type: 'string', description: 'Gate kind, for example merge, release or sensitive.' },
            subject: { type: 'string', description: 'What needs a human decision.' },
            detail: { type: 'string', description: 'Evidence the human needs: the diff, the plan, the risk.' },
          },
          required: ['kind', 'subject'],
          additionalProperties: false,
        },
        output: { schema: OUTPUT_OBJECT, render: renderJson },
        async execute(args, exec) {
          return await requestGate(exec.agent, { kind: args.kind, subject: args.subject, detail: args.detail })
        },
      }))

      register(scoped.tools.register({
        name: 'team_watchdog',
        description: 'Scan the team for failed members, work whose owner stopped moving, and ready work nobody claimed. Returns the alerts found by this scan.',
        parameters: { type: 'object', properties: {}, additionalProperties: false },
        output: { schema: OUTPUT_OBJECT, render: renderJson },
        execute(_args, exec) {
          const membership = requireMember(exec.agent, 'team_watchdog')
          const alerts = scanTeam(exec.agent)
          return { teamId: membership.id, scanned: true, alerts }
        },
      }))
    } catch (error) {
      for (const dispose of disposers.reverse()) dispose()
      throw error
    }

    return () => { for (const dispose of disposers.reverse()) dispose() }
  }

  // Install the tools in every live or subsequently published Team member.
  const installed = new Map()
  const maybeInstall = (agent) => {
    if (installed.has(agent)) return
    if (ctx.agentTeams.tryMembership(agent) === undefined) return
    installed.set(agent, installTools(agent))
  }
  for (const agent of ctx.agents.list()) maybeInstall(agent)
  ctx.on('agent/created', ({ agent }) => maybeInstall(agent))
  ctx.on('agent/disposed', ({ agent }) => {
    installed.get(agent)?.()
    installed.delete(agent)
  })
  ctx.effect(() => () => {
    for (const dispose of installed.values()) dispose()
    installed.clear()
  }, 'super-agent-team.scopedTools()')

  // -------------------------------------------------------------- Guard ---

  // A monotonic guard: the model cannot settle a gate. Only the human
  // control surface (the `super-team` command) can, and that path never
  // goes through a tool call.
  ctx.effect(() => ctx.tools.guard((execution) => {
    if (execution.name !== 'team_task_update') return undefined
    const agent = execution.agent
    if (!agent) return undefined
    const args = parseArguments(execution.arguments)
    const taskId = typeof args.task_id === 'string' ? args.task_id : undefined
    if (!taskId) return undefined
    let view
    try { view = ctx.agentTeams.getTask(agent, taskId) } catch { return undefined }
    if (!view) return undefined
    if (isGateTask(view)) {
      return `Work Item ${taskId} is a human hard gate. The model cannot approve or reject a gate; ask the human through the SuperAgentTeam control surface.`
    }
    const record = packageOf(view)
    if (record && record.policy === 'manual') {
      return `Work Item ${taskId} is a work package a human has to close. The model cannot settle it; ask the human through the SuperAgentTeam control surface.`
    }
    return undefined
  }), 'super-agent-team.gateGuard()')

  // ------------------------------------------------------------ Command ---

  // The human control surface. The panel and the composer both reach the
  // same Host operations through this one command. The command registry is
  // optional: without it the plugin still schedules work, it just has no
  // human-facing control surface.
  // The injected context carries the `commands` service; the outer context
  // does not declare it, so reading `ctx.commands` there throws and the
  // command would never be registered.
  ctx.inject(['commands'], (commandCtx) => {
    commandCtx.commands.register({
    name: 'super-team',
    description: 'SuperAgentTeam control surface: inspect the board, submit work to the Router, or settle a human hard gate.',
    input: { hint: '<state | intake <request> | plan <goal> | <item> | ... | approve <taskId> | reject <taskId> | complete <packageId> | delete <taskId> | clean-scopes>' },
    handler: async ({ agent, rawInput, signal }) => {
      const line = String(rawInput ?? '').trim()
      const [verb = '', ...rest] = line.split(/\s+/)
      const argument = rest.join(' ').trim()
      try {
        switch (verb) {
          case '':
          case 'state': {
            const state = await snapshot(agent)
            return { kind: 'success', text: JSON.stringify(state) }
          }
          case 'intake': {
            if (!argument) return { kind: 'error', text: 'intake needs a request text.' }
            const result = await intake(agent, { subject: argument.slice(0, 80), description: argument }, signal)
            return {
              kind: 'success',
              text: result.routed
                ? `Routed to ${result.target} as Work Item ${result.taskId} (${result.reason}).`
                : `Escalated to the Team Lead as Work Item ${result.taskId} (${result.reason}).`,
            }
          }
          case 'approve':
          case 'reject': {
            if (!argument) return { kind: 'error', text: `${verb} needs a Work Item id.` }
            const result = await decideGate(agent, argument, verb === 'approve' ? 'approve' : 'reject')
            return { kind: 'success', text: `Gate ${result.gateId} (${result.kind}) ${result.status}.` }
          }
          case 'plan': {
            if (!argument) return { kind: 'error', text: 'plan needs a goal.' }
            // <policy>: <goal> | <item> | <item> ...
            const parts = argument.split('|').map((part) => part.trim()).filter(Boolean)
            let policy = 'all'
            let goal = parts.shift() ?? argument
            const declared = /^(all|any|manual):\s*(.*)$/.exec(goal)
            if (declared) {
              policy = declared[1]
              goal = declared[2] || goal
            }
            const items = parts.length
              ? parts.map((subject) => ({ subject, description: subject }))
              : [{ subject: goal, description: goal }]
            const result = await plan(agent, { goal, completion: policy, items }, signal)
            return {
              kind: 'success',
              text: `Package ${result.packageId} (${result.goal}) with ${result.children.length} item(s), completion "${result.completion}".`,
            }
          }
          case 'complete': {
            if (!argument) return { kind: 'error', text: 'complete needs a Work Package id.' }
            const result = await settlePackage(agent, argument, 'Settled by the human.')
            return { kind: 'success', text: `Package ${result.packageId} (${result.goal}) settled.` }
          }
          case 'delete': {
            if (!argument) return { kind: 'error', text: 'delete needs a Work Item id.' }
            const view = ctx.agentTeams.getTask(agent, argument)
            if (!view) return { kind: 'error', text: `No Work Item "${argument}" on this board.` }
            // Deleting a package takes its items with it: leaving them
            // behind would scatter them across the board as orphans.
            const record = packageOf(view)
            const items = record
              ? ctx.agentTeams.listTasks(agent).filter((task) => record.children.includes(task.id))
              : []
            await ctx.agentTeams.updateTask(agent, {
              taskId: argument,
              expectedRevision: view.revision,
              action: 'delete',
            })
            for (const item of items) {
              try {
                const current = ctx.agentTeams.getTask(agent, item.id)
                if (!current || current.status === 'deleted') continue
                await ctx.agentTeams.updateTask(agent, {
                  taskId: item.id,
                  expectedRevision: current.revision,
                  action: 'delete',
                })
              } catch {
                /* an item that cannot be removed now stays on the board */
              }
            }
            pushRoute(requireMember(agent, 'super-team').id, {
              subject: gateDisplayText(view.subject),
              stage: 'human',
              target: 'human',
              reason: `Work Item ${argument} was deleted by the human`,
              taskId: argument,
            })
            return {
              kind: 'success',
              text: items.length
                ? `Work Item ${argument} and ${items.length} item(s) deleted.`
                : `Work Item ${argument} deleted.`,
            }
          }
          case 'clean-scopes': {
            const result = await cleanGateScopes(agent)
            return {
              kind: 'success',
              text: result.cleaned.length
                ? `Removed the legacy gate scope from ${result.cleaned.map((entry) => entry.taskId).join(', ')}.`
                : 'No gate carries a legacy scope.',
            }
          }
          default:
            return { kind: 'error', text: `Unknown subcommand "${verb}". Use state, intake, approve, reject, complete, delete or clean-scopes.` }
        }
      } catch (error) {
        return { kind: 'error', text: error instanceof Error ? error.message : String(error) }
      }
    },
    })
  })

  // ----------------------------------------------------------- Watchdog ---

  ctx.effect(() => ctx.timer.interval(() => {
    for (const agent of ctx.agents.list()) {
      const membership = ctx.agentTeams.tryMembership(agent)
      if (membership?.role !== 'lead') continue
      try { scanTeam(agent) } catch { /* a team can disappear mid-scan */ }
    }
  }, WATCHDOG_INTERVAL_MS), 'super-agent-team.watchdog()')

  // --------------------------------------------------------- Public API ---

  // A small, stable Host surface other packages and the panel can read.
  if (typeof ctx.provide === 'function') {
    ctx.effect(() => ctx.provide('superAgentTeam', {
      intake: (agent, request, signal) => intake(agent, request, signal),
      requestGate: (agent, request) => requestGate(agent, request),
      decideGate: (agent, taskId, decision) => decideGate(agent, taskId, decision),
      scan: (agent) => scanTeam(agent),
      snapshot: (agent) => snapshot(agent),
    }), 'super-agent-team.service()')
  }
}
