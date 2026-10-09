# minlanes-semantics — what swarm.minLanes actually does

Asked: is `sighting.dispatch.swarm.minLanes` a gate, a fallback, or dead policy?
Lane `MinLanesSemantics` (critic, probes A–H). Fallback verified by the L1 (see band-ladder-probes).

- It is a **fallback floor**. The chain is `waveMinLanes` → `minLanes` → `MIN_SWARM_LANES` 2:
  `ufo-swarm-wave.mjs:796-800` for the planner, `ufo-mission-result.mjs:2503` (`let waveMinLanes = minLanes;`) for the loader.
- On the live config `waveMinLanes` is present, so `minLanes` gates nothing today. Probe F: `{minLanes:32, waveMinLanes:16}` admits 16.
- Other readers: `ufo-stale-watchdog.mjs:803` uses it as `roundTarget`, which only feeds advisory steer text;
  `sync-ufo-contracts.mjs:1240` checks its type; `ufo-swarm-wave.mjs:781` validates injected policy; the plan echoes it raw (`:1241`).
- Not read by `sighting/tower-fleet.mjs` (which reads only waveMin/waveMax at `:153-154`) or by any Rust code.
- `host/apply.mjs` writes `minLanes` with **no** positivity gate (lane `ApplyNumericGates` D1). It moved 64 → 16 in the working tree.

Skill drift: `.omp/skills/swarm/SKILL.md` says `swarm.minLanes` 16 is "policy, not a planner gate … in a band-less policy the built-in minimum is 2".
In a band-less policy that declares `minLanes`, `minLanes` **is** the planner floor; 2 applies only when both keys are absent.
Suggested wording: "the declared swarm-round floor and the fallback wave floor".
