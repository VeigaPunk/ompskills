# 2026-10-09 — hub creation, ownership (sessionId), adopt and release

**Asked.** What does init create, and how do `adopt`/`release` treat a hub owned by another session?
**Sources.** `protocol__store.ts.js:55-195` (`isInitialized`, `ensureRepository`, `init`, `rebase`, `adoptForeignRoster`, `adopt`, `release`, `ensureGitExclude`), `protocol__repoRoot.ts.js`, `tools__init__initTool.ts.js`, `towerService.ts.js:164-257`.
**Observed.**
- Fresh `init` (`:78-135`): refuses a repo with no commits, a detached HEAD without explicit base, a non-local base; then `mkdir -p` `inbox findings reviews missions log` and `.tower/worktrees`; `ensureGitExclude` appends `.tower/` to the **common** `info/exclude` (verified: ompskills `.git/info/exclude:7`, `~/.git/info/exclude`); `save(state)`; **`writeFile(activity.log, "")`** (`:123`); `renderMissionsIndex`; log `tower init mode=branch base=<b> ref=.tower/comms/MISSIONS.md`.
- Re-`init` on an existing hub (`:82-93`): never resets state, never changes base (a different requested base is returned as `ignoredBase`), never re-renders; it calls `adoptForeignRoster`.
- `adoptForeignRoster(state,s)` (`:158-170`): if `s` differs from `state.sessionId`, **deletes every roster entry whose `sessionId != s`**, sets `state.sessionId=s`, logs `tower adopt session=<s> previous=<old|unknown> retired=<names>`. Missions and worktrees untouched.
- Tower-mode enter always adopts (`towerService.ts.js:203`). Hub B proof: session `session_ead1cd07-…` entered tower mode at 21:30:28Z, made no Tower* calls, and retired all 10 roster entries of creator `session_56151869-…` (hub B log line 80). Mission `owner` fields still name the retired agents.
- `release(s)` (`:180-186`, on `/tower off`): clears `sessionId` only if it equals `s`, logs `tower release session=<s>`; roster untouched.
- `TowerInit`/`TowerTeardown` refuse only when the recorded owner is in **this process's** in-memory sessions map — another kimi process's live session counts as dead [INFERENCE from `SessionManager.sessions` being a `Map`].
- `resolveTowerRepoRoot(cwd)`: any cwd containing `/.tower/worktrees/` maps to the text before it; any other cwd is used as-is (a subdirectory cwd becomes its own hub root).
- `rebase(base)` (`:136-151`) is refused while missions are open, saves the new base and logs `rebase from= to=`, but **does not re-render** `MISSIONS.md` (its `Base:` line goes stale).
**Changed.** Nothing — read-only research (seed entry).
**Unknown.** Cross-process liveness detection; whether `ensureRepository` on a non-repo cwd is reachable in practice.

**Lane.** StoreInitAdopt (scout). Report: `.tower/fleets/shokunin3/reports/comms-keeper/StoreInitAdopt.md`.
