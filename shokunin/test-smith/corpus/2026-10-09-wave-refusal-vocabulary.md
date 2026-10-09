# 2026-10-09 — wave refusal vocabulary as the suite proves it

**Asked.** Which refusal codes does `test/run-wave-test.mjs` step 6 assert, how
are expectations derived, and which codes are unasserted? (Lane
`WaveRefusalVocabulary`, reviewer.)

**Observed.** Sources: `test/run-wave-test.mjs:624-1184` (step 6);
`/home/vgpnk/Projects/ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs` (read-only).

- Step 6 asserts exactly 11 typed refusal codes: `too_few_lanes`,
  `wave_too_wide`, `too_many_lanes`, `impossible_band` (band/cap matrices 6a-6b
  and the injected-policy cross-check 6g), `duplicate_expansion`,
  `role_required`, `unknown_role`, `resume_unknown_member`,
  `resume_role_forbidden`, `resume_item_forbidden`, `resume_meta_forbidden`
  (6e `refusalCases`, `:911-982`). Plus the resume-only band exemption proven
  as admissions (`{spawn:0, resume:n}`) and `too_many_lanes` past the cap (6d,
  `:819-906`).
- Envelope: every refusal is a conjunction of exit 1 + exact code + schema
  `ufo-swarm-wave-error-v1` (`SWARM_WAVE_ERROR_SCHEMA` at substrate `:144`,
  `reportError` `:1432-1455`); usage is the sole exception at exit 64
  (`:1349-1352`).
- Assertion helpers: `refusal()` (`:657-663`) and `admission()` (`:666-672`),
  both feeding `check()` (`:204-208`); evidence is written raw before judgment
  via `planCase()` (`:645-650`). `refusal()` pins neither message text nor the
  optional `details` field.
- Anti-restatement: `bandVerdict(lanes, band)` (`:631-636`) computes the
  expected code from the resolved band (cap → wave ceiling → floor precedence,
  mirroring the substrate order `impossible_band` `:990` < `too_many_lanes`
  `:995` < `too_few_lanes` `:998` < `wave_too_wide` `:1004`); the size matrix is
  built from `[floor±1, ceiling, ceiling+1, cap, cap+1]` (`:730`); the band
  authority is resolved by `resolveBand()` (`:457-522`, fixture/live) from the
  delta's 16-32 cap 100 (`host/ufo-sighting-dispatch.json`). Guards
  `negative.bandShape` (`:714`) and `negative.authorityConstants` (`:723`).
- Not asserted by the suite: `empty_wave`, `duplicate_name`,
  `duplicate_resume_id`, `spawn_message_forbidden`, `message_with_prompt`,
  `prompt_with_template`, `prompt_required`, `item_required`, the entire
  `invalid_*` family (`invalid_spec` ×23, `invalid_registry` ×14,
  `invalid_policy`, `invalid_assignments`, `invalid_report_dir`,
  `invalid_registry_path`, `invalid_resume_id`, `invalid_name`,
  `invalid_agent_id`), `unknown_member`, `conflicting_assignment`,
  `wave_registry_collision`, `registry_lock_timeout`, `registry_lock_unsafe`,
  `usage`, `internal`. (`invalid_report_dir` appears only as a comment at
  `:541`; the suite asserts its own local check via `spec.reportDir`
  `:542-545`.)
- Section lettering is 6a, 6b, 6d, 6e, 6f, 6g — there is no 6c.

**Changed.** Nothing — read-only research.

**Unknown.** The suite was read, not run; the substrate was read-only and
untouched. Runtime check-message values were not observed.
