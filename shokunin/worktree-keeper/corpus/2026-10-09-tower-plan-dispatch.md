# 2026-10-09 — tower worktree/dispatch isolation discipline

**Asked.** Extract the tower SKILL's `## Plan before dispatch` worktree/dispatch discipline, quoted with anchors.
**Sources.** `.omp/skills/tower/SKILL.md:19-45` (`## Plan before dispatch`); cross-check `omp worktree --help`.
**Observed.**
- The isolation command is `omp worktree add -C REPO -b UNIQUE_BRANCH PATH [COMMIT]` (SKILL.md:27-28); each concurrent writer gets its own branch and path; run the worker with `--cwd` = its own worktree; do not guess a base commit or reuse another writer's branch/path (:30-31).
- "OMP `task` agents are **not worktree-isolated by default**" (:31-32) — separation (task, subprocess, pane) is not a worktree.
- If the worktree substrate is unavailable or isolation cannot be established: do not dispatch concurrent writers; work serially or give an honest advisory plan (:32-35).
- Models resolve only through OMP's global role aliases (the approved buckets `m_strong`/`m_mid`/`m_fast`, other `m_*` as named lanes); never pin/name a provider-model, change routing, or expose credentials (:38-45).
- CLI cross-check: `omp worktree --help` confirms `-C`=`--cwd` (Repository/base directory), `-b`=`--branch`, usage `worktree [ACTION] [PATH] [COMMIT] [FLAGS]` — no drift.
**Changed.** Seed entry; no repo file changed by the lane.
**Unknown.** Modality markings are [INFERENCE] from prose (the section carries no literal RFC-2119 keywords); the base-commit default of the optional `[COMMIT]` is a `omp worktree add` property, covered in the add-argv entry.

**Lane.** TowerPlanDispatch (scout). Report: `reports/worktree-keeper/TowerPlanDispatch.md`.
