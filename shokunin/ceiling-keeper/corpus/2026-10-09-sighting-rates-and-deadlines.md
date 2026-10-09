# sighting-rates-and-deadlines — the non-capacity numbers

Asked: the other numeric knobs (rates, depths, rounds, deadlines).
Lane `SightingRates`. None of these differ between the working tree and HEAD.

| knob | live | bounds | enforced at |
| --- | --- | --- | --- |
| `sighting.heartbeatIntervalMs` | 30000 (cfg:72) | int 1000..300000 inclusive; absent → 30000 | `run-omp-native-trial.mjs:2256-2260` die, exit 2; `the-tick-config.mjs:288-289` requires `staleAfterMs` (90000) `>` heartbeat (advisory) |
| `sighting.twinMaxDepth` | 1 (cfg:70) | must be 1 if present | `base.mjs:190-191` boot throw; `sync-ufo-contracts.mjs:1220`. Projected and **never consumed** |
| effective twin depth | origin must be 0 | hardcoded | `ufo-sighting.mjs:3973` `TWIN_RECURSION`, `:3981` `TWIN_EXISTS` |
| `missionFormat.defaultIterateRounds` | 1024 (cfg:84), at its cap | 1..1024 inclusive | `fleet-dispatcher.mjs:3570-3573`; `sync-ufo-contracts.mjs:1212-1216` |
| `deadlines.orchestratorMs/plannerMs/thinkingMs/distillerMs/mechanicalMs/labratMs` | 7200000/3600000/3600000/2400000/1800000/1200000 (cfg:141-146) | positive safe int | Rust `native_profile.rs:210-217`; judge strict `elapsed > deadline` (`native_telemetry.rs:746-747`) → lane_timeout telemetry, never a capacity event |
| `OMP_RUN_TIMEOUT_MS` | 7500000 (2h05m) | const, no env override | `run-omp-native-trial.mjs:120`; `spawnSync` timeout `:4028,:4035` |

Operators differ: heartbeat and iterate bounds are inclusive; deadlines are strict `>`.
`config/ufo.json:140` cites `OMP_RUN_TIMEOUT_MS` at `:85-91`, but it is at `:120`. The watchdog's `STALE_MS` 1,200,000 is not coupled to the heartbeat (see watchdog-and-host-64s).
