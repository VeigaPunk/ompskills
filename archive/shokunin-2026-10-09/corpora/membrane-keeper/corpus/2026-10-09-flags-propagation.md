# flags-propagation — screening_flags end-to-end and membrane_signoff

Asked: how `screening_flags` propagate collector → judge → verdict; where
`membrane_signoff` telemetry is emitted and consumed.

Observed (wave r1-w1 lane FlagsPropagation):

- Definitions: `NativeSeatContribution.screening_flags` (lib.rs:578, no skip
  attr); `NativeProposal` wrapper (lib.rs:694, serde default + skip_if none,
  deny_unknown_fields); `ValidatedProposal` (native.rs:603);
  `NativeRoundHandoff.proposals` (native_schema.rs:440).
- Judge path: native_scores.rs:232-261 (v1 refusal + non-empty check), :99-125
  (carry), :384 (tuple return), :460 (contribution copy);
  proposal.rs:232-249 (`first_nonempty_additive_field`); native.rs:377-378
  and :519 (verdict + digest handoff).
- **Non-influence, confirmed by absence**: dedup fingerprint excludes flags
  (native_scores.rs:319-325); admission reason ignores them (:474-505);
  `membrane_accepts` reads touched_paths/write_paths only (native.rs:316-345);
  round digest drops them (native_plan_digest.rs:546-585). Flags are surfaced,
  never deciding.
- `membrane_signoff`: written ONCE by the TTY-only `charter_sign` into
  `.ufo/charter/<run_id>.json` (main.rs:989-1109, artifact :1071-1084) —
  **no reader exists**. Spec 06 promised typed telemetry
  `{run_id, accepts, operator_ts}`; landed is an artifact
  `{kind:"ufo-charter-sign-v1", run_id, sealed_accepts, operator_ts, phase0,
  membrane_signoff}`.
- Collector side: screening.mjs:25-33 (defaults), :649 (screenArtifactTexts);
  collector :413-471 (config override), :1076-1088 (screen), :1288-1290
  (wrapper emit, omitted under v1).
- Seal sites (cross-referenced): publish.rs:27-45 (path + kind), :94-108
  (writer), :113-148 (refuse reader — `is_file`, no kind check);
  loop_driver_dry.rs:703-705 (verdict-side write);
  run-omp-native-trial.mjs:4151-4160 (JS second writer).

Confidence: high for direct reads; medium for no-consumer negatives
(literal-text grep, no LSP). Unknown: whether `ufo-mission-result.mjs` echoes
contributions anywhere.
