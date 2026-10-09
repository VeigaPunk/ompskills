# pkg-ufo-core — packages/ufo-core (@ufo/core)

Asked: inventory + role of packages/ufo-core.
Source: lane UfoCorePkg (`reports/adapters-keeper/UfoCorePkg.md`).

## Observed

- Workspace member. `@ufo/core` — TS-side Pareto/round-contract library
  (src/ 9 modules + index.ts + 8 test files, 2785 lines). **Not an adapter and not a
  TS mirror of the Rust judge.**
- **Only importer**: `@ufo/contract-support` batteries.ts:22 — whose batteries have
  zero live callers. Effectively isolated from the adapter matrix: every adapter cell
  for @ufo/core is "none consumed".
- `local/fixture-primary` is **not** consumed by ufo-core — it governs the root src/
  portable fixture + config substrates[] entries (src/substrate.ts:17-21,
  src/orchestrator.ts:279-280).
- Shared link with the Rust side: `conformance/vectors/**` walked by both the TS
  runner (conformance-vectors.test.ts:10,109) and the Rust runner
  (crates/ufo-core-runtime/tests/conformance.rs:167).

## Contract

In the adapter matrix, ufo-core's role is "TS contract library for the portable
fixture" — answer "which adapter uses @ufo/core" with **none**.

## Unknowns

- Parity between root src/pareto.ts (strictParetoGate) and packages/ufo-core
  src/pareto.ts (admitMove) unverified.
- docs/REMAINING.md:850-856 + artifacts cite packages/ufo-core/src/
  dual-orch-conformance.ts and packages/ufo-core/conformance — both absent, treated as
  stale doc refs. Historical TS2307 at evidence path noted.
