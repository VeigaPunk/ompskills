# Rust ↔ scripts boundary

Asked: where Rust logic ends and scripts begin. Substrate `5ace2559`
(lanes RustScriptBoundary, VerbsOwned, PackageRelationship).

## The split

- **Rust owns**: verb logic for all 11 `ufo` verbs; compile-time mirror
  validation (build.rs); the only NativeHandoffVerdict producer; the
  canonical self-iter loop; bounded IO/fixture machinery; the
  verify/rollback transaction (local-ship).
- **Scripts own**: mirror generation (`sync-global-routing.mjs`,
  `sync-ufo-contracts.mjs`), sync-time byte/equivalence `--check` gates,
  all wall/orchestration verbs (`ufo-sighting` 15 verbs, `ufo-swarm-wave`
  plan/run/record, `ufo-mission-result`, `ufo-swarm-collect`), drills and
  watchdogs, the routing-health.jsonl WRITER (evidence.mjs:1067-1165 —
  Rust only reads it).
- **Shared contract**: the bundled mirrors are script-produced,
  crate-consumed; the seat-routing JSON schema is enforced structurally at
  compile time (build.rs) and byte-compared at sync time (sync scripts).

## Call sites

- Rust spawns only `node` (main.rs:622,:965) and `cargo` (main.rs:957)
  from ufo-cli; ufo-core-runtime spawns no scripts (fixture_spawn spawns
  python3 only).
- Scripts calling the `ufo` binary: 15 sites (run-omp-native-trial.mjs,
  collect-omp-native-handoff*.mjs, ufo-drills.mjs, self-iter.sh,
  lean-cargo measure/shim). `ufo-swarm-wave.mjs`, `ufo-mission-result.mjs`,
  `gates.sh` make ZERO binary/cargo calls.
- `package.json`: `doctor` → `cargo check -p ufo-core-runtime -p ufo-cli`
  (:22), `ufo` → `cargo run -p ufo-cli --` (:24), `loop` → `cargo run …
  self-iter` (:25); `contracts:check` (:26) has NO cargo.

## npm-package edge

- No npm package ships/installs the `ufo` binary (no bin field, no
  postinstall/copy hook anywhere). Published bins are seven Node shims.
- `packages/substrate-runtime/src/self-iter-delegate.mjs:34-42,111-126`
  resolves a PRE-BUILT binary: `CARGO_TARGET_DIR` candidates → repo
  `target/` → PATH only outside a workspace → fail-closed; spawns at
  :251,:302.
- Reverse edge: ufo-cli reads npm-side paths — titanium.rs embeds the
  substrate-lib schema via `include_bytes!` from OUTSIDE its package root
  and drift-checks it at runtime (:381-387); main.rs:685-705 hard-codes
  per-substrate skill + `substrates/<id>/bin/cli.mjs` paths.
- `ports/ufo-core-runtime/SRC-PARTIAL.json`: provenance only (six upstream
  .rs names, no bytes); its only reader is a Rust unit test.
