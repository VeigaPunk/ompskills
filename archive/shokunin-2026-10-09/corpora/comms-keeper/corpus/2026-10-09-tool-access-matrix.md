# 2026-10-09 — who may call which Tower tool

**Asked.** Tool visibility and authority per role; can anything write the hub outside the tools?
**Sources.** `tower.ts.js` (`TOWER_TOOL_NAMES`, `TOWER_WORKER_PROFILE`), `workerProfile.ts.js:8-37`, `towerFeature.ts.js`, `tools__support.ts.js`, `towerService.ts.js:151-163` (write guard).
**Observed.**
| tool | tower (main) | worker / survey worker | reviewer |
| --- | --- | --- | --- |
| TowerInit, TowerPlan, TowerSpawn | yes (mode active) | not visible | not visible |
| TowerMerge, TowerTeardown | yes (main-only, **no** mode check) | not visible | not visible |
| TowerSend, TowerInbox, TowerFinding, TowerStatus | yes (inbox: all) | yes (inbox: own + all) | yes |
| TowerReview | any target | refused | own `reviewTarget` only, ≤5 rounds |
| TowerMission | full patch | read any; patch own mission | read any; patch refused |

- Refusals: main-only → `Tower orchestration tools are only supported by the main agent.`; mode → `tower mode is not active — only the user can enable it (with /tower on), never the agent. …`; caller → `agent "<id>" is not a tower participant — only spawned workers/reviewers and the tower can use tower tools`.
- "The tools are the only writers" is **convention, not invariant**: the only code guard vetoes `Write`/`Edit` by `tower-worker`-profile agents *with a worktree slot* outside that worktree. Bash is unguarded for every role; reviewers (no slot) and the main agent are unguarded; the guard fails open on missing accesses or unreadable `state.json`.
**Changed.** Nothing — read-only research (seed entry).
**Unknown.** `mcp__*` tool access reporting.

**Lane.** ToolAccessProfile (critic). Report: `.tower/fleets/shokunin3/reports/comms-keeper/ToolAccessProfile.md`.
