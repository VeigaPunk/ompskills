# ceiling-relational-model — which limit is which, and who reads it

Asked: the relational model of the launcher's limits.
Source: `sighting/tower-fleet.mjs` @ b251c5a; `/home/vgpnk/Projects/ufo-fsd-alpha/config/ufo.json`.
Lane: `CeilingRelations`.

| config path | live | launcher | gated? | bounds |
| --- | --- | --- | --- | --- |
| `sighting.dispatch.maxConcurrentL1` | 16 | read :151; gate :337-338 `L1_CEILING_EXCEEDED` | yes | `missions.length` |
| `sighting.windowPaneCeiling` | 16 | read :152; gate :340-341 `PANE_CEILING_EXCEEDED` | yes (2nd) | panes in the fleet window |
| `sighting.dispatch.globalRunnerCeiling` | 1056 | **NOT READ** (grep: no match) | no | global runner ceiling |
| `sighting.dispatch.swarm.maxLanes` | 100 | read as `roundLaneCeiling` :155; echoed only | no | lanes per L1 round |
| `sighting.dispatch.swarm.waveMinLanes` | 16 | read :153; consistency gate :158-159 | config-consistency only | wave floor |
| `sighting.dispatch.swarm.waveMaxLanes` | 32 | read :154; consistency gate | config-consistency only | wave ceiling |
| `sighting.dispatch.swarm.minLanes` | 16 | **NOT READ** (`minLanes` grep misses `waveMinLanes`) | no | unrelated bare key |

- Order: `main()` `loadBandAuthority` (:1286) → `loadSpec` (:1287, both ceiling gates inside) →
  the verb switch (:1288-1292). `CONFIG_UNREADABLE` precedes all spec validation and all verbs;
  within `loadSpec`, the L1 gate precedes the pane gate.
- On the live config `maxConcurrentL1 == windowPaneCeiling == 16`, so `PANE_CEILING_EXCEEDED` is
  unreachable without a config where L1 > panes; the suite patches them apart.
- Name collision to keep distinct: spec **`roundCeiling`** (rounds, default 1, :388) vs config
  **`roundLaneCeiling`** (= `swarm.maxLanes`, lanes/round, :435) — separate sources.
- Contradiction: `.omp/skills/tower/SKILL.md` calls `maxConcurrentL1` the "live L1 mission ceiling"
  that "bounds registered missions"; the launcher gate counts only the one spec's `missions.length`
  — no registry/cross-fleet accounting exists launcher-side.

Evidence: lane `CeilingRelations`, corroborated by `Ceilings` and `BandAuthority`.
