# Workspace build graph

Asked: the Cargo workspace graph of the UFO substrate (members, resolver,
deps, lints, toolchain). Observed at `5ace2559` (lanes WorkspaceGraph +
DependencyHygiene; spot-verified by L1).

## Observed

- Root `Cargo.toml`: `[workspace]` resolver `"3"`, members
  `crates/ufo-core-runtime` and `crates/ufo-cli` (2 total).
  `workspace.package`: version 0.1.0, edition 2024, rust-version 1.85.
- `[workspace.dependencies]` (root Cargo.toml): anyhow 1.0.100, chrono
  0.4.42+serde, jsonschema 0.18.3 (default-features=false, draft202012),
  libc 0.2.177, serde 1.0.229+derive, serde_json 1.0.151, sha2 0.10.9,
  tempfile 3.27.0, thiserror 2.0.20.
- `[workspace.lints.rust] unsafe_code = "forbid"`;
  `[workspace.lints.clippy] all = "warn"`, `pedantic = "warn"`
  (root Cargo.toml:25-30). Crate-level suppressions observed: ~105 allow
  lines in core, 4 in cli.
- `rust-toolchain.toml`: channel stable, min-version 1.85 (whether
  rustup honors `min-version` unverified — a sibling report claims the key
  is dead).
- Dependency edge: `ufo-cli` → `ufo-core-runtime` by path
  (`crates/ufo-cli/Cargo.toml:17`). No reverse edge. `ufo-cli` is the only
  in-repo Rust consumer of the lib.
- No build-dependencies in either manifest; `build.rs` imports std only.
- `ufo-core-runtime/Cargo.toml:8` `include = ["src/**/*", "bundled/**/*",
  "build.rs", "Cargo.toml"]` — packages 99 entries, zero tests (checked via
  `cargo package --list` on a /tmp copy, not in the substrate).
- `ufo-cli` has NO `include` key — so `titanium.rs:15-18` `include_bytes!`
  reaching `../../packages/substrate-lib/...` escapes its package root.

## Card-facing facts

- `unsafe_code` is forbidden workspace-wide — a card claim worth carrying.
- 20 dependency declarations, 15 unique names; tempfile is dev-only in both
  crates; zero build-deps.

## Unknowns

- Whether rustup enforces the toolchain `min-version` key.
- The test-only cross-crate include at `crates/ufo-cli/tests/cli_contract.rs:10`
  has no documented contract.
