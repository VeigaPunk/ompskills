# sighting-dispatch-readers — every script that reads each sighting.dispatch key

Asked: for each key under `sighting.dispatch` in `config/ufo.json`, name every script that
reads it and cite the read site. Anchor: ufo-fsd-alpha@5ace2559 worktree (config still
` M` vs HEAD blob `7efc813b…`). All line numbers re-derived from the live worktree this pass.

## The key block (config/ufo.json:75-95, worktree values)

```
dispatch {                         :75
  mode: "task-queue"               :76
  queuePath: ".ufo/pending-work.json" :77
  globalRunnerCeiling: 1056        :78
  maxConcurrentL1: 16              :79
  autoDispatchMissions: true       :80
  missionFormat {                  :81
    id: "nightcall"                :82
    configPath: "config/mission-nightcall.yml" :83
    defaultIterateRounds: 1024     :84
    l1Alias: "m_strong"            :85
  }
  swarm {                          :87
    maxLanes: 100  minLanes: 16    :88,89
    rampBatchSize: 5  rampIntervalMs: 700  :90,91
    note: "<prose>"                :92
    waveMinLanes: 16  waveMaxLanes: 32     :93,94
  }
}
```

## Readers per key (production scripts, exact read sites)

| key | reader | read site |
| --- | --- | --- |
| `mode` | fleet-dispatcher.mjs `loadDispatchPolicy` | `:3726` (`dispatch.mode !== "task-queue"` → usageError); cached via `dispatchPolicy()` `:3774+` |
| | sync-ufo-contracts.mjs `assertSightingContract` | `:1165-1166` |
| `queuePath` | fleet-dispatcher.mjs `loadDispatchPolicy` | `:3727-3730` (resolve + `.ufo` containment); policy field `:3758`; consumed by `queueFile()` `:3841-3843` — **env `UFO_PENDING_WORK_PATH` wins over the config key**; env containment re-check `:4465` |
| | sync-ufo-contracts.mjs `assertSightingContract` | `:1170-1186` (safeText bound mirror `:1170-1173`, containment `:1176-1180`, symlink safe-tree `:1185-1186`) |
| `globalRunnerCeiling` | fleet-dispatcher.mjs `loadDispatchPolicy` | `:3731-3734` (`const ceiling = dispatch.globalRunnerCeiling`), returned `:3759` |
| | ufo-sighting-lib/base.mjs `loadSightingConfig` | `:155-157` (required, throws), carried `:204` → consumed as `SIGHTING_CONFIG.globalRunnerCeiling` in ufo-sighting.mjs `:1632,2103,2125,2354,2626,2651-2652,3703,3995` (status line, reservation parse, assertRunnerCapacity, launch, runner accounting, resume) |
| | ufo-mission-result.mjs `loadSwarmPolicy` | `:2521-2526` (optional, null default), returned in policy `:2529` |
| | ufo-swarm-wave.mjs `planSwarmWave` | policy intake only: injected-policy validation `:809-811`, plan policy block `:1248`; config bytes arrive via hub `loadSwarmPolicy` `:381-384`, `:773` |
| | ufo-sighting-lib/surface.mjs caps report | `:247` |
| | sync-ufo-contracts.mjs shape gate | `:1188-1190` |
| `maxConcurrentL1` | fleet-dispatcher.mjs `loadDispatchPolicy` | `:3749-3752` (S-10: required, never defaulted), returned `:3760`; consumed by `l1Ceiling()` `:4400-4401` |
| | ufo-sighting-lib/base.mjs `loadSightingConfig` | `:166-168` (required, throws), carried `:201` |
| | ufo-sighting.mjs `l1MissionCapacity` | `:2144-2152` (ceiling + provenance key) |
| | ufo-sighting-lib/surface.mjs caps report | `:248` |
| | sync-ufo-contracts.mjs shape gate | `:1198-1200` |
| `autoDispatchMissions` | fleet-dispatcher.mjs `loadDispatchPolicy` | `:3735-3737` (boolean required), returned `:3764`; consumed `:9654` (once), `:9682` (status), `:9697` (daemon loop `runCycle({allowDispatch})`) |
| | sync-ufo-contracts.mjs shape gate | `:1223-1224` |
| `missionFormat` (block) | fleet-dispatcher.mjs `validateMissionFormat` | `:3562-3585`, entry `:3753` |
| | sync-ufo-contracts.mjs shape gate | `:1204-1208` (object check) |
| `missionFormat.id` | fleet-dispatcher.mjs `validateMissionFormat` | `:3566-3567` (must be `"nightcall"`) |
| | sync-ufo-contracts.mjs | `:1209-1210` |
| `missionFormat.configPath` | fleet-dispatcher.mjs | `:3569` (`queueArtifactPath` validation), `:5761-5767` (default for new fleet specs; explicit spec path must equal it) |
| | check-hand-authored-sets.mjs `enumerateSets` | `:88-91` — `config?.sighting?.dispatch?.missionFormat?.configPath` declares the `config/mission-*.yml` set |
| `missionFormat.defaultIterateRounds` | fleet-dispatcher.mjs | `:3570-3573` (1..1024 gate), `:5833-5834` (enqueue default when spec omits `iterate`) |
| | sync-ufo-contracts.mjs | `:1212-1216` |
| `missionFormat.l1Alias` | fleet-dispatcher.mjs | `:3575-3577` (shape gate), `:3754` (`resolveFleetAliasRouting`), `:5725` (enqueue default alias) |
| | run-omp-native-trial.mjs | `:702-707` (fail-closed required), `:716` (`resolveAliasRouting(globalText, l1Alias)`), `:800` (frozen policy) |
| | sync-global-routing.mjs `configuredL1Alias` | `:228-232`; mirror build `:239-252` (main seat resolves it) |
| | sync-ufo-contracts.mjs `renderOmpProjection` gate | `:1467-1469` |
| | crates/ufo-core-runtime/build.rs | `:549-563` (sighting→dispatch→missionFormat→l1Alias at `:557-560`), equality vs seat mirror `:578-580` |
| | crates/ufo-core-runtime/src/lib.rs | `:1018-1026` (JSON pointer `/sighting/dispatch/missionFormat/l1Alias` at `:1019`) |
| `swarm` (block) | ufo-mission-result.mjs `loadSwarmPolicy` | `:2457-2462` (object-or-absent; absent → built-in defaults, `source` provenance `:2423-2429`) |
| | ufo-swarm-wave.mjs | config read path `:381-384` (hub wrapper), `:773` (`options.policy ?? loadSwarmPolicy()`) |
| | sync-ufo-contracts.mjs | `:1231-1234` (object check) |
| `swarm.maxLanes` | ufo-mission-result.mjs `loadSwarmPolicy` | `:2464-2469` (clamp to hard `MAX_SWARM_LANES`) |
| | ufo-swarm-wave.mjs `planSwarmWave` | validation `:781-784`, effective cap `:794-795`, plan policy block `:1240` |
| | sync-ufo-contracts.mjs | six-key loop `:1240-1244`, clamp mirror `:1250` |
| | ufo-sighting-lib/surface.mjs caps report | `:249` |
| `swarm.minLanes` | ufo-mission-result.mjs | `:2491-2496` |
| | ufo-swarm-wave.mjs | `:781`, floor fallback `:799`, plan block `:1241` |
| | ufo-stale-watchdog.mjs `swarmDoctrine` | `:799-805` (`roundTarget: policy.minLanes` at `:803`) |
| | sync-ufo-contracts.mjs | `:1240` |
| `swarm.rampBatchSize` | ufo-mission-result.mjs | `:2472-2477` |
| | ufo-swarm-wave.mjs | `:781`, plan block `:1246` |
| | sync-ufo-contracts.mjs | `:1240` |
| `swarm.rampIntervalMs` | ufo-mission-result.mjs | `:2480-2485` |
| | ufo-swarm-wave.mjs | `:781`, plan block `:1247` |
| | sync-ufo-contracts.mjs | `:1240` |
| `swarm.waveMinLanes` / `waveMaxLanes` | ufo-mission-result.mjs | `:2503-2519` (band clamp + inversion refusal) |
| | ufo-swarm-wave.mjs | `:781`, floor/ceiling `:796-807` (`too_few_lanes`/`wave_too_wide` machinery), plan block `:1242-1243` |
| | ufo-stale-watchdog.mjs `swarmDoctrine` | `:799-805` (`waveMin`/`waveMax` at `:801-802`) |
| | sync-ufo-contracts.mjs | `:1240`, inverted-after-clamp mirror `:1249-1255` |
| `swarm.note` | **no code reader** | never branched on; not in the sync shape loop (`:1240` covers only the six integer keys — contrast `drills.note` string check `:1387-1389`); ufo-swarm-wave.mjs `:1337-1340` keeps plan `note` prose intentionally unpinned. Guidance mirrors quote it (packages/cursor/.cursor/skills/ufo/references/CHANGELOG.md:115) — annotation only |

