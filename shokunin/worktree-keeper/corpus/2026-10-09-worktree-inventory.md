# 2026-10-09 — real worktree inventory and layout

**Asked.** Map the repo's real worktree layout as evidence for naming/discipline.
**Sources.** `git -C /home/vgpnk/Projects/ompskills worktree list`; `git worktree prune --dry-run -v`; the 5 `.tower/fleets/*/fleet.json`; `sighting/tower-fleet.mjs:394,421,610`; `.omp/skills/tower/SKILL.md:141-143`.
**Observed.**
- Layout rule: `path=<repo>/.tower/worktrees/<fleet>/<id>` ⇔ `branch=tower/<fleet>/<id>`; 34/34 fleet trees obey exactly (launcher `path.join(worktreeRoot, mission.id)` :421; `tower/${spec.fleet}/${mission.id}` :610; default `worktreeRoot` `.tower/worktrees/${fleet}` :394).
- Counts: `git worktree list` = 38 lines = 1 main + 37 registered worktrees. 36 under `.tower/worktrees/` (shokunin 8, shokunin2 8, tower1 17, towerprobe 1, plus flat `wt-band` and `wt-launcher`); 1 outside (`/tmp`). 1:1 with fleet.json missions: 34 mission trees; 2 legacy flat.
- Exceptions: two flat legacy trees break the pattern — `.tower/worktrees/wt-band` → `feat/sighting-band-16-32` (`4bb0b23`) and `.tower/worktrees/wt-launcher` → `feat/tower-fleet-launcher` (`3a688c7`); no fleet segment, no `tower/*` branch.
- Foreign trees: two outside `.tower/worktrees`, both `/tmp` probe artifacts — (a) `/tmp/cov-r2/gitdemo/trees/w1`, whose `.git` points into a **different** repo `/tmp/cov-r2/gitdemo/main` at `tower/f/m1@47e3f96` (an object ompkills lacks) → orphaned cross-repo registration, not auto-reaped (`prune --dry-run -v` silent); (b) `/tmp/wtprobe/wt1` (`wt1@e3fd96a`), created 08:42 during this inventory by a live sibling lane — not this lane's.
- Staleness: `prune --dry-run -v` is empty on every run — no missing checkout dirs, nothing auto-prunable. shokunin=8 distinct non-main commits, tower1=17 distinct non-main commits (retained prior fleets); shokunin2 all at `87c351a` (=main HEAD, live); towerprobe / tower1-safety-r2 single trees.
- Critical drift: `omp worktree list` does **not** enumerate the repo's git worktrees — from the repo root it printed "No agent-managed worktrees found under /home/vgpnk/.omp/wt." (exit 0) and `--json` printed `[]`. A keeper following `tower/SKILL.md:110-111,163-164` and `l1-prompt.md:163-164` literally sees none of the 36 fleet trees; CLI help wins per the skill's own precedence note (:122-124).
- `.tower/fleets` has 5 dirs vs 6 worktree groups; `tower1-safety-r2`'s `fleet.json` records `fleet="tower1"` but a `stateDir` overridden to `fleets/tower1-safety-r2` while `worktreeRoot` stays `worktrees/tower1` → branch/path key to `fleet`, not the stateDir basename.
**Changed.** Seed entry.
**Unknown.** Provenance/authorship of the `/tmp/cov-r2` and `/tmp/wtprobe` registrations; whether the shokunin/tower1 trees preserve deliberate unmerged work; whether lane-level `<id>-<lane>` worktrees ever existed this run.

**Lane.** WorktreeInventory (scout). Report: `reports/worktree-keeper/WorktreeInventory.md`.
