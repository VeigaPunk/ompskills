# contract-sync-validators — the numeric contract gate

Asked: the numeric validators in `scripts/sync-ufo-contracts.mjs` and the state of the bundled mirror.
Lane `ContractSyncValidators` (ran `node scripts/sync-ufo-contracts.mjs --check` read-only: **exit 1**).

Gates (`:1145-1260`): `windowPaneCeiling` positive int (`:1151`); `globalRunnerCeiling` positive int (`:1192`); `maxConcurrentL1` positive int (`:1198`);
`defaultIterateRounds` 1..1024 if present (`:1212-1216`); `twinMaxDepth` must be 1 if present (`:1220`); the six swarm keys typed (`:1240`);
band inverted after clamping to `maxLanes` (`:1249-1256`, **not** also clamped to 100 the way the loader is).
Projection: `concurrencyCeiling` validated (`:1447-1449`) but not projected; emits `maxConcurrency: 0` and `maxRecursionDepth: <probe.depth>` (`:1471-1476`); `probe.depth === 2` pinned (`:1426`).
Doc gate `runner-ceiling-1024` (`:933-943`) allowlists 1024 prose. The live value is 1056 (re-read by the L1).

`--check` failures at seed time: the bundled mirror drifted, the surface digest mismatched, routesEquivalence (main alias m_strong expected, m_daybreak actual), and depsClosure.
The numeric gate itself accepts the live config.

Wrong citations in comments: `:1219` → really `base.mjs:190`; `:1195-1196` → really `base.mjs:166`, `fleet-dispatcher.mjs:3749`; `:1246-1247` → really `ufo-mission-result.mjs:2508/2515`.
`missionFormat`/`defaultIterateRounds` are optional here but required by `fleet-dispatcher.mjs` `validateMissionFormat` (`:3562-3585`).
`conformance/vectors/config/validators.json` has no sighting numeric coverage. It is consumed by Rust `tests/conformance.rs:3015-3024` (cargo not run).
