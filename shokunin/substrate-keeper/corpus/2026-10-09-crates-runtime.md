# crates-runtime — crates/ufo-core-runtime, the only judge

Asked: the runtime crate's module map, judge entry, boundary, and test map.
Source: lane CratesRuntime report. Anchor: ufo-fsd-alpha@5ace2559.

## Observed

- Lib-only crate (no `[[bin]]`), Rust 2024, MSRV 1.85; **49 declared top-level modules** +
  `native::evidence`; `src/` ≈ **58,191 lines**. Workspace has exactly two Cargo members
  (`ufo-core-runtime`, `ufo-cli`) — `ARCHITECTURE.md:37-38`, `BEHAVIOR-MATRIX.md:118`.
- Judge entry: `native.rs:424` `judge_handoff(&NativeRoundHandoff, &TrustedContext) ->
  Result<NativeHandoffVerdict, NativeHandoffError>`, re-exported `lib.rs:98-105`; JSON variant
  `native_digests.rs:27 judge_handoff_json`. Called by `ufo-cli` (`main.rs:258`).
- CLI boundary: no bin in the runtime crate; the executable is `crates/ufo-cli` `[[bin]] name = "ufo"`
  (`self-iter` `main.rs:432` → `LoopDriver` `:482/488`; `judge` `:206/258`).
- Node boundary: the seven `substrates/{omp,kimi,codex,cursor,opencode,grok,devin}/bin/cli.mjs`
  delegate once via `packages/substrate-runtime` → spawn `ufo self-iter` → `crates/ufo-cli` → crate
  `LoopDriver`/`judge_handoff`; none implements a judge (`self-iter-delegate.mjs:1-7,293-310`).
- Bundled mirrors used by `build.rs`: `bundled/{config.json,omp-seat-routing.json,godspeed-core/**,skills/wwkd/**}`
  (`Cargo.toml include`; `build.rs:1-30`).
- Tests: 5 integration targets (`build_json` 5, `conformance` 1, `loop_driver` 68, `native_handoff` 25,
  `perf_probe` 6 = **105**) + 24 inline `*_tests.rs` modules (**879** `#[test]` across `src/`);
  support module `tests/native_support/mod.rs` (1454 lines, not a target).

## Contract

| rule | evidence |
| --- | --- |
| The crate is the only self-iteration runtime and the only judge | `AGENTS.md:3-5`; `README.md:4-6` |
| `NativeRoundHandoff` admission lives solely there | `README.md:9-10`; re-export `lib.rs:98-105` |
| Judge entry is `native::judge_handoff` | `native.rs:424-425` |
| Workspace = exactly two members | root `Cargo.toml`; `ARCHITECTURE.md:37-38` |
| Lib-only crate; the executable is `ufo-cli`'s `ufo` bin | both `Cargo.toml`s |
| Seven Node entrypoints delegate once; none judges | `self-iter-delegate.mjs:1-7,293-310`; `main.rs:258,482` |
| Dispatch/route metadata cannot change the judge implementation identity | `SKILL.md:556-559` |
| The crate carries bundled mirrors consumed by `build.rs` | `Cargo.toml include`; `build.rs:1-30` |

## Not carried by the source

- No `[features]` in the runtime crate's `Cargo.toml`; no `[[bin]]`; no network/WASM/native binding
  exposes `judge_handoff` directly to Node — the observed bridge is a spawned `ufo` process
  (`spawnSync`), not a library call.
- `src/lib.rs` declares no `fleet`/`ufo-runtime` module; `docs/GOAL-AUDIT.md:266` cites
  `src/fleet.rs`, which is **not** in the current tree — treat that doc reference as stale.

## Unknowns

- `docs/GOAL-AUDIT.md:115` "cargo test -p ufo-core-runtime --lib 89 passed" cannot be reconciled with
  the 879 inline `#[test]` at HEAD (not exercised — read-only lane).
- Whether `bundled/*` bytes match their `SHA256SUMS` was not verified (gate battery out of scope).
- The full `LoopDriver` entry surface was not exhaustively enumerated (only `run_dry_until_halt`
  observed being called from `ufo-cli self-iter`).