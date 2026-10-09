# Generated-code dataflow

Asked: every include!/include_str!/include_bytes!/OUT_DIR site and what
flows through it. Substrate `5ace2559` (lane GeneratedInclude).

## Sites

- `src/execution_profile.rs:548`: `include!(concat!(env!("OUT_DIR"),
  "/omp_role_chains.rs"))` — the ONLY generated include. Produced by
  build.rs:170-172. Defines `generated_omp_steps`/`generated_omp_family`
  used by `role_family`/`omp_chain` (:554-563).
- `include_str!` ×2, both TEST-only, reading `bundled/omp-seat-routing.json`:
  `tests/native_handoff.rs:306`, `tests/native_support/mod.rs:617-619`.
- `include_bytes!` ×1: `crates/ufo-cli/src/titanium.rs:15-18`, embedding
  `packages/substrate-lib` schema — escapes the crate's package root
  (ufo-cli Cargo.toml has no `include` key).
- No other `env!("OUT_DIR")` site in src/.

## Package-time property

`ufo-core-runtime/Cargo.toml:8` `include = ["src/**/*", "bundled/**/*",
"build.rs", "Cargo.toml"]` — bundled/ is inside the package root, so a
published crate carries the mirror producer input. Verified via `cargo
package --list` on a scratch COPY (99 entries, 0 tests/) — never run cargo
in the substrate itself; copy the crate to /tmp first.

## Header claim to distrust

build.rs:14-16 calls bundled/config.json "a byte-for-byte copy of the
canonical root config" — false at 5ace2559 (4-key diff; see
bundled-mirror-provenance entry). Treat header prose as intent, verify
against bytes.
