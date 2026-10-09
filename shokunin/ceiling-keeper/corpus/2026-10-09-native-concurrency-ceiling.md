# native-concurrency-ceiling — the judged-round bounds

Asked: what `nativeProfiles.*.concurrencyCeiling` bounds, and what checks it.
Lanes `NativeConcurrencyCeiling` and `RustSightingMirror`.

| knob | value | declared | enforced |
| --- | --- | --- | --- |
| `omp-native-v1.concurrencyCeiling` | 32 | cfg:102 | `run-omp-native-trial.mjs:3434-3438` **equality** with `ufo status` `concurrencyCeiling`, which is the Rust `NATIVE_CONCURRENCY_MAX` |
| `NATIVE_CONCURRENCY_MAX` | 32 | `native_schema.rs:76` | `native_header.rs:254-258` (declared concurrency in 1..=32), `:268`, `:297` |
| collector `CONCURRENCY_CEILING` | 32 | `collect-omp-native-handoff-lib/base.mjs:94` | `collect-omp-native-handoff.mjs:484-499` (literal, not config) |
| `PROPOSAL_WAVE_CEILING` | 16 | `run-omp-native-trial.mjs:109`; `native_schema.rs:66` | `run-omp-native-trial.mjs:916-917`; collector `:495-496` |
| `devin-native-v1.concurrencyCeiling` | 16 | cfg:215 | **no reader** (not in `ADMITTED_PROFILES`, `run-omp-native-trial.mjs:59`) |
| `l3Evidence.concurrencyCeiling` | 64 | cfg:164 | `l3_swarm.rs:351-354` equality `== L3_CONCURRENCY_CEILING` 64 ("spark pool, not native 32") |

- Unit: concurrent child tasks in one judged round, meaning the proposal wave plus one nested labrat slot. It is not an L1 count and not a wave width.
- `run-omp-native-trial.mjs:3493-3494` "native task concurrency exceeds concurrency ceiling" **cannot fire** at current constants.
  `:3434` pins the ceiling at 32, and concurrency = waveSize + 1 ≤ 17. No test asserts the message.
- Validation: `lib.rs:991-999` and `sync-ufo-contracts.mjs:1447-1449` check a positive int only. `concurrencyCeiling` is **not** projected to `task.maxConcurrency`, which is pinned to 0.
- Nothing compares it to `task.maxConcurrency` or `waveMaxLanes`. They equal 32 by coincidence (see three-thirty-twos).
