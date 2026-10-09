# apply-numeric-gates — what apply writes and checks

Asked: the numeric gates in `host/apply.mjs` and what it writes into `config/ufo.json`.
Lane `ApplyNumericGates` (ran `node host/apply.mjs` as a dry run: exit 0, "DRY RUN PASSED", nothing written).

Writes (`sighting.dispatch` from `host/ufo-sighting-dispatch.json`): `maxConcurrentL1`, `missionFormat.l1Alias`, and `swarm.{maxLanes,minLanes,waveMinLanes,waveMaxLanes}`.
It never writes `globalRunnerCeiling`, `windowPaneCeiling`, ramp keys, or `task.*` in config/ufo.json; the global config is its second file.

Gates:
- `positiveInt` on maxConcurrentL1, waveMinLanes, waveMaxLanes, maxLanes (`:377-381`). **Not** on `minLanes`, which is written ungated.
- `waveMaxLanes < waveMinLanes` → fail (`:382-385`). `waveMaxLanes > 100 || maxLanes > 100` → fail (`:386-387`), using apply's **own** `MAX_SWARM_LANES` literal (`:65`), which is not imported from the hub.
- No `waveMaxLanes <= maxLanes` cross-check (the loader clamps silently).
- Post-apply band probes (`:630-690`): an in-memory `planSwarmWave` at the floor, the ceiling, and ceiling+1 (`wave_too_wide`).
- Observed-floor check (`:1026-1035`): compares only `waveMinLanes`. A mismatch is a `note`, and the verdict still prints APPLIED.

Mirror named at `:93`: `crates/ufo-core-runtime/bundled/config.json` "mirrors sighting.dispatch.maxConcurrentL1". The mirror is stale (32, m_daybreak, minLanes 64, waveMax 100) and has been since HEAD.
`DEFERRED_ARTIFACTS` (`:91-96`) omits stale prose sites: `skills/ufo/SKILL.md:348,385-386`, `run-logic.md`, the swarm skill copy, and `AGENTS.md:151-152`.
`:72-73` still calls 32–100 the pre-apply band. Cite host-smith for the dry-run machinery itself.
