# three-thirty-twos — the host comment, claim by claim

Asked: audit `host/omp-agent.config.yml:187-206` against the live sources.
Lane `ThreeThirtyTwos` (critic), corroborated by `FleetLauncherCeilings` D3, `NativeConcurrencyCeiling`, `CeilingRelations` §C-1/2, and `ApplyNumericGates` D3. The comment was read by the L1.

The 32s that coincide **now**: `task.maxConcurrency` 32 (`:203`), `waveMaxLanes` 32 (cfg:94), and `omp-native-v1.concurrencyCeiling` 32 (cfg:102).

| claim | verdict | evidence |
| --- | --- | --- |
| omp's own default is 32 | true | `omp://tools/task.md:158` |
| ufo pins 0 in its per-run overlays | true | `.omp/config.yml:3`, `ufo-l1.yml:7`, `mission-nightcall.yml:10`; `run-omp-native-trial.mjs:509-514` |
| "32-100 per wave" | **stale** | live band 16–32. 32–100 is HEAD and was retargeted by ompskills `4bb0b23` |
| "100 members per L1" | true as a number, **imprecise as a unit** | `too_many_lanes` is per wave (`ufo-swarm-wave.mjs:995`) |
| the third 32 is "waveMinLanes (… raised from 16 to 32)" | **stale / wrong key** | live waveMinLanes 16. The 32 is waveMaxLanes, and the co-shipped delta `host/ufo-sighting-dispatch.json` sets 16/32 |
| concurrencyCeiling is a per-L1 judged-round bound, not an L1 count | true | `native_schema.rs:67-76` |
| "validated only as a positive integer" | true for config validation | `lib.rs:991-999`, `sync-ufo-contracts.mjs:1447-1449` |
| "nothing cross-checks it against the other two" | true against those two; **incomplete** overall | the launcher compares it for equality with Rust `NATIVE_CONCURRENCY_MAX` (`run-omp-native-trial.mjs:3434-3438`) |
| maxConcurrentL1 is the L1 count, moved to 16 independently | true | cfg:79 |

Risk: `host/apply.mjs` installs this candidate into `~/.omp/agent/config.yml`. The installed global (7443 B) does not carry the comment today, but the next apply would install the stale prose.
Correction, for the owner of `host/` (not this card's scope): swap `waveMinLanes` for `waveMaxLanes`, and say "16-32 per wave".
