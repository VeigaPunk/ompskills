# authority-boundary-emission — who sets loop_stop and what carries the digests

Asked: the full `authority_boundary` emission path in crates/ — verdict field,
`membrane_accepts` content, serialization, which producer emits, taxonomy.

Observed (wave r1-w1 lane BoundaryEmission):

- Verdict field: `NativeHandoffVerdict.loop_stop` (lib.rs:630). Override at
  native.rs:343-345: `if !membrane_accepts.is_empty() { loop_stop =
  AuthorityBoundary }`. Fixture twin: loop_driver_dry.rs:463-465 sets
  `outcome = AuthorityBoundary`.
- `membrane_accepts` (native): `Vec<String>` of bare artifact hashes —
  native.rs:316-342 pushes `proposal.evidence_digests.first()` (=
  `agent.artifact_hash`, native_scores.rs:341). Gated on membrane `Some` AND
  `GateDecision::Admit`, over `survivor_seats` only.
- `membrane_accepts` (fixture): `Vec<MembraneAccept{proposal_id, digest,
  touched_paths}>` (state.rs:60-71); `digest = format!("sha256:{}",
  proposal.digest)` (loop_driver_judge.rs:443) — sha256 of the serialized
  Proposal, NOT artifact bytes. **The two digest encodings differ and no test
  binds them.**
- Serde: `LoopOutcome` and `CheckpointStopReason` are snake_case —
  `AuthorityBoundary` → `"authority_boundary"` (state.rs:19-20, 40-41; pinned
  state_tests.rs:80-85). `authority_boundary` is simultaneously a
  `LoopOutcome` variant (state.rs:57), a `CheckpointStopReason` variant
  (state.rs:25), and the verdict `loop_stop` value — not a standalone field.
- Native emits the verdict + round digest (native.rs:516-525) but **never a
  seal** — no native seal writer exists in crates/. Fixture
  loop_driver_dry.rs:703-705 writes the seal via `write_membrane_seal`
  (publish.rs:94-108, the only caller), after persist_state, before digest.
- Refusal: `refuse_if_membrane_sealed` (publish.rs:113-148) bails with an
  anyhow prose string `authority_boundary: {detail}; operator sign-off
  required — ufo charter sign {run_id}` — untyped, unlike the CLI's typed
  kinds. Gates at dry.rs:86 and resume.rs:556-557.
- `loop_driver_resume.rs:571-579` breaks the loop on `AuthorityBoundary`
  alongside Saturated/BudgetHalt/Blocked/HonestyBrake/Interrupted; the
  round-boundary stops (loop_driver.rs:315-317) never produce it.
- Divergences: run-logic.md:1185-1191 attributes verdict+seal to one producer —
  source splits them (native verdict, fixture seal); run-logic :1158-1159
  lists loop_stop values as a union across producers, not per producer.

Confidence: high for enum spellings/override sites/seal writers; medium for
"native never seals" consequence (external callers not fully traced).
