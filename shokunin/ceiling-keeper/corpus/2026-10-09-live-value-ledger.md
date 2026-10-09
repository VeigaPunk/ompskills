# live-value-ledger — what every knob reads right now

Asked: one ledger of live values, so every other entry can cite it.
Source: `ufo-fsd-alpha@5ace2559`. The working-tree `config/ufo.json` (sha256 `0e416f0abc559e9a…`) is **uncommitted**.
HEAD blob `7efc813b…`. Bundled mirror: `crates/ufo-core-runtime/bundled/config.json`.
Observed by the L1 with `node -e` reads of all three, plus lanes `ConfigDrift`, `ContractSyncValidators`, and `RustSightingMirror`.

| knob | working tree (live) | HEAD 5ace2559 | bundled mirror | line |
| --- | --- | --- | --- | --- |
| `sighting.windowPaneCeiling` | 16 | 16 | 16 | cfg:71 |
| `sighting.layouts` 16:9 / 21:9 | 3×5 / 3×6 | same | same | cfg:60-68 |
| `sighting.heartbeatIntervalMs` | 30000 | same | same | cfg:72 |
| `sighting.twinMaxDepth` | 1 | same | same | cfg:70 |
| `sighting.dispatch.globalRunnerCeiling` | 1056 | 1056 | 1056 | cfg:78 |
| `sighting.dispatch.maxConcurrentL1` | 16 | 16 | **32** | cfg:79 |
| `missionFormat.defaultIterateRounds` | 1024 | same | same | cfg:84 |
| `missionFormat.l1Alias` (route-auditor's) | m_strong | m_strong | **m_daybreak** | cfg:85 |
| `swarm.maxLanes` | 100 | 100 | 100 | cfg:88 |
| `swarm.minLanes` | **16** | 64 | 64 | cfg:89 |
| `swarm.rampBatchSize` / `rampIntervalMs` | 5 / 700 | same | same | cfg:90-91 |
| `swarm.waveMinLanes` | **16** | 32 | 16 | cfg:93 |
| `swarm.waveMaxLanes` | **32** | 100 | 100 | cfg:94 |
| `nativeProfiles.omp-native-v1.concurrencyCeiling` | 32 | same | same | cfg:102 |
| `nativeProfiles.omp-native-v1.probe.depth` | 2 | same | same | cfg:127 |
| `nativeProfiles.omp-native-v1.l3Evidence.concurrencyCeiling` | 64 | same | same | cfg:164 |
| `nativeProfiles.devin-native-v1.concurrencyCeiling` | 16 | same | same | cfg:215 |

Outside `config/ufo.json`:

| knob | value | where |
| --- | --- | --- |
| `task.maxConcurrency` (host candidate / operator global) | 32 / 32 | `host/omp-agent.config.yml:203`; `~/.omp/agent/config.yml:24` |
| `task.maxRecursionDepth` (candidate / global) | 2 / 2 | `host/omp-agent.config.yml:206`; `~/.omp/agent/config.yml:25` |
| `task.maxConcurrency` (UFO projections) | 0 | `.omp/config.yml:3`, `.omp/ufo-l1.yml:7`, `config/mission-nightcall.yml:10` |
| `task.maxRecursionDepth` (UFO projections) | 2 | `.omp/config.yml:4`, `.omp/ufo-l1.yml:8` |
| host band delta | maxConcurrentL1 16, maxLanes 100, minLanes 16, waveMin 16, waveMax 32 | `host/ufo-sighting-dispatch.json` |

- The live readers (`loadSwarmPolicy`, `loadBandAuthority`, `ufo-sighting-lib/base.mjs`, `fleet-dispatcher.mjs`) all open the **file**, so the working tree is the effective policy. A `git checkout`/`stash` in the substrate moves the band with no code change.
- `git diff HEAD -- config/ufo.json` is exactly three lines: minLanes, waveMinLanes, waveMaxLanes.
- The bundled mirror is stale against both HEAD and the working tree. `node scripts/sync-ufo-contracts.mjs --check` exits 1 naming it (lane `ContractSyncValidators`, run read-only).

Unknown: whether the operator intends to commit the working-tree band. Treat the working tree as live and report HEAD as drift.
