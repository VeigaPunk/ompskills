# spec-06-distilled — the membrane spec, checked against the code

Asked: distill spec 06 fully; verify its status-block anchors; report
contradictions.

Observed (wave r1-w1 lane Spec06Doc;
`docs/advisory/2026-09-17-ufo-improvement-pack/06-membrane-signoff-and-artifact-trust.md`, 211 lines):

- All 9 status-block line anchors are stale at HEAD and working tree; names
  and symbols hold. Examples: `config.rs:205` is `Ok(())` in BudgetsConfig
  (membrane const is :226); `main.rs:896` is charter_stage's close brace
  (charter_sign is :989); `main.rs:212` is SelfIter's concurrency field
  (dispatch :219-221); `loop_driver.rs:373` is a doc comment (seal writer is
  loop_driver_publish.rs:94-108); collector :824 is unrelated (screening is
  :1076-1088).
- Premise correction (WalkB §06, :35): originally "the membrane check is NOT
  computable" (no path field existed); superseded — `Proposal.touched_paths`
  exists (proposal.rs:35) and the screen is mechanical.
- Path list: spec proposed 11 entries; landed has 11 but entry 3 is a glob
  (`scripts/collect-omp-native-handoff*`) — the spec's "landed verbatim"
  claim is contradicted.
- Three contradicted claims:
  1. D-membrane-negative supposedly validates the list isn't over-broad — but
     it uses a test-local list omitting `crates/**`; the canonical
     `crates/ufo-core-runtime/**` would cover its own negative path. The drill
     never tests the canonical list.
  2. "Full Phase 0" (contracts, build, boot, probe, mutation battery, drills)
     landed as three stages: `contracts, build, drills` (main.rs:850).
  3. `membrane_signoff` typed telemetry `{run_id, accepts, operator_ts}` landed
     as an artifact `.ufo/charter/<runId>.json` with no reader.
- Landed-but-unspecified: candidate_writes union screen; `bundled/config.json`
  as a third identical copy; fifth class `directive_task_data`; plural
  `screening_flags` array; six typed sign refusals; the debug-only
  `UFO_TEST_CHARTER_PHASE0` seam; credential screen action is `die`, not
  redact.
- Verified-landed (anchors confirmed): TTY gate + `non_interactive` exit 2;
  atomic 0600 seal (test-asserted loop_driver_tests.rs:4732); kind
  `ufo-membrane-seal-v1` (publish.rs:45); fail-closed unreadable seal;
  launcher refusal naming `ufo charter sign`; doctrine sentence in
  SKILL.md:222-228 and run-logic.md:432; matcher single-sourced at
  proposal.rs:354-359.
- Note: spec 06's own anchor for itself (`config.rs:205`) is wrong — when
  citing spec 06, cite section numbers and symbol names, never its line
  numbers.
