# dispatch-history — how `sighting.dispatch` reached today's values

Lane `UfoJsonBackups` (revenger).

| key | `72ab84a8` (C0) | HEAD `5ace2559` 2026-10-08T19:16Z | working tree 2026-10-09T01:30Z (uncommitted) |
| --- | --- | --- | --- |
| `maxConcurrentL1` | 32 | 16 | 16 |
| `missionFormat.l1Alias` | m_daybreak | m_strong | m_strong |
| `swarm.minLanes` | 64 | 64 | 16 |
| `swarm.waveMinLanes` | 16 | 32 | 16 |
| `swarm.waveMaxLanes` | 100 | 100 | 32 |

- Never changed: `id`, `configPath`, `defaultIterateRounds` (1024),
  `globalRunnerCeiling` (1056), `mode`, `queuePath`, `autoDispatchMissions`,
  the ramp keys, and `swarm.note`.
- Nine `config/ufo.json.<ISO-with-dashes>.bak` files (untracked, not ignored)
  come from `host/apply.mjs` `stamp()` + `backupFile()` (:141-143, :842-844,
  :936). Each is a pre-write copy. Seven are byte-identical to `5ace2559`, i.e.
  re-applies with no net change.
- Today's values equal `host/ufo-sighting-dispatch.json` (this repo).
- The bundled mirror still equals C0 (see `bundled-mirror-drift`).
