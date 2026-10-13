# `sighting.dispatch` — full key map and consumers

**Asked.** The corpus covered only the six delta keys' bounds; enumerate every
`sighting.dispatch` key, its value, and at least one substrate consumer.

**Observed.** Live `/home/vgpnk/Projects/ufo-fsd-alpha/config/ufo.json`
`sighting.dispatch` has **16 leaves**; the delta writes **6** of them.

| key | line | value | delta | consumer (path:line) |
| --- | ---- | ----- | :---: | -------------------- |
| `mode` | 76 | `"task-queue"` | – | `fleet-dispatcher.mjs:3726` |
| `queuePath` | 77 | `".ufo/pending-work.json"` | – | `fleet-dispatcher.mjs:3727,3842` |
| `globalRunnerCeiling` | 78 | `1056` | – | `fleet-dispatcher.mjs:3731,3759,4393` |
| `maxConcurrentL1` | 79 | `16` | ✓ | `fleet-dispatcher.mjs:3749-3751`; `ufo-sighting-lib/base.mjs:166-168,201`; `ufo-sighting.mjs:2145` |
| `autoDispatchMissions` | 80 | `true` | – | `fleet-dispatcher.mjs:3735-3736` |
| `missionFormat.id` | 82 | `"nightcall"` | – | `fleet-dispatcher.mjs:3567` |
| `missionFormat.configPath` | 83 | `"config/mission-nightcall.yml"` | – | `fleet-dispatcher.mjs:3569,5762` |
| `missionFormat.defaultIterateRounds` | 84 | `1024` | – | `fleet-dispatcher.mjs:3570-3573` |
| `missionFormat.l1Alias` | 85 | `"m_strong"` | ✓ | `fleet-dispatcher.mjs:3575-3577`; `build.rs:558-566,577-579` |
| `swarm.maxLanes` | 88 | `100` | ✓ | `ufo-mission-result.mjs:2465-2469`; `ufo-swarm-wave.mjs:781` |
| `swarm.minLanes` | 89 | `16` | ✓ | `ufo-mission-result.mjs:2492-2496`; `ufo-swarm-wave.mjs:781` |
| `swarm.rampBatchSize` | 90 | `5` | – | `ufo-mission-result.mjs:2472-2477` |
| `swarm.rampIntervalMs` | 91 | `700` | – | `ufo-mission-result.mjs:2480-2485` |
| `swarm.note` | 92 | long prose | – | **NONE** (no code consumer; only `apply.mjs planNoteRewrite:336-349` could rewrite it) |
| `swarm.waveMinLanes` | 93 | `16` | ✓ | `ufo-mission-result.mjs:2504-2508`; `ufo-swarm-wave.mjs:797,807`; `ufo-stale-watchdog.mjs:801` |
| `swarm.waveMaxLanes` | 94 | `32` | ✓ | `ufo-mission-result.mjs:2511-2515`; `ufo-swarm-wave.mjs:802`; `ufo-stale-watchdog.mjs:802` |

**Delta leaves every non-delta key untouched.** The delta file carries only 6
leaves; `planDispatchEdits` walks only the delta (`apply.mjs:287-320`, call
`:318`); `mergeDispatch` asserts nothing outside the expected changed; the dry run
prints only the six delta-key changes, all `=` unchanged. Also
`fleet-dispatcher.mjs:3753` calls `validateMissionFormat(dispatch.missionFormat)`.

**Added.** 2026-10-09 · lane `CoverDispatchConsumers` (scout, round 2)