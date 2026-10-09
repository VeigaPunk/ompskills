# host/ufo-sighting-dispatch.json (the delta)

**Asked.** The delta's exact keys, how each maps into `sighting.dispatch`, and
whether it matches the live band.

**Observed.** `host/ufo-sighting-dispatch.json` (12 lines, sha256
`3c0c4d67…5343b3`). Top-level `maxConcurrentL1`, `missionFormat` (only
`l1Alias` — a partial overlay, not a replacement), `swarm`.

| delta leaf | config/ufo.json | value |
| ---------- | --------------- | ----- |
| `maxConcurrentL1` | :79 | 16 |
| `missionFormat.l1Alias` | :85 | `"m_strong"` |
| `swarm.maxLanes` | :88 | 100 |
| `swarm.minLanes` | :89 | 16 |
| `swarm.waveMinLanes` | :93 | 16 |
| `swarm.waveMaxLanes` | :94 | 32 |

**Mapping.** Identity: the delta key path equals the `sighting.dispatch` key path
(`apply.mjs:60` DELTA_PATH, `:351-397` dispatchGate reads
`current?.sighting?.dispatch` at `:370`, `:287-320` walk, `:994` call site). Each
leaf key must occur exactly once file-wide (`:303-306`) — all six do.

**Delta-side validation.** `positiveInt` on maxConcurrentL1/waveMinLanes/
waveMaxLanes/maxLanes (L377–381), non-inverted band (L382–385), cap ≤100
(L386–388), bare non-empty l1Alias (L392–396). **`swarm.minLanes` is merged but
NOT bounds-checked here** — its bound is runtime-only
(`ufo-mission-result.mjs:2492-2496`); see the dispatch-delta-bounds entry.

**Live band confirmation.** All six values in `config/ufo.json` match the delta
today, so every edit reports `unchanged`; the merge is a no-op byte-identical
rewrite. The planner (gate 6) confirms the live band is 16–32.

**Consumers.** `maxConcurrentL1`: `ufo-sighting-lib/base.mjs:166-168,201`,
`ufo-sighting.mjs:2145,2152`, `fleet-dispatcher.mjs:3749-3751`. `l1Alias`:
`build.rs:550-579` and `apply.mjs:974-978`. `swarm`: `ufo-mission-result.mjs:
2470-2530` (`loadSwarmPolicy`), `ufo-swarm-wave.mjs:781-807,1240-1243`.

**Added.** 2026-10-09 · lane `DispatchDeltaFile` (scout)