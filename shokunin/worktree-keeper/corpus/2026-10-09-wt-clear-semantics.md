# 2026-10-09 — `omp worktree clear` semantics (orphans, --all, the .git hazard)

**Asked.** Characterize `omp worktree clear` without destroying real work.
**Sources.** `omp worktree clear --help`; ELF `worktree-cli.ts` strings; a scratch hub under `/tmp` with `OMP_WORKTREE_DIR` override; peers TowerSkillDrift/TowerSettleCleanup.
**Observed.**
- Scan root is `worktree.base` (default `~/.omp/wt`, `OMP_WORKTREE_DIR` override) — cwd-independent, **not** repo-scoped.
- "Orphaned" here means a hub dir that is empty ("empty directory"), unrecognizable ("no recognizable worktree contents"), a task-isolation sandbox whose owner PID (`.omp-isolation-owner.json`) is dead, or a `.git`-file worktree whose `gitdir`/parent repo is missing/malformed/unreadable — **not** the git sense of a prunable registration.
- Selection: `e.all ? t : t.filter(a => a.orphanReason !== undefined)` — plain `clear` touches orphans only; `--all` touches every entry, including live `pr-checkout`/isolation entries.
- No path targeting: a positional PATH is accepted and silently ignored (proved 3 ways); help documents PATH as `(add)` only; no `remove`/`prune` verb (exit 1).
- Real clear transcript (scratch hub): 6 orphaned dirs removed, exit 0 ("removed <path>" lines, "6 removed"); a stale prunable git registration for a removed entry's `parentRepo` disappeared as a side effect (a `git worktree prune` on that repo); live entries kept. `--all` then removed the live `pr-checkout` via `git worktree remove` (de-registered) and a live isolation sandbox via `rm -rf`. Branches survive — `clear` never deletes branches.
- Failure path: an EACCES removal failure → "failed <path>" + "1 removed · 1 failed", exit 1; `--json` `{removed,failed,results[]}`; exit 1 iff `failed>0`.
- `--dry-run`: "would remove <path>" / "N dirs would be removed."; `--json` `{wouldRemove}`; the empty case text differs by `--all` ("No orphaned worktrees to remove." vs "No worktrees to remove."); `--json` empty case gives `{removed:0,kept:N}`; never writes (`.git` verified intact).
- A deleted worktree dir (inside or outside the hub) is **not** reported by `clear --dry-run` (exit 0, nothing selected): git keeps the prunable registration and `clear` is blind to git-level orphaned registrations — it cleans them only via the prune side effect, or `git worktree prune`/`remove`.
- **Safety finding:** a mis-set base (`OMP_WORKTREE_DIR` pointing at the repo dir) makes `<repo>/.git` classify as an orphan (verbatim reason "no recognizable worktree contents"), so a plain `clear` (no `--all`) would `rm -rf` it (dry-run preview captured; corroborated by TowerSkillDrift D2).
- Nested `hub/<group>/<name>` entries are classified too; removing a leaf leaves the intermediate group dir behind.
**Changed.** Seed entry.
**Unknown.** `worktreeRemove(path,true)`'s second arg read as force [INFERENCE]; the "parent repo missing" reason is source-only (degenerate window); `kept = t.length` is from source with one confirming observation; the isolation marker literals `["m","merged"]` are quoted verbatim and the mount-teardown role is [INFERENCE].

**Lane.** WtClearSemantics (mutation-tester). Report: `reports/worktree-keeper/WtClearSemantics.md`.
