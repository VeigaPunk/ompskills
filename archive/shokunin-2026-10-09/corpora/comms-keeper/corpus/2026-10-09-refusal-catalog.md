# 2026-10-09 — refusal catalog (TowerProtocolError and friends)

**Asked.** Every protocol refusal, grouped by surface.
**Sources.** 49 `new TowerProtocolError(` sites (43 store, 4 towerService, 1 initTool, 1 teardownTool) + 11 `block()` merge sites + non-TPE refusals; full table in the lane report.
**Observed.**
- All `TowerProtocolError`/`GitError` surface as `{output, isError: true}` via `runTowerTool` (`tools__support.ts.js:9-17`); anything else (malformed `state.json` `SyntaxError`, multi-line frontmatter `Error`) is rethrown raw.
- Remedy-bearing messages worth quoting: `run TowerInit first`; `TowerMission status=abandoned` (scope conflicts, uncompletable build missions, review cap); `the tower must widen the mission scope (TowerMission scope patch) or revert those changes`; `tick finished tasks with task_done, or drop legitimately descoped ones with task_drop (a reason is mandatory …)`; `merge in Dependency Flow order`; `re-review required` (tip moved).
- Surfaces: init/adopt, plan/scope, mission update, send, finding, review, merge (each logged as `merge.blocked`), worktree, teardown (teardown refuses nothing in the store; dirty trees are kept and reported).
**Changed.** Nothing — read-only research (seed entry).
**Unknown.** Schema-level (zod) refusals in unextracted modules.

**Lane.** ErrorTaxonomy (critic). Report: `.tower/fleets/shokunin3/reports/comms-keeper/ErrorTaxonomy.md`.
