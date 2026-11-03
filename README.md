# SuperAgentTeam

A Super-agent scheduling layer over DeepSeek Harness Agent Teams.

- **Router** — two-stage message filtering: a deterministic rule engine
  (explicit name, skill-tag affinity, description keyword overlap) places a
  work request; a request the rules cannot place is escalated to the Team
  Lead as an unowned Work Item instead of being guessed at.
- **Work Items** — every routed request becomes a durable task on the shared
  Team board, with owner, blockers and advisory write scopes.
- **Hard gates** — a gate is a Work Item marked `gate:<kind>`. Work that
  lists a gate as a blocker stays blocked until a human approves it. A
  monotonic tool guard keeps the model from approving its own gate.
- **Watchdog** — reports failed members, stalled work and unclaimed ready
  work.

The full design document (Chinese) is kept alongside the plugin in the
author's local workspace (`SuperAgentTeam-方案.md`) and is not part of this
repository.

## Install

The plugin builds on the official Agent Teams bundle:

```yaml
# enable the Agent Teams foundation first
- name: '@deepseek-ai/dsh-experimental-agent-team-profile'
```

then install this directory as a bundle.

## Tests

```bash
node test/host.test.mjs      # rule layer and gate semantics (unit)
node test/render.test.mjs    # the control deck render path (offline React harness)
node test/contract.test.mjs  # gate lifecycle, tool guard and intake contract
```

`render.test.mjs` loads the real `client.js`, renders it with a miniature
React renderer, feeds it a realistic Host snapshot plus a realistic Session
projection, and asserts on the rendered tree — including that dispatching and
approving a gate reach the Host command channel with a real `AbortSignal`.

## Agent tools

| Tool | Purpose |
|---|---|
| `team_intake` | Hand a work request to the Router |
| `team_status` | Roster, Work Items, gates, routing ledger, watchdog alerts |
| `team_gate_request` | Raise a human hard gate before a merge, release or sensitive change |
| `team_watchdog` | Scan for failed members, stalled work and unclaimed ready work |

## Human control surface

```
/super-team state                  # the whole board as JSON
/super-team intake <request>       # submit work to the Router
/super-team approve <taskId>       # settle a gate (the model cannot do this)
/super-team reject <taskId>        # settle a gate
```

The Web GUI also renders the same surface as a **团队 / Team** tab inside the
conversation View row.
