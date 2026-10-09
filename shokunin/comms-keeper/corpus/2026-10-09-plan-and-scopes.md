# 2026-10-09 — planning: ids, branches, scope reservation

**Asked.** How TowerPlan assigns ids/branches/worktrees and reserves scope.
**Sources.** `protocol__store.ts.js:297-367` (`plan`, `assertScopesDisjoint`), `tools__plan__*.js`, `protocol__baseWip.ts.js`.
**Observed.**
- `id = M<existing + position + 1>` (count-based; missions are never deleted, so never reused; a refused plan saves nothing). `branch = feat/<slugify(title,40)>`, `worktree = wt-<n>`. Titles must be printable ASCII.
- Branch must be unused by any existing mission (any status), unique in the batch, absent locally.
- Deps must name existing/same-batch ids; no cycle/self-dep check.
- Scope reservation is **literal stem prefix comparison, not picomatch**: build scopes of *open* missions (not merged/abandoned) conflict when one stem equals or `/`-prefixes another; an empty stem (`*`, `/**`) is refused as whole-repo, but `**` passes. Survey scopes are skipped ("informational, reserves nothing"). picomatch is used only by the merge out-of-scope gate.
- Dirty base on the recorded base branch is snapshotted into a commit at spawn (`tower: snapshot of uncommitted base checkout changes …`), not refused; refused only for unmerged paths, detached HEAD with WIP, or WIP on another branch.
- Log `tower plan missions=M1,M2,… ref=.tower/comms/MISSIONS.md`.
**Changed.** Nothing — read-only research (seed entry).
**Unknown.** picomatch dotfile default for `**` not executed.

**Lane.** PlanAndScopes (scout). Report: `.tower/fleets/shokunin3/reports/comms-keeper/PlanAndScopes.md`.