## Read-path topology

- **Two live consumers own the block**: `fleet-dispatcher.mjs:loadDispatchPolicy` (`:3725-3766`)
  owns `mode/queuePath/globalRunnerCeiling/maxConcurrentL1/autoDispatchMissions/missionFormat`;
  `ufo-mission-result.mjs:loadSwarmPolicy` (`:2431-2529`) owns `swarm.*` +
  optional `globalRunnerCeiling`, consumed downstream by `ufo-swarm-wave.mjs` (`:773`),
  `ufo-stale-watchdog.mjs` (`:799`), and the dispatcher's wave machinery.
- **Wall layer**: `ufo-sighting-lib/base.mjs:loadSightingConfig` (`:155-205`) requires
  `globalRunnerCeiling` + `maxConcurrentL1` at config load; `ufo-sighting.mjs` only ever
  touches them through `SIGHTING_CONFIG`.
- **Gate layer**: `sync-ufo-contracts.mjs:assertSightingContract` (`:1163-1256`) mirrors every
  consumer-facing shape so malformed bytes fail at `contracts:check`; it reads the keys to
  validate, never to act.
- **Crate layer**: the Rust runtime never reads `../../config/ufo.json` (build.rs:21-22); it
  reads `crates/ufo-core-runtime/bundled/config.json` (the byte mirror) and pins
  `missionFormat.l1Alias` at build (`build.rs:549-582`) and render (`src/lib.rs:1018-1026`).
  The bundled mirror still carries HEAD-era bytes (`maxConcurrentL1 32`, `minLanes 64`,
  `waveMaxLanes 100`, bundled/config.json:79,88-94) while the worktree says 16/16/32 — the
  crate therefore currently sees the old band until the next sync.
