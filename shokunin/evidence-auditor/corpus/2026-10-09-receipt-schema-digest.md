# 2026-10-09 — receipt-digest doctrine: Rust recomputes; JS never admits

**Asked.** What do receipt digests bind, and who recomputes them? (lane
`ReceiptSchemaDigest`, reviewer.)

**Observed.** Source: `docs/BEHAVIOR-MATRIX.md` §Candidate receipts and §Exact
runner reservations, plus the Rust/JS code and conformance vectors (all read).

- **Three distinct receipt classes** (do not conflate): native-handoff
  `candidate_receipt` (schema in `native_schema.rs:373-380`); self-iter
  `PersistedCandidateReceipt` (`state.rs:212-222`, adds
  `artifact_sha256`/`survivor_set_sha256`/`axis_set_id`/`axis_set_hash`/`config_digest`);
  mission task receipts (`schema ufo-task-receipt-v1`,
  `scripts/ufo-mission-result.mjs:12`).
- **`candidate_receipt` binds exactly five digests + `admitted`**:
  `baseline_digest`, `proposal_set_digest`, `candidate_digest`, `axes_digest`,
  `contract_digest`, `admitted` (`BEHAVIOR-MATRIX.md:283`;
  `native_schema.rs:373-380`; fixture
  `conformance/fixtures/native-handoff/handoff.json:647-654`).
- **Rust refuses JS-asserted admission**: `native_header.rs:60-62` returns
  *“javascript-composed candidate”* on `admitted == true`; JS hard-codes
  `admitted: false` (`collect-omp-native-handoff.mjs:1435-1442`); Rust recomputes
  all five (`native_header.rs:192-229` baseline/axes/contract/candidate;
  `native_scores.rs:565-569` proposal_set) with per-digest “does not recompute”
  errors, pinned by tests and conformance vectors.
- **Whole-vector Pareto only**: `gate.rs:39` *“admit iff ≥1 axis improves and none
  regress”*; `loop_driver_judge.rs:21-24` *“whole candidates, never a coordinate
  envelope”*; disagreeing score vectors refuse `CoordinateComposedScores`
  (`proposal.rs:461,631-635`).
- **Wall rule**: a child exit writes durable `status: "stopped"` with
  `exitCode`/`exitSignal`/`stoppedAt` (`ufo-sighting.mjs:4379,4390-4396`;
  schema-enforced `:224-238` `MALFORMED_MANIFEST`); the only `status: "completed"`
  write is the explicit `complete` op (`:3362`) — **`completed` is never
  fabricated**.
- **Receipt file homes**: mission receipts at
  `.ufo/results/<report>.md.receipt.json` (`fleet-dispatcher.mjs:6458-6459`;
  allowed root `config/the-tick.machine.json:38`); native handoff at
  `.ufo/native-trials/<runId>/handoff.json`; self-iter receipts embedded in loop
  checkpoint state.
- **Observed 2026-10-09**: `/home/vgpnk/Projects/ufo-fsd-alpha/.ufo/` exists
  (`cache`, `scopes`, `sighting`, statusline files) but **`.ufo/results/` is
  absent** and `.ufo/native-trials/` absent; all `.ufo/` is gitignored and
  *“not published proof”* (`docs/EVIDENCE-INDEX.md:47`).

**Distilled rule.** A receipt binds artifact identity by digest and is
**recomputed by the authority that judges** — a producer’s own `admitted: true` is
refused, and “completed” is only ever written by an explicit completion, never by
inference from an exit.

**Changed.** Nothing — read-only research.

**Unknown.** Nothing was executed (tests/conformance are static citations);
whether the dispatcher `mkdir`s `.ufo/results` on the next mint was not verified.
Lane report:
`.tower/fleets/shokunin2/reports/evidence-auditor/ReceiptSchemaDigest.md`.