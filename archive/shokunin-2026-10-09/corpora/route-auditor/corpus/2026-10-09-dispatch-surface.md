# The dispatch surface — `config/ufo.json` `sighting.dispatch`

**Asked.** What does the ufo dispatch surface carry, and is it routing-free?

**Observed.** `/home/vgpnk/Projects/ufo-fsd-alpha/config/ufo.json`
`sighting.dispatch`:

- `mode` "task-queue"; `globalRunnerCeiling` 1056; `maxConcurrentL1` 16 (:79);
  `autoDispatchMissions` true.
- `missionFormat` (:81-86): `{ id: "nightcall", configPath: "config/mission-nightcall.yml",
  defaultIterateRounds: 1024, l1Alias: "m_strong" }`.
- `swarm` (:88-94): `maxLanes` 100, `minLanes` 16, `rampBatchSize` 5,
  `rampIntervalMs` 700, `waveMinLanes` 16, `waveMaxLanes` 32, plus a `note`.
- The `note` (:92) carries the no-per-lane-model-param clause and the
  `m_*`-alias / generated-mirror statement.
- `orchestrator.route` and `substrates[].route` read `local/fixture-primary`
  (fixture transport, not model routing).

**Routing-free: confirmed.** No `modelRoles` / `agentModelOverrides` /
`fallbackChains` / `modelRoutes` / `modelFallbacks` key anywhere (grep + the
gate both clean). The in-file contract at `config/ufo.json:246` states "every
seat route, fallback, and model catalog is owned by the global OMP config".
`l1Alias` is a **name reference** into the global table, not a table.

**The apply-time delta.** `host/ufo-sighting-dispatch.json` is a committed
deep-merge **delta fragment** carrying only the changed keys (`maxConcurrentL1`
16, `missionFormat.l1Alias` "m_strong", `swarm.maxLanes` 100 / `minLanes` 16 /
`waveMinLanes` 16 / `waveMaxLanes` 32) — all six **match** the live config. It
is applied by `host/apply.mjs` (:60,351-397,892-937) and read by
`ompskills test/run-wave-test.mjs` as the `--band` fixture; it is **not** a
permanent snapshot, and no `ufo-fsd-alpha` script reads it.

**Changed.** None.

**Unknown.** Whether `l1Alias === seats.main.alias` equality is re-checked
anywhere but `host/apply.mjs` (apply enforces it; compile gate replicates it).

Evidence: lanes DispatchConfigReviewer12, DeltaScout11; L1 routing-free run.