# ufo-cli state-file map (.ufo/ and friends)

Asked: which files the binary reads vs writes, display-only vs mutating
verbs. Substrate `5ace2559` (lane CliStateFiles).

## Write sites (mutating verbs)

- `main.rs:410` `.ufo/rs-paper-gates.json` (gates)
- `main.rs:727-738` `.ufo/contract-sync/r00.json` + manifest (self-iter)
- `main.rs:537` `.ufo/rs-self-iter-blocked.json`; `:502-530`
  `.ufo/rs-self-iter-report.json`
- `main.rs:1084` `.ufo/charter/<run_id>.json`; `:1099` removes
  `.ufo/membrane-seal.json` — **unlink without parent-dir fsync**
- `main.rs:1378`/`local_ship.rs:225` `.ufo/apply-journal`, apply-locks +
  workspace target replace (local-ship)

## Read sites

- `main.rs:1205` `.ufo/routing-health.jsonl` (untyped Value; keys
  outcome,latency_ms,tokens_in,tokens_out,ts,route) — the WRITER is the
  Node collector (`collect-omp-native-handoff-lib/evidence.mjs:1067-1165`,
  O_APPEND+fsync); Rust never writes it.
- `main.rs:1009` `.ufo/membrane-seal.json` (64 KiB cap; deny_unknown_fields
  `MembraneSeal` at loop_driver_publish.rs:34-43). Cap differs from the
  runtime's 4 MiB (loop_driver.rs:114).
- `cost_ledger.rs:372-416` `.ufo/receipts/*/round-chain.json`,
  `.ufo/native-trials/*/handoff.json`.
- `titanium.rs:13-14` `docs/titanium-cli-machine-map.json` + schema.

## Verb classification

- Display/read-only by source: status, titanium, route-plan,
  receipt-digests, judge-handoff, routing-health (only one DECLARED
  display-only).
- Mutating: plan, gates, self-iter, local-ship, charter sign.

## Findings worth keeping

- `plan` takes the mission writer lease via `LoopDriver::open`
  (loop_driver_open.rs:89); `lease.rs` has no Drop and no remove —
  `.ufo/writer-lease.json` outlives the verb.
- `plan`'s `write_wwkd_plan` does not pass `refuse_if_membrane_sealed`
  (only dry:86 and resume:557 call it).
- `local-ship` runs `recover_apply_journal` (main.rs:1378) BEFORE request
  bounds checks (:1398-1418).
- `fs_durability.rs` is `pub(crate)` with zero ufo-cli references; the CLI
  reaches `atomic_write` (local_ship.rs:2161-2226) via lib re-export.
