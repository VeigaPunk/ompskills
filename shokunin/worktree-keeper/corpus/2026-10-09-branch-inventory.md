# 2026-10-09 — repo branch naming inventory

**Asked.** Inventory the repo's real branch naming and derive the grammar actually used.
**Sources.** `git -C /home/vgpnk/Projects/ompskills for-each-ref --format='%(refname:short)' refs/heads`; `sighting/tower-fleet.mjs:610,805-811`; `.omp/skills/tower/SKILL.md:143`; `sighting/l1-prompt.md:151-156`.
**Observed.**
- 44 local branches, 35 on `tower/*`. Per fleet: `f` 1, `shokunin` 8, `shokunin2` 8, `tower1` 17, `towerprobe` 1. 33 merged into main; 2 not (`tower/tower1/tf-launcher`, `tower/tower1/tf-audit-wall`).
- Grammar: `tower/<fleet>/<mission-id>`, exactly 3 slash segments (35/35). Fleet = the fleet spec's `fleet` field. Mission-id styles: role-noun (`worktree-keeper`, `fleet-warden`), `tf-` prefix (tower1/towerprobe), bare code (`m1` for fleet `f`). Worktree path is 1:1: `<repo>/.tower/worktrees/<fleet>/<id>`.
- Sources: launcher `branch: `tower/${spec.fleet}/${mission.id}`` (:610); add argv `-b row.branch` (:805-811); tower skill :143; lane branch prescribed by l1-prompt.md:151-156.
- Drift/reality: the lane-branch grammar `tower/<fleet>/<id>-<lane>` is prescribed but 0/35 branches realize it (no 4th segment, no `-<lane>` suffix) — consistent with read-only-lane fleets. tower1 has 17 branches vs 16 spec ids (`tf-audit-safety` exists though its launch failed). A second, non-tower lineage exists: `.tower/worktrees/wt-band` → `feat/sighting-band-16-32`, `wt-launcher` → `feat/tower-fleet-launcher`. One stray out-of-repo tree `/tmp/cov-r2/gitdemo/trees/w1` on `tower/f/m1`.
**Changed.** Seed entry.
**Unknown.** Mission-id style is convention only — `tower-fleet.mjs:610` interpolates with no charset validator; whether tower/f's `f` was a real fleet (no `.tower/fleets/f/` survives).

**Lane.** BranchInventory (scout). Report: `reports/worktree-keeper/BranchInventory.md`.
