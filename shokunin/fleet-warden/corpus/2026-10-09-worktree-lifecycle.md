# worktree-lifecycle — branch, worktree add, reuse, and skill copy

Asked: the branch name, add argv, reuse rule, add-failure handling, and skill resolution order.
Source: `sighting/tower-fleet.mjs` @ b251c5a. Lane: `WorktreeLifecycle`.

- Branch: `buildPlan` sets ``branch: `tower/${spec.fleet}/${mission.id}` `` (:610); copied to the
  record at :742.
- Creation gate: `if (existsSync(row.worktree))` → `record.worktreeReused = true` (:798-799),
  else the add (:800+).
- Add argv (:806-810): `["omp","worktree","add","-C",spec.repo,"-b",row.branch,row.worktree,
  spec.base]` via `run()` → `spawnSync` argv array (no shell).
- Add failure (:812-817): non-zero status → `recordMissionFailure(..., "WORKTREE_ADD_FAILED",
  ...)`, push the record, `continue` — per-mission, never a run abort.
- Skills (`skillSourceDirs` :684): roots in order (1) `<repo>/.omp/skills`, (2)
  `<ufoRoot>/.omp/skills`, (3) `~/.agents/skills`; `copySkill` (:692) returns on the first
  `existsSync` hit (later roots never consulted); each target write-guarded (:697) before
  `mkdirSync`/`cpSync` (:698-699); a miss returns null and only warns (:825-826).

Findings:
- **Reuse is silent.** The step-2 comment says "reuse ... with a warning" (:794), but the reuse
  branch :798-800 emits no `warn(...)`. A missing-worktree warning exists only in the creation
  branch and only when a wall row was adopted (:803). `.omp/skills/tower/SKILL.md` repeats the
  "reused with a warning" claim — drift; the source wins.
- **Reuse is keyed on `existsSync` alone** (:798) — it does not verify the path is a git worktree
  of `repo` or checked out on `branch`; an arbitrary directory at the slot counts as reuse and is
  never re-added.
- **`base` has no leading-dash guard** (:387), contrast `maxTime` (:391); it reaches the add argv
  verbatim (:810) — `spawnSync` argv means no shell injection.

Evidence: lanes `WorktreeLifecycle`, `ArgvIntegrity`.
