# rust-numeric-surface — what the crates enforce

Asked: does the Rust runtime read or enforce any sighting.dispatch number?
Lane `RustSightingMirror` (exhaustive grep over `crates/`).

- **No.** `maxConcurrentL1`, `globalRunnerCeiling`, and the wave band appear only in `crates/ufo-core-runtime/bundled/config.json`, and no Rust code reads them.
  `build.rs:555-568` checks only `missionFormat.l1Alias` (route-auditor's domain).
- `ufo status` (`crates/ufo-cli/src/main.rs:311-358`) reports compile-time constants: `concurrencyCeiling` = `NATIVE_CONCURRENCY_MAX` 32 (`native_schema.rs:76`),
  `proposalWaveCeiling` 16 (`:66`), `totalSeatCeiling` 20 (`:80`). It never reports `maxConcurrentL1` or the band.
- Rust-owned bounds: `native_header.rs:254-258` (1..=32), `l3_swarm.rs:20` `L3_CONCURRENCY_CEILING` 64 (equality), `config.rs:20` self-iter 64.
- The build reads the bundled mirror (`build.rs:161-168`), while the runtime reads root `config/ufo.json` (`native_profile.rs:185-192`).
  The byte-mirror gate runs only in `sync-ufo-contracts.mjs`, so mirror drift **passes `cargo build` silently** [build not run].
