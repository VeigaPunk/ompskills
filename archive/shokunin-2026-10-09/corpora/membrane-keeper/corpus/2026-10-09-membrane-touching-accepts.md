# membrane-touching-accepts — the screen and its call chain

Asked: exactly which paths `membrane_touching_accepts` screens; the projection;
how the result reaches `loop_stop`/`membrane_accepts`.

Observed (wave r1-w1 lane TouchingAccepts):

- `loop_driver_judge.rs:415-448` `membrane_touching_accepts`: builds a BTreeSet
  union of `touched_paths` + `candidate_writes[].path` (`write_paths`), screens
  each against every `membrane.paths` pattern via `membrane_path_matches`;
  `None` config → empty (:419-421). Admit-only: called after the proposal
  verdict admits (loop_driver_dry.rs:385-386); its hit overrides `loop_stop`
  to `AuthorityBoundary` (dry.rs:463-465).
- Projection `AdmittedProposal` (judge.rs:454-459, builder :464-477) carries
  `proposal_id`, `touched_paths`, `write_paths`, bare-hex digest
  (record_verdict/proposal_digest, round_digest.rs:189-197); the
  `MembraneAccept` adds `sha256:` prefix (:443). `MembraneAccept` fields:
  `{proposal_id, digest, touched_paths}` where touched_paths is the sorted
  union (state.rs:60-71).
- Fixture call chain: `self-iter` main.rs:488 → run_dry_until_halt dry.rs:943
  → run_epoch_from resume.rs:567 → run_dry_iteration_vs dry.rs:69 (seal check
  :86) → judge_wave → ldc_judge_wave_apply_proposal_verdict :364-393 →
  dry.rs:385-386 → dry.rs:463-465 override → persist → seal write :703-705.
- Native path: `judge_handoff` native.rs:424 → :316-345 screens
  **survivor_seats only** (`native.rs:318`) using `config/ufo.json` via
  `validate_native_membrane` (lib.rs:979); sets `loop_stop` :343-345; writes
  no seal inside crates/.
- Divergences: dry reads `config/orchestration.json`, native reads
  `config/ufo.json` — on the substrate the dry path is inert (file absent);
  dry screens all admitted proposals, native screens survivors only; the
  `digest` field differs between producers; spec 06 :117-122 says
  `touched_paths` only.

Confidence: high (direct reads). Unknowns: whether `native_digests.rs:37`
persists `membrane_accepts`; seal-write failure window is inference.
