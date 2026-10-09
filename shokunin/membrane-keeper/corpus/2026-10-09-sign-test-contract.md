# sign-test-contract — how charter sign is tested

Asked: the pty harness, every charter-sign test name, what is untestable,
what each test asserts.

Observed (wave r1-w1 lane SignTestContract):

- pty harness (duplicated in `src/main_tests.rs:~240-260` and
  `tests/cli_contract.rs:~2333-2341`): `script -qec '<ufo> charter sign
  '<run_id>' /dev/null` with stdin null — util-linux `script` allocates a
  pty so is_terminal passes; `script -e` propagates the exit code.
- `pty_json`: envelope extracted as the slice from first `{` to last `}` of
  merged stdout, then serde_json parsed — fragile to any other brace in the
  pty stream.
- Charter-sign tests:
  - `charter_sign_run_id_grammar_is_pinned` (main_tests.rs:237, pty)
  - `charter_sign_refuses_non_interactive_invocation` (cli_contract.rs:2353,
    pipe → exit 2, `{ok:false,kind:"non_interactive"}`)
  - `charter_sign_refuses_absent_or_mismatched_seal` (:2371, pty)
  - `charter_sign_full_pass_writes_artifact_and_lifts_seal` (:2395, debug,
    pty + `UFO_TEST_CHARTER_PHASE0` seam)
  - `charter_sign_failed_stage_keeps_seal_and_records_it` (:2436, debug)
  - `charter_sign_partial_fixture_substitutes_missing_stages_fail_closed`
    (:2478, debug)
  - `charter_sign_release_refuses_phase0_fixture_and_keeps_the_seal`
    (:2517, release-only)
  - `charter_sign_refuses_seals_that_do_not_decode_as_membrane_seals` (:2568)
- Adjacent: `charter_phase0_fixture_substitutes_missing_stages_fail_closed`
  (main_tests.rs:167), `charter_phase0_malformed_payload_falls_through_to_real
  _children` (:200), `charter_phase0_timeout_knob_binds_its_documented_default`
  (:126), `timeout_knob_grammar_falls_back_and_honors_override` (:46),
  `contract_sync_check_command_grammar_is_pinned` (:142),
  `membrane_touching_admit_seals_the_loop` (ufo-core-runtime
  tests/loop_driver.rs:964 — pins the sign-verb text inside the refusal).
- Untestable without a pty: the is_terminal positive path — every reach past
  the gate needs both ttys. Mixed tty/pipe combinations are untested.
- Corrections to brief/spec anchors: `main_tests.rs` lives at
  `src/main_tests.rs`; spec's D-sign-auth pins (:1696,:1714) are local-ship
  tests — the real pins are cli_contract.rs:2353-2589; `script -qec` is
  util-linux syntax and the unit pty test is not `cfg(unix)`-gated;
  two duplicated pty helpers can drift.
