# 2026-10-09 — skill prose vs the wall (tower/swarm cross-check)

**Asked:** cross-check the wall section of `.omp/skills/tower/SKILL.md` against the real CLI and launcher,
and the same wall prose in `.omp/skills/swarm/SKILL.md`.

**Sources (exact; `W` = the wall-watcher worktree, `ufo` = `/home/vgpnk/Projects/ufo-fsd-alpha`)**

- `W/.omp/skills/tower/SKILL.md` (Mission visibility and authority; Sighting fleet sections).
- `W/.omp/skills/swarm/SKILL.md` (wall prose, ~159-205).
- `ufo/scripts/ufo-sighting.mjs` + `ufo/scripts/ufo-sighting` + `ufo/scripts/ufo-sighting-lib/{base,argv,surface}.mjs`.
- `ufo/config/ufo.json`; `W/sighting/tower-fleet.mjs`.
- Probes: `launch --help`, `steer --help` (exit 0); `tmux list-windows -t ufo_sighting`.
- Full evidence: the lane report `reports/wall-watcher/TowerSkillWall.md`.

**Observed — claims confirmed**

- Session `ufo_sighting` and window 1 — confirmed (`base.mjs:23-27`; live `1|fleet`).
- `open` opens/focuses — confirmed (`ufo-sighting.mjs:2799-2807`, `2731-2740`, shim `26-35`).
- `status`/`overview [--watch]` inspect — confirmed but the skill omits `--width`.
- `peek --mission <id> [--lines N]` — confirmed; non-live → `MISSION_NOT_LIVE`; defaults 80/400.
- `steer --mission <id> (--text | --text-file)` to a live mission — confirmed (XOR, one-line rule).
- "The wall never orchestrates" — confirmed (no dispatch loop; `autoRegisterInvokedNativeTrial` is consumed
  by `run-omp-native-trial.mjs`, not the wall) with one gloss: the wall **does** hold registration
  admission authority (`L1_CEILING_EXCEEDED`/`CAP_EXCEEDED`/`RUNNER_CEILING_EXCEEDED`).
- `--fleet NAME` → separate titled window, one pane per live mission; where a spec exceeding ceilings is
  refused up front — confirmed against `tower-fleet.mjs:337-342`.
- The swarm skill's "three limits, none interchangeable" paragraph is the **accurate** one (per the
  ceilings entry, with the corrections that `windowPaneCeiling` is boot-read and that `layouts` is also an
  enforced cap); the tower fleet prose should be reconciled toward it.

**Observed — claims refuted (blockers)**

1. "Only `launch` creates a pane" — refuted: `inquiry` calls `launchMission`, `twin` calls
   `createMissionPane`, `resume` re-spawns, and the hidden native route launches — none is `launch`.
2. "A failed worktree add aborts the run outright (`WORKTREE_ADD_FAILED`)" — refuted: the failure is
   **recorded** and the loop continues; `fleet.json` is written and the run ends `LAUNCH_PARTIAL`.
3. "A failing wall `complete` aborts first (`COMPLETE_FAILED`, exit 2)" — refuted: `close` attempts every
   target and exits 2 only at the end; the run-aborting gate the prose omits is `PANE_LIVE`.
4. `maxConcurrentL1` "bounds registered missions" — imprecise: the wall bounds **live-status** missions
   (across every fleet + the default wall); retired/completed history consumes zero.

**Observed — smaller prose gaps**

- `windowPaneCeiling` called "display capacity" (it is enforcement, and boot-read on every invocation);
  "the default wall never reads it" (false).
- `--width` missing from the `overview` description.
- `overview`'s pane-marker semantics and `@ufo_title` volatility are unmentioned.

**Changed:** nothing (the skill files are outside this mission's scope — see the round receipt).

**Unknown:** whether the skill files are regenerated from a source or hand-maintained (the fleet spec
copies skills into each worktree, so a prose fix belongs to whoever owns `.omp/skills`).