# ramp-pacing — 5 per 700 ms is declared, not enforced

Asked: does anything pace launches on `rampBatchSize` / `rampIntervalMs`?
Lane `RampPacing`. Reader set re-grepped by the L1 over `scripts packages crates`, excluding tests.

Every reader:
- `ufo-mission-result.mjs:2472-2485`: default, positive-int validation → `invalid_policy`
- `ufo-swarm-wave.mjs:781`: positive-int validation of injected policy
- `ufo-swarm-wave.mjs:1246-1247`: echoed into the plan's `policy` block
- `sync-ufo-contracts.mjs:1240`: type check

There is **no** sleep, timer, or batching on these keys anywhere. `SWARM_RAMP_*` is imported by `ufo-swarm-wave.mjs:120`, and the body uses it only through the loader defaults.
Neither key has an upper bound. `host/ufo-sighting-dispatch.json` carries no ramp keys, so apply never writes them.

Stated rationale: `ufo-mission-result.mjs:2414` "launch ramp 5 per 700 ms" (kimi parity); `ufo-swarm-wave.mjs:35-38` "recorded in the plan as declared pacing policy for substrates that pace manually".
The swarm skill agrees: "the ramp constants are recorded in the plan as declared pacing policy only". `BEHAVIOR-MATRIX.md:401`: "the ramp never splits or delays a dispatch".

Verdict: declared pacing policy, honestly labelled in the skill, unenforced in code. The OMP harness's `task.maxConcurrency` queue is the real launch limiter.
