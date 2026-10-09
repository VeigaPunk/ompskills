# 2026-10-09 — integration history (merges, ordering, retries)

**Asked.** Characterize the first-tranche shokunin integration history.
**Sources.** `git log --merges --oneline`, `git log --format='%h %p %s'`, `git reflog show main`, `git merge-tree --write-tree`.
**Observed.**
- 8 merge commits, one per mission: `faa9ac2` wave-smith, `0d5804e` fleet-warden, `6c7a98a` mission-keeper, `e8ea7e0` skill-scribe, `297f26b` route-auditor, `503adfd` wall-watcher, `14e2753` test-smith, `9570775` host-smith. Message shape `Merge tower/shokunin/<id> (shokunin: <id> card + corpus)` — a custom `-m`, no generator in tracked sources.
- Style: all 8 have 2 parents (real merges, not fast-forward); `git reflog show main` says "Merge made by the ort strategy" for each; no `merge.ff` config; all clean (merge-tree tree == merge tree). The exact `--no-ff` argv is [INFERENCE] (grep of tracked sources: 0 hits); all 8 share timestamp `1791527976` (2026-10-09 03:39:36) — a batch.
- Ordering: branches created from `main` at `b251c5a` (02:12:32–02:12:51); per branch: r1 card+corpus commit → optional r2 → merge; the merges form a linear first-parent chain on main.
- r2 corrections exist on 6/8 before the merge batch (fleet-warden, mission-keeper, skill-scribe, wall-watcher, test-smith, host-smith); wave-smith and route-auditor merged without r2. `87c351a` is a later direct-to-main corpus-growth commit (+68 lines, wave-smith corpus).
- Cleanup: all 8 `tower/shokunin/*` branches and their `.tower/worktrees/shokunin/*` worktrees persist — integration did not retire lane worktrees (consistent with tower-fleet.mjs:1220 and l1-prompt.md:164-166).
**Changed.** Seed entry.
**Unknown.** Exact merge argv (no shell history/doc); origin of fleet-warden's empty `seed` commit `eb97f11`; whether the batch was scripted or manual.

**Lane.** MergeHistory (scout). Report: `reports/worktree-keeper/MergeHistory.md`.
