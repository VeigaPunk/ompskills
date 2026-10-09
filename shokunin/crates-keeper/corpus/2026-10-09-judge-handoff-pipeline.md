# judge_handoff pipeline — what "the only judge" means in code

Asked: the judge-authority entry points and pipeline end-to-end. Substrate
`5ace2559` (lane JudgeAuthority + ErrorTaxonomy).

## Pipeline (all path:line verified)

CLI `main.rs:193-207` JudgeHandoff arm → `judge_handoff` main.rs:226-270
(`read_bounded_regular`, `reject_excessive_json_depth`, `parse_unique_json`,
serde decode) → lib `judge_handoff` native.rs:424-527:
`validate_header` → agents/ledger/launch/cost/topology/telemetry validators
→ `ParetoGate::new(handoff.axes)` (native.rs:476) → `validate_proposals`
(native_scores.rs:60) → `validate_integrated_candidate`
(native_scores.rs:396; `gate.decide` at :432) → verdict assembly
(native.rs:262-405) → `emit_native_round_digest`
(native_plan_digest.rs:501) → `Ok(verdict)`.

## What "only judge" means — and its edges

- Only `judge_handoff` (native.rs:424) returns a `NativeHandoffVerdict`;
  only `ParetoGate::scan/verdict` (gate.rs:118-163) produces `admit`.
- The launcher persists judge stdout verbatim
  (run-omp-native-trial.mjs:4140-4144).
- NOT enforced as sole admission: `loop_driver_judge.rs:52-135` is a second
  Rust admission path (dry self-iter); `src/pareto.ts` and
  `packages/ufo-core/src/pareto.ts` are live parallel TS gates;
  fleet continuation reads seat-authored `iteration.decision`.

## Verdict encoding

- A Pareto reject is `Ok` + process exit 0 (native.rs:424-427,494-525).
  Only malformed score vectors / malformed integrated candidates return
  `Err` (native_scores.rs:332-337 via 638-641; :408-412,:433-436).
- No `code` field anywhere in the handoff schema (deny_unknown_fields,
  native_schema.rs:423-425). Encodings: `GateDecision` serde tag `verdict`
  (gate.rs:14-35), per-seat reason strings (native_scores.rs:474-505),
  round-digest `reason_code` (round_digest.rs:81).
- Doc-vs-code divergence: native.rs:192-196 says rejected handoffs return
  Err with `unsound`; the code returns Ok with `round_validity: Sound` for
  RejectRegression/RejectNoImprovement (native.rs:384;
  native_tests.rs:3834-3850).

## Caveats worth a second look

- Handoff axes are producer-declared; the judge checks self-hash and
  axes_digest but does not compare to the native axis literal
  [INFERENCE, grep-scoped].
- Integrated-candidate scores are validated against the distiller artifact,
  not recomposed from survivors (native_scores.rs:408-432,507-541).
- The proposal honesty clamp runs with `collect_flags=false`
  (native_scores.rs:338).
