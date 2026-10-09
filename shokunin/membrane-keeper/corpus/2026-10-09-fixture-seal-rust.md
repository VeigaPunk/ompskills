# fixture-seal-rust — the Rust seal writer vs the JS writer

Asked: the Rust seal write site, payload, atomicity; whether Rust also reads
the seal; payload parity with the JS writer.

Observed (wave r1-w1 lane FixtureSealRust):

- Rust write site: `loop_driver_publish.rs:94-108` `write_membrane_seal` →
  `publish_guarded` (:61-80) → `local_ship.rs:2161-2226` `atomic_write`
  (hand-rolled tmp `.name.ufo-ship-pid-uuid` with create_new 0600 + sync_all
  + dir-fsync + rename + dir-fsync under a writer lease — **not**
  writeFileAtomic). Called only from `loop_driver_dry.rs:703-704`. The spec's
  `loop_driver.rs:373` cite is a doc comment — wrong anchor.
- `.ufo/` creation: `lease::acquire` at `LoopDriver::open` (lease.rs:221-223)
  plus `create_dir_all` in the writer. The JS writer does **not** mkdir — a
  `.ufo`-absent run root may fail the seal write [inference].
- Rust read side: `refuse_if_membrane_sealed` (publish.rs:113-148) gates
  `loop_driver_dry.rs:86` and `loop_driver_resume.rs:557`; the resume path
  also refuses non-`round_cap` checkpoints (resume.rs:403). So **Rust both
  writes and refuses on a standing seal**; JS mirrors that for fresh launches.
- Seal-write failure: Rust persists the checkpoint FIRST (dry.rs:892) then
  propagates the seal error via `?` → CLI exit 1. **Fail-open window**: a
  fresh driver reads only the seal file, not the checkpoint — a run whose
  checkpoint says `authority_boundary` but whose seal write failed dispatches
  fresh. JS handles it fail-closed instead (refuses the launch, exit 2,
  rejection.txt).
- Payload parity: keys and `kind` match; divergences — `accept_digests`
  (Rust `sha256:`-prefixed serialized-Proposal digest vs JS bare collector
  artifact_hash), `round` (0-based Rust vs 1-based JS, run-omp-native-trial
  :860), `session_id` source, and `run_id` grammar (Rust ≤255 bytes vs
  launcher `^[A-Za-z][A-Za-z0-9_-]{0,15}$` vs charter sign ≤64 `[A-Za-z0-9_-]`
  — three different grammars for the same field).
- Typed refusal codes exist only in charter sign; loop and launcher refusals
  are untyped strings.

Confidence: high for sites; medium for the checkpoint-first fail-open
(no end-to-end test covers seal-write failure).
