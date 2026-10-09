# 2026-10-09 — roster identity, death and revival

**Asked.** How callers map to names and how agent death is recorded.
**Sources.** `protocol__store.ts.js:230-296`, `tools__spawn__spawnTool.ts.js:93-209`, `towerService.ts.js:99-106, 299-305`.
**Observed.**
- `agentId == "main"` → caller name `tower`; else the roster entry's `name` by `agentId`; unknown → "is not a tower participant".
- `registerAgent` replaces any entry with the same `agentId`, then refuses a duplicate name; reserved `tower`, `all`.
- Death = fields on the entry (`diedAt`, `deathStatus` ∈ {failed, timed_out, killed, lost}, `deathReason` raw) set by `markAgentDied` (idempotent) from task-terminated notices; logged `tower died …`. `clearAgentDied` on restart logs `tower revived …`. Neither hub has a died/revived line.
- Roster persists across teardown; `adopt` deletes other sessions' entries (hub B: owner names now unbacked by roster; no death warning results).
- Reconciliation: hub A 7 roster = 7 `spawn` lines; hub B 10 `spawn` lines, roster 0 after adopt.
**Changed.** Nothing — read-only research (seed entry).
**Unknown.** Hub A `agent-6` gap; name-check vs registration race.

**Lane.** RosterLifecycle (scout). Report: `.tower/fleets/shokunin3/reports/comms-keeper/RosterLifecycle.md`.
