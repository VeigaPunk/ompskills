# recovery-mirror — `recovery` on both surfaces

Asked: field mirror between `nativeProfiles.omp-native-v1.recovery` and `OrchestrationConfig.recovery`, defaults, and which drills write it.
Anchor: `ufo-fsd-alpha@5ace2559` (read-only); `config/ufo.json` cited from the working copy (sha256 `0e416f0a…`, uncommitted swarm-band edit only). Lane: `RecoveryMirror`.

## Observed
- Same field names and default values on both sides (verified against `config/ufo.json` and `config.rs:26-90`): `temporaryRetry {maxAttempts: 2, backoffMs: 0}`, `backpressure {domainCooldownMs: 60000, herdThreshold: 3, herdWindowMs: 30000, maxConcurrentPerDomain: 0}`. `maxAttempts` counts TOTAL attempts (2 = one retry, `config.rs:26`).
- Differences: config/ufo.json requires every key, `RecoveryConfig` serde-defaults each; config/ufo.json accepts a `note` key that `RecoveryConfig` (`deny_unknown_fields`) refuses; the fixture loop reads only `config/orchestration.json`, so config/ufo.json backpressure never changes `ufo self-iter`.
- **Only `d-herd` writes a recovery block** into `config/orchestration.json` (backpressure `herdThreshold 2`, window 30000, cooldown 60000; scenario `fail:usage_limit:*:all`); asserts exit 1 + `domain-cooldown` on stderr. `d-domain-*` and `d-timeout*` write none.
- d-herd's exit 1 depends on the all-specialists-failed bail (`loop_driver_dispatch.rs:1469`); a wave with any output exits 2 (`main.rs:531`). Source-traced only, not run.

## Gaps
- `temporaryRetry` has no native runtime reader found (validation only); no drill exercises it on the fixture loop.
- d-herd's own `task/max_rounds/concurrency 4` are overwritten by CLI flags (`run.concurrency 2`).
