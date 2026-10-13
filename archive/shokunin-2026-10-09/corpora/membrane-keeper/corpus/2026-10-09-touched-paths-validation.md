# touched-paths-validation — declared fields, freeze rules, distiller binding

Asked: the end-to-end shape of `touched_paths`/`candidate_writes`; which field
the membrane screens when declared and actual writes diverge.

Observed (wave r1-w1 lane TouchedPathsValidation):

- Headline: the membrane screens **only declared fields** — the union of
  `touched_paths` and `candidate_writes[].path`. No runtime site compares
  declared paths with actual writes; a proposal declaring `[A]` while the
  runner writes `B` never surfaces `B` to the screen.
- Screen inputs: native native.rs:311-329 (`touched_paths.chain(write_paths)`);
  fixture loop_driver_judge.rs:415-448 (BTreeSet union). `write_paths`
  projection: native_scores.rs:377-383 (native), judge.rs:464-477
  (`AdmittedProposal::of`, fixture).
- Fields: `touched_paths` proposal.rs:29-35 (`Option<Vec<String>>`, serde
  default + skip_if none) — populated fixture_spawn.rs:577-578,
  native_scores.rs:377; asserted by shape + dedupe only, never against writes.
  `candidate_writes` proposal.rs:42-48 (`Option<Vec<CandidateWrite>>`); axes.rs
  :219-226 `CandidateWrite{path, content_base64}`; populated
  fixture_spawn.rs:588-594, native_scores.rs:378-383; validated
  proposal.rs:131-175; applied to scratch only (axis_checks.rs:176-195).
- Freeze: `first_nonempty_additive_field` (proposal.rs:232-249;
  native_scores.rs:232-243) — non-empty touched_paths/candidate_writes/
  screening_flags rejected under `omp-native-v1`; `Some(vec![])` passes the
  freeze and is serialized.
- Distiller `local_key` (distill.rs:299-342): length-prefixed segments —
  `\0` ids, `\1` touched paths, `\2` write identity `(path, sha256 of declared
  base64)`; all sorted+deduped (normalized_list :290-297, :346-367); dedupe
  keeps first (:370-379). Pins: distill_tests.rs:1600-1638 (path order binds
  not sequence), :221-263 (write-byte identity).
- Divergences: native.rs:200-202/:311-313 comments say "touched_paths
  intersect" — code unions candidate_writes (state.rs:63-64 documents the
  union); spec 06 (:117-122) names only touched_paths; spec 06's emission
  anchor config.rs:205 is a budgets line (real const :226).
- [INFERENCE] dedupe shadowing: normalized_list dedups touched_paths, so
  `['a','a']` shares a key with `['a']` — not pinned by any test.
