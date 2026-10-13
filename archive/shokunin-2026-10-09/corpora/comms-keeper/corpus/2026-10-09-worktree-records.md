# 2026-10-09 — worktree records in the hub (not git discipline)

**Asked.** How the hub records kimi worktrees and teardown.
**Sources.** `protocol__store.ts.js:801-894` (`addWorktree`, `teardown`), `tools__teardown__*.js`, `tui__commands__tower.ts.js`.
**Observed.**
- `wt-<n>` is fixed at plan time; `state.json` stores only the slot name; roster has `worktree`/`branch` for workers only; reviewers never get a worktree.
- Log verbs: `worktree.add worktree= branch= base= [spawn_base=]` (before `spawn`), `worktree.keep worktree= reason=uncommitted-changes`, `worktree.remove worktree=`, `worktree.remove.failed worktree= reason=<raw error>`, `worktree.remove.skipped worktree= reason=already-removed`, then `teardown [force=yes]`.
- Teardown iterates every mission regardless of status (the "after all merged" precondition is prose only), never deletes branches, `.tower/comms/`, `state.json` or roster, and does not save state. Tower mode stays on.
- `.tower/worktrees/` is shared with the omp fleet launcher (`<fleet>/<id>`); kimi `wt-N` dirs from both hubs are gone (torn down). Git mechanics belong to worktree-keeper.
**Changed.** Nothing — read-only research (seed entry).
**Unknown.** Fail-open dirty check when `git status` errors (source-only).

**Lane.** WorktreeRecords (scout). Report: `.tower/fleets/shokunin3/reports/comms-keeper/WorktreeRecords.md`.
