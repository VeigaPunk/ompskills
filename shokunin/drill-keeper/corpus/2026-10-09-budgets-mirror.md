# budgets-mirror — `budgets` on both surfaces

Asked: whether config/ufo.json `budgets` and `OrchestrationConfig.budgets` really share names, how each validates, and who reads which.
Anchor: `ufo-fsd-alpha@5ace2559` (read-only); `config/ufo.json` cited from the working copy (sha256 `0e416f0a…`, uncommitted swarm-band edit only). Lane: `BudgetsMirror`.

## Observed
- Wire names identical: `tokensPerRound, tokensPerMission, wallClockMsPerMission, maxAttemptsPerLane, phase0ProbeTokens, action` (Rust `BudgetsConfig` snake_case fields under `rename_all = "camelCase"`, `config.rs:162-170`). Live values all `0` (unlimited) + `action: "honesty_brake"`.
- **Not interchangeable:** config/ufo.json carries `note` and `rateCard`, which `BudgetsConfig` (`deny_unknown_fields`) refuses.
- ufo.json side (`crates/ufo-core-runtime/src/lib.rs:395-485`): block required, closed key set, five non-negative integer counters, `action == "honesty_brake"`, optional `rateCard` per route. Fixture side (`config.rs:190,196-206`): only `action` validated; counters are unsigned types.
- **"Absent key is config-invalid" holds only for config/ufo.json** (`lib.rs:403,429-431`). The fixture side is `Option` with an all-zero default (`config.rs:325-329,417-423`; `config_tests.rs:289-294`).
- Runtime readers of config/ufo.json budgets are native-only: `validate_native_budgets` (`lib.rs:974`) → `round_stop_outcome` (`native.rs:235-242`), rateCard → cost ledger (`native.rs:459`), `phase0ProbeTokens` in `scripts/run-omp-native-trial.mjs:3154-3172`, rateCard in the collector (`:445`). The fixture loop never reads config/ufo.json.
- Drills: `d-brake-actual`, `d-brake-projected` are wired `cargo-test` drills that inject budgets in-process via `with_budgets` (`loop_driver_tests.rs:3448-3550`); `expect.exit 0` is the cargo process, not the brake's exit 2.

## Drift
- `maxAttemptsPerLane` is `u32` (fixture) vs `as_u64` (ufo.json). Spec 03 cites `loop_driver.rs` line ranges beyond the file's length. [INFERENCE] the native path has no pre-dispatch projection or wall-clock enforcement.
