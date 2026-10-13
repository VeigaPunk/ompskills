# drill-coverage — what actually pins the membrane behavior

Asked: every membrane drill/test — construction, assertions, line ranges;
whether conformance vectors exercise the membrane.

Observed (wave r1-w1 lane DrillCoverage):

- `D-membrane` → `membrane_touching_admit_seals_the_loop`
  (crates/ufo-core-runtime/tests/loop_driver.rs:963-1022): fixture writes a
  test-local membrane `[scripts/collect-omp-native-handoff.mjs,
  skills/ufo/references/**]` to a tempdir `config/orchestration.json`; a
  `membrane_script` scout proposal triggers it. Asserts: outcome
  `AuthorityBoundary`, 1 report, 1 admitted, `membrane_accepts[0].proposal_id
  == "membrane-scout"`, seal kind `ufo-membrane-seal-v1` with run_id/round 0/
  accept_digests/sealed_at_ms, checkpoint `stop_reason: authority_boundary`,
  and a fresh driver refused with `authority_boundary` + `ufo charter sign
  <run_id>` text.
- `D-membrane-negative` (tests/loop_driver.rs:1026-1043): proposal touching
  `crates/ufo-core-runtime/tests/fixtures/x.md` against the same test-local
  list → `Saturated`, no seal. **Divergence**: the canonical
  `crates/ufo-core-runtime/**` would match that path — the negative passes
  only because the fixture list omits `crates/**`; it cannot detect
  over-breadth of the canonical list.
- `D-sign-auth` → `charter_sign_refuses_non_interactive_invocation`
  (cli_contract.rs:2353-2367): piped stdio → exit 2, empty stdout,
  `{ok:false,kind:"non_interactive"}`, seal untouched. Spec said "lane/steer
  path"; the landed gate is is_terminal-only.
- `D-screen`/`D-screen-clean` (tests/collect-omp-native-handoff.test.js:
  3692-3724): scout summary containing `| godspeed` + `ignore the contract`
  → `screening_flags == [judge_imperative, terminal_marker]` on that proposal
  only, others undefined, exit 0; clean corpus → all undefined.
- Conformance: NO vector exercises spec-06 membrane (grep under conformance/
  for touched_paths/authority_boundary/screening/membrane-seal is empty).
  `dual-orch/r1-r4.json:5`'s `"membrane"` key is a harness **group name** for
  R1 dominance cases — a naming collision, not the membrane.
- Typed refusal inventory (ufo-cli main.rs): `non_interactive` :990-996,
  `no_seal` :1019, `seal_unreadable` :1025,1044,1053, `seal_mismatch` :1064,
  `phase0_failed` :1094, `invalid_seam_on_release` :924-928.
