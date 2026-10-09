# 2026-10-09 — lane branches in reality: none; the unit is the mission

**Asked.** Do lane-level worktrees/branches actually appear in this repo?
**Sources.** `git for-each-ref`; `git worktree list`; `.git/worktrees`; `.tower/fleets/*/rounds/*.md` receipts; `sighting/l1-prompt.md:150-157,133-135`; a `/tmp` scratch probe.
**Observed.**
- Ref namespace has no `<mission>-<lane>` branch: all 35 `tower/*` branches accounted (44 local branches total), every leaf is a mission id. The only historical lane-created strays were recorded and removed — `tf-audit-launcher-r1.md:107-114` (tower/tf/alpha|beta, tower/tf2/alpha2); `git branch --list 'tower/tf*'` is now empty.
- Worktree inventory is mission-granular: `git worktree list` (37 entries) + `.git/worktrees` (38, incl. a stale fixture `wt1` with a missing HEAD) contain only mission ids; no lane names among the current shokunin2 sub-lanes; all 8 shokunin2 worktrees are porcelain-clean at base `87c351a`.
- Receipts attest no-lane-worktree across 9+ rounds / 41 files (mission-keeper-r2.md:72; skill-scribe-r1.md:43-44 & r2:33; wave-smith-r1.md:23-24; tf-audit-prompt-r2.md:93; tf-audit-wall-r2.md:84-86; tf-prompt-r1.md:55-56; tf-safety-r2-r1.md:107-109; tf-probe-band-r1.md:30-31; tf-towerdoc-r2.md:49 "launcher has no lane concept").
- Writer-lane branch per the L1 prompt (`:150-157`): `omp worktree add -C {{repo}} -b tower/{{fleet}}/{{missionId}}-<lane> <path> {{base}}`, `<path>` a sibling of the mission worktree; integrate via `git checkout <lane-branch> -- <paths>` (`:133-135`); a child ref is impossible (corroborated by a scratch test — exit 128).
- Empirical: the prompt's argv works (`add` exit 0, "Preparing worktree (new branch tower/f/m1-lane) … Cloned … via reflink", a real linked worktree), **but** created worktrees are invisible to `omp worktree list --json` (`[]`) and `clear --dry-run` ("No orphaned worktrees to remove") even with the lane tree live — matching the list-semantics drift.
**Changed.** Seed entry.
**Unknown.** Historical "never created" is receipt-based (a fully retired lane worktree would leave no forensically reachable trace) [INFERENCE]; registration semantics of bare/clone-first add paths and `clear --all` are peers' (WtAddFailures/WtClearSemantics).

**Lane.** LaneBranchReality (reviewer). Report: `reports/worktree-keeper/LaneBranchReality.md`.
