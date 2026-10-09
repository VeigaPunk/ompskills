# 2026-10-09 — the merge gate as seen from the hub

**Asked.** Merge preconditions, refusal reasons, and what the hub records.
**Sources.** `protocol__store.ts.js:700-797` (`merge`, `block()`), `tools__merge__*.js`; every merge line in both logs.
**Observed.**
- Gate order: owning open mission → deps not open → survey (zero diff → `merge.noop`) → a review exists → latest mission-matched review `clean` → `reviewed_commit == tip` → mission-stamp check → every changed file matches `mission.scope` (picomatch) → base checkout on `state.base` → no dirty overlap → `git merge --no-ff`.
- Each refusal first logs `tower merge.blocked branch=<b> reason=<r>` with `r` ∈ `branch-owned-by-closed-missions, deps-unmerged, read-only-survey, no-review, not-clean, tip-moved, review-mission-mismatch, out-of-scope, base-mismatch, base-dirty` (only "no tower mission owns branch" is unlogged). The offending file list is in the error text, not the log.
- Success: status `merged`, save + re-render index and that mission file, log `tower merge branch= base= merge_commit=<7>`; survey: `tower merge.noop branch= kind=survey`. Merge writes nothing to `inbox/`, `reviews/`, `findings/`; `conflictsWith` goes only to tool output.
- `completed` is not a merge precondition in code; `review.merge` is ignored.
- Hub A: M1 noop; M3 `7b683c8`; M2 `db4ab07`; M4 `merge.blocked reason=out-of-scope` (19:14:13) → `mission.update scope=test/**,test/evidence/.gitignore` (19:14:31) → merge `d035dee` (19:14:48), no re-review. Hub B: 5 merges, 0 blocked. Every `merge_commit`'s second parent equals its clean review's `reviewed_commit`.
**Changed.** Nothing — read-only research (seed entry).
**Unknown.** Crash window between `mergeNoFf` and `save` (merged in git, not in state) — source-only.

**Lane.** MergeFlow (scout). Report: `.tower/fleets/shokunin3/reports/comms-keeper/MergeFlow.md`.
