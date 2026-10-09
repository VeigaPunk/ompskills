# Error/refusal taxonomy across the crates

Asked: error shapes per layer (build-time, CLI arg-time, runtime, judge).
Substrate `5ace2559` (lane ErrorTaxonomy).

## Layers

- **build.rs**: `eprintln!("error: {error}")` + `ExitCode::FAILURE`
  (:141-149). Zero panic/unwrap/expect; 34 `Err(String)` sites. Parse
  errors come from `src/build_json.rs` verbatim messages.
- **clap**: its own text + exit 2 (clap_builder 4.6.6 per Cargo.lock).
  Validators at main.rs:32-34,51-59 (`parse_native_substrate`), :80
  (`parse_iso_date` :1155-1172).
- **runtime**: two shapes — `fail_local` (main.rs:780-791)
  `{ok:false,kind,error}` JSON + exit code arg (default 2; phase0=1;
  local-ship rollback=3; 49 call sites) vs anything escaping `run()` →
  `ufo: <Display>` + exit 1 (main.rs:164-175).
- **judge verdict**: no `code` field (schema deny_unknown_fields,
  native_schema.rs:423-425). `GateDecision` serde tag is `verdict`
  (gate.rs:14-35); rejects are `Ok` + exit 0.

## thiserror census

8 non-test `derive(Error)` sites, all thiserror. Non-thiserror carriers:
`BoundReadError`, `bail!` (91 lines).

## Gotchas

- The help legend (main.rs:15) does not cover the self-iter BLOCKED
  envelope from `block_self_iter` (:536-549) — it has no `ok`/`kind` keys.
- The runtime alias check (lib.rs:1014-1027) validates presence+`@` only;
  `seats.main.alias == l1Alias` parity is build-time only.
