# selection-keys — automaticSubstrate/runnerUpSubstrate are gates, not selectors

Asked: how automaticSubstrate/runnerUpSubstrate select among the adapters.
Sources: lanes ConfigSelection, SelectionConsumers, SubstrateRuntimePkg.

## Observed — the headline correction

**Nothing selects at runtime.** Both keys are validated, never dispatched on:

- `automaticSubstrate` (:6 = `"omp"`): must literally equal `"omp"` —
  `crates/ufo-core-runtime/build.rs:191-197` (compile-time config validation),
  `scripts/sync-ufo-contracts.mjs:1356-1359`, `scripts/run-omp-native-trial.mjs:655-660`
  (refuses non-omp), `scripts/collect-omp-native-handoff.mjs:351-353`. Dispatch defaults
  are literal `"omp"` elsewhere (ufo-cli main.rs:59, config.rs:302-304).
- `runnerUpSubstrate` (:7 = `"devin"`): optional; validators check it's a string ≠
  automatic naming a declared `substrates[].id` (build.rs:209-223, sync:1363-1368).
  **Zero readers outside validators** — full-tree grep over scripts/, packages/,
  crates/, substrates/, tests/ found no dispatch, fallback, or routing consumer.
  Declared-but-inert. Documented intent: "designated runner-up, never auto-selected"
  (docs/BEHAVIOR-MATRIX.md:122,131; docs/handoffs/2026-09-11-devin-substrate-port.md:19-25).
- `substrates[]` (:312-348): validated registry — 7 entries, all `protocol:"local"`,
  `route:"local/fixture-primary"`; sync :1332-1346 requires that route. Not read at
  runtime: the Rust roster is hardcoded `SUPPORTED_SUBSTRATES` (config.rs:7-8) +
  `Substrate` enum (execution_profile.rs:12-23).
- `targets{}` (:349-378): consumed only by `check-hand-authored-sets.mjs:106-118`;
  `targets[k].substrate` values are never compared.
- `lanes[].substrate` (:260-311): all 10 lanes = `omp`; membership-checked only
  (sync:1350-1353); Rust `SpecialistLane` has no substrate field (specialist.rs:16-27).
- **id→cli**: `substrates/<seat>/bin/cli.mjs` → `runLaneCli`
  (`packages/substrate-runtime/src/lane-cli.mjs:27`); seat id = `substrate.json.name`
  (:67). self-iter delegate gates on `supportedSubstrates` (:235-243), spawns
  `--substrate <id>` + `UFO_SUBSTRATE` (:297-310).
- **id→package**: no function; literal maps in the sync script
  (skillTargets/agentTargets/cliFamilyScopes/supportedSubstrates) + `TARGET_PACKAGE`
  `{omp:"substrate-omp"}` (check-hand-authored-sets.mjs:36).

## Contract

Answer "how does selection work" with: it doesn't — selection is fixed to omp by
validation, substrate identity is carried per-seat by `substrates/<seat>/substrate.json`,
and runner-up is a documented designation with no code path.

## Unknowns

- Whether config `targets` drives routing outside `src/target-adapters.ts` (not checked).
- No explicit documented criterion for choosing devin as runner-up over other seats.
