# lean-cargo — what it is and what a lane must never run

Asked: the scripts/lean-cargo/ surface and read-only bounds. Substrate
`5ace2559` (lane LeanCargo).

## What it is

A cargo-wrapper shim (`bin/cargo-shim.sh`, 344 lines) giving each
build-family invocation a private flock'd target slot with overlayfs
lowers and sccache fallback. It wraps the **rustup proxy**, not a cargo
binary: every real path ends in `exec -a cargo $RUSTUP_BIN`
(cargo-shim.sh:33-36,66,298).

## Files and hazards

- `install-shim.sh`: copies the shim to `$HOME/.cargo/bin/cargo` and moves
  the rustup proxy to `cargo.rustup-proxy` (:25-27,41-63). NEVER run —
  mutates the operator's toolchain PATH.
- `measure.sh`: runs a convoy-vs-slots benchmark that touches
  `crates/ufo-core-runtime/src/lib.rs`, runs real `cargo test` into the
  convoy, and unconditionally wipes `SCCACHE_DIR` (:17,50,65-66). NEVER
  run — writes inside the substrate.
- Kill switch: `LEAN_CARGO_DISABLE` env (see shim).
- No script under scripts/, no package.json script, no gate invokes
  lean-cargo; `gates.sh` (1001 lines) has 0 cargo matches. The only
  references are docs/reports — and two of them (ADR-001:50, README:43)
  claim a gate runs cargo, contradicted by source.

## Read-only bounds

Reading the shim, README, and scripts is fine. Do not run the shim, any
cargo in the substrate, install-shim.sh, or measure.sh. A lane that needs
cargo semantics copies the crate(s) to /tmp and runs there.
