# fixture-budget-keys — `fixtureRoundBudget` and `proposalsPerLane`

Asked: live values, every reader, validation, and what actually consumes each value.
Anchor: `ufo-fsd-alpha@5ace2559` (read-only); `config/ufo.json` cited from the working copy (sha256 `0e416f0a…`, uncommitted swarm-band edit only). Lane: `FixtureBudgetKeys`.

## Observed
- Live: `fixtureRoundBudget 5`, `proposalsPerLane 2` (same in the bundled mirror).
- **Consumers are the portable TypeScript fixture only** (`src/`):
  - `src/orchestrator.ts:28` — fixture round-loop bound; `:124` — status `budget-exhausted` when the loop ends unsaturated.
  - `src/lanes.ts:21` — `.slice(0, config.proposalsPerLane)`: the per-lane proposal cap (the only `proposalsPerLane` consumer).
  - `src/orchestrator.ts:157-161` `validateInputs` (called from `src/cli.ts:30`): `fixtureRoundBudget must be at least 1`, `proposalsPerLane must be a positive integer`.
- Sync gate: `assertFixtureContract` (`scripts/sync-ufo-contracts.mjs:1303-1307`), reached from `loadNativeProfile` (`:1435`): same two messages prefixed `config/ufo.json`.
- **No Rust reader.** `crates/ufo-core-runtime/src/config.rs:12` mentions it in a doc comment only. `ufo self-iter`'s round count is `OrchestrationConfig.max_rounds` (default `SELF_ITER_ROUND_BUDGET_DEFAULT = 6`, `config.rs:15`), overridden by CLI `--rounds`. `docs/BEHAVIOR-MATRIX.md:194` and `docs/L2-L3-ROUTING.md:157,394-398` document the distinction correctly.

## Gaps
- `sync-ufo-contracts.mjs:1260-1262` claims `build.rs` checks these; `build.rs` `validate_local_omp` has no fixture keys.
- No sync test pins `proposalsPerLane` (`tests/sync-ufo-contracts.test.js:1053-1055` covers `fixtureRoundBudget` only).
- A non-integer `1.5` gets the misleading `must be at least 1` message (`orchestrator.ts:158`, sync `:1304`). No upper bound on either key (contrast Rust `MAX_ROUNDS_CEILING = 10000`).
