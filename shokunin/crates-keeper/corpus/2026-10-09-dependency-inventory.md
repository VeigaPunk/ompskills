# Crate dependency inventory

Asked: every dep of both crates, features, use sites, suspicious items.
Substrate `5ace2559` (lane DependencyHygiene).

## Counts

20 declarations (ufo-cli: 8 normal + 1 dev; ufo-core-runtime: 10 normal +
1 dev), 15 unique names. Zero build-dependencies (build.rs is std-only);
tempfile dev-only in both.

## Workspace deps and use sites

anyhow (error carriers in cli), chrono+serde (timestamps; the serde
feature has NO visible consumer — flag F3), jsonschema 0.18.3
default-features=false+draft202012 (required by titanium.rs:662; resolves
with zero reqwest nodes), libc (O_* flags; `libc::SIGINT` at lib.rs:402 is
replaceable by signal_hook::consts — flag F6), serde+serde_json
(everywhere), sha2 (digests), tempfile (dev), thiserror (8 derive(Error)
sites), signal-hook (default-features=false correct — no iterator/channel
use), clap (cli), rayon (see flag F1).

## Flags

- F1: dead `rayon` import at `native.rs:20-21` under
  `allow(unused_imports)`.
- F2: `native.rs:22-23` serde import whose comment claims a native_tests
  consumer — grep finds 0 uses.
- F3: chrono `serde` feature (root Cargo.toml:16) has no visible consumer.
- F4: float_roundtrip rationale absent from tree [INFERENCE].
- F7: runtime libc used only for open flags; `kill` comes from the kill
  binary, not libc.

All flags are grep-level pending a `cargo check` with the allows removed —
run it on a /tmp copy of the crate, never in the substrate.