- **Byte-digest bindings** (all keys at once, not per-key): judge contract hash
  `native_contract.rs:33,67,428-431`; drills suite `ufo-drills.mjs:432`; launch metadata
  `collect-omp-native-handoff.mjs:351-352`.

## Boundary notes (near-misses that are NOT config-key readers)

- Queue path: `ufo-l0-monitor.mjs:41-45`, `ufo-watchdog-repend.mjs:325-340`, and hub
  `resolveQueuePath` (`ufo-mission-result.mjs:2615-2621`) resolve the queue via env
  `UFO_PENDING_WORK_PATH` or the hardcoded default `.ufo/pending-work.json` — never via the
  config `queuePath` key. `ufo-sighting.mjs:1536-1538` hardcodes the sibling
  `pending-work.json` for scope binding. `.omp/hooks/pre/primeagent-assimilation.js:447` reads
  the env seam only.
- `check-routing-free-config.mjs` and `render-seat-tables.mjs`: zero `sighting.dispatch`
  reads (grep, no matches).
- Test scripts read/mutate the keys for fixtures — e.g. tests/fleet-dispatcher.test.js
  (`:1844-1846,3552-3553,4963-4965,4990-4992,5028-5030`), tests/helpers/ufo-sighting-fixture.mjs
  (`:62-67`), tests/orchestrator.test.js:667-668, tests/run-omp-native-trial.test.js:530-531,
  tests/sync-ufo-contracts.test.js:876-951, scripts/fleet-dispatcher.test.mjs:167-179,
  scripts/fleet-selfheal-verify.mjs:427-438 — listed as a class, not per-key production readers.

## Changed

Nothing in the substrate (read-only). This corpus grew by this entry; index row appended.

## Unknowns

- Live daemon state: any running dispatcher/sighting process loaded its policy at boot and
  caches it (`dispatchCache`, fleet-dispatcher.mjs:3774) — which band a live process actually
  holds is unobservable from the tree.
- `swarm.note`: no in-tree reader found by direct grep of all policy consumers; any
  out-of-tree consumer is not observable here. Recorded as annotation, matching the
  `*.note`-is-prose rule (config-ufo-json entry), with the caveat that this note is not even
  shape-checked.
- Docs quoting the block (BEHAVIOR-MATRIX.md:24-32, L2-L3-ROUTING.md:59-68) carry stale
  values (32/64-100/m_daybreak) vs the worktree (16/16-32/m_strong) — snapshots, not readers.
