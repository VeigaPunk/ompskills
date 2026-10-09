# adversarial falsification: six skill claims that fail against the code

**Asked:** try to falsify the load-bearing claims of `.omp/skills/tower/SKILL.md` and
`.omp/skills/swarm/SKILL.md`.
**Method:** verbatim claim -> contradicting source line -> corrected fact.

## Falsified

- **F1 WRONG** — tower/SKILL.md:152-153 "a failed worktree add aborts the run outright
  (`WORKTREE_ADD_FAILED`)". Contradicted by `sighting/tower-fleet.mjs:795-796` ("A failed add is
  this mission's failure, not a mid-fleet abort"), `:815` `recordMissionFailure(...)`, `:816`
  `continue`, run ends `typed("LAUNCH_PARTIAL", …)` `:946`. Corrected: recorded per mission, the
  remaining missions still launch, the run finishes `LAUNCH_PARTIAL` exit 2.
- **F2 UNSUPPORTED** — tower/SKILL.md:154 "reused with a warning". `tower-fleet.mjs:798-799` sets
  `record.worktreeReused = true` with no `warn()`; the full warn inventory (590,776,778,790,803,825,
  890,899,983,1173,1187,1193,1202) has no reuse entry; `:803` warns on the *opposite* case.
  Corrected: reuse is silent; visible only as `worktreeReused` in `fleet.json`.
- **F3 WRONG** — tower/SKILL.md:75 "Only `launch` creates a pane". `scripts/ufo-sighting.mjs:3743`
  (`resumeMissionLocked` -> `spawnPaneForMission`), `:4019` (`twinMission`) → `:2331`; and
  `tower-fleet.mjs:786-788` prints `resume` as the remedy for a suspended run id. Corrected: pane
  minting verbs are `launch`/`resume`/`twin`; `launch` alone creates a *new registered mission*.
- **F4 UNSUPPORTED as stated** — swarm/SKILL.md:69-71 "in a band-less policy the built-in minimum
  is 2". `ufo-mission-result.mjs:2507-2508` `let waveMinLanes = minLanes;`; `minLanes` defaults to
  `MIN_SWARM_LANES = 2` only when config omits it (`:2491`, `:2416`). Counterexample: drop only
  `waveMinLanes` (keep `minLanes: 16`) -> the floor is 16. Corrected chain:
  `waveMinLanes` -> `minLanes` -> 2; and `minLanes` is not inert (`ufo-stale-watchdog.mjs:803`
  reads it as `roundTarget`).
- **F5 OVER-STATED** — swarm/SKILL.md:198-200 "the default wall never reads it"
  (`windowPaneCeiling`). `ufo-sighting-lib/base.mjs:159-164` reads it at boot and throws
  "config/ufo.json is missing sighting.windowPaneCeiling" when absent; `ufo-sighting.mjs:2141`
  `return fleet ? SIGHTING_CONFIG.windowPaneCeiling : geometry.cap;`, `:3076` fleet capacity.
  Corrected: the wall reads+validates it at boot and sizes fleet windows; only the *default*
  (non-fleet) window's capacity is display geometry.
- **F6 IMPRECISE** — tower/SKILL.md:171-172 "a failing wall `complete` aborts first".
  `tower-fleet.mjs:1198-1206` records per mission and continues, `:1212-1221` still prints every
  outcome and every `git -C <repo> worktree remove <path>` line, then `typed("COMPLETE_FAILED", …)`
  at `:1227` ("report every outcome instead of aborting"). Corrected: `close --apply` is
  partial-state like `launch`; only the exit code matches.

## Survived scrutiny (selected)

- `MUTATION_REQUIRES_APPLY` precedes any spec read/wall call (:1266-1268; test :1134-1143);
  L1-then-PANE ceiling order incl. `plan` (:341-347); spec defaults and the skills search order
  repo -> ufoRoot -> `~/.agents/skills` (:384-390, :684-703); band authority read live with the
  exact key set, never `globalRunnerCeiling`/`minLanes` (:130-165); band 16-32, `maxLanes` 100,
  spec cap tightens only; resume-only waves exempt from both wave gates; all swarm refusal codes
  named by the skill exist; ten roles, `{name,agent,task}`, no per-lane model key, resume rows
  `agentId: null`.
- `omp worktree` surface matches `omp worktree --help` verbatim: `add -C <repo> -b <branch> PATH
  [COMMIT]`, `list --json`, `clear --dry-run`, `clear --all`; `clear` takes no PATH, so "repo-wide
  orphan sweep, not a per-path delete" holds.

## Remaining unknown

`spawns: []` collapsing to a wildcard is OMP-harness behavior with no local code or doc asserting
it — [INFERENCE]; and the bare `scripts/ufo-swarm-wave.mjs` path in swarm/SKILL.md:35,131 resolves
only when cwd is the UFO substrate (consistency risk, not proven wrong).
