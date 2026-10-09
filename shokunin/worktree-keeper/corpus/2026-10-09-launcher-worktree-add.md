# 2026-10-09 — launcher worktree creation contract

**Asked.** Extract the worktree creation contract from `sighting/tower-fleet.mjs` with exact anchors.
**Sources.** `sighting/tower-fleet.mjs` (`buildPlan` :597-610; worktreeRoot default :394; reuse gate :797-799; add argv :805-811; failure :812-819; removal comment :22-24 and close print :1221-1223); `spawnSync` import :70, shell-out :507-519.
**Observed.**
- Branch: `tower/<fleet>/<id>` (`branch: `tower/${spec.fleet}/${mission.id}``, :610). Worktree path: `<worktreeRoot>/<id>` (`path.join(spec.worktreeRoot, mission.id)`, :599). Default `worktreeRoot` = `<repo>/.tower/worktrees/<fleet>` (:394).
- Creation gate: `assertSafeWriteTarget(row.worktree, spec.worktreeRoot, ...)` runs first, then `if (existsSync(row.worktree)) record.worktreeReused = true;` — an existing path is reused, never clobbered (:797-799).
- Add argv (:805-811), invoked via `run()`→`spawnSync` (explicit argv array, no shell; header invariant :29-30): `omp worktree add -C <spec.repo> -b tower/<fleet>/<id> <worktreeRoot>/<id> <spec.base>`.
- Add failure: non-zero status → `recordMissionFailure(..., "WORKTREE_ADD_FAILED", "omp worktree add exited <status>: ...")`, push the record, `continue` — per-mission, never a run abort (:812-819); the run ends `LAUNCH_PARTIAL` (exit 2).
- Removal: the launcher never runs `omp worktree clear`; worktrees are removed only by the operator with the exact per-path command the tool prints (`git -C <repo> worktree remove <worktree>`, :22-24, :1221-1223).
**Changed.** Seed entry.
**Unknown.** `spec.base` default/schema is `loadSpec`'s (covered elsewhere); `omp worktree add`'s own branch pre-existence semantics are the CLI's, not this file's — the launcher relies solely on the exit status.

**Lane.** LauncherWtAdd (scout). Report: `reports/worktree-keeper/LauncherWtAdd.md`.
