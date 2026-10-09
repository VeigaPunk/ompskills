# config-validation — MembraneConfig and the two validators

Asked: MembraneConfig struct, serde behavior, validation messages and order,
where OrchestrationConfig::validate is called.

Observed (wave r1-w1 lane ConfigValidate):

- Struct (config.rs:217-222): `MembraneConfig { paths: Vec<String>, action:
  String }`, `#[serde(deny_unknown_fields)]`, both fields required. Parent
  `OrchestrationConfig` (config.rs:308) is also deny_unknown_fields. The
  `membrane` field (config.rs:333-334) is `#[serde(default,
  skip_serializing_if = "Option::is_none")]`; `Default` sets `None` (:353).
- `ACTION_AUTHORITY_BOUNDARY` const at config.rs:226; twin
  `BudgetsConfig::ACTION_HONESTY_BRAKE` at :190.
- `validate` (config.rs:232-253), order: action → per-path shape → non-empty.
  Messages: `membrane.action must be 'authority_boundary' (got '<action>')`;
  `membrane.paths entry {reason}` (via `validate_repo_relative_path`,
  proposal.rs:79); `membrane.paths must be non-empty when the membrane block
  is present`. Note: `touched_paths` gets a duplicate check that
  `membrane.paths` does not.
- Pins: config_tests.rs:354-416 (absent-not-serialized, valid parses, `notify`
  refused, `''`/`/abs`/`a/../b`/`a\b` refused, bogus key fails) and
  config_tests.rs:453-474 (present-but-empty paths refused).
- Call sites for `OrchestrationConfig::validate`: `load_config`
  loop_driver.rs:506-516 (absent file → default **without** validate → silent
  fail-open to no enforcement), `load_config_with_overlays` :520-528,
  `LoopDriver::open` → `validate_local_roster` (loop_driver_open.rs:71-72,
  253-254), dry round (:86-87), resume (resume.rs:253-254).
- Native surface is a DIFFERENT validator: `validate_native_membrane`
  (lib.rs:840-908, called :979) accepts keys `{note,paths,action,screening}`
  — wider than the fixture `MembraneConfig`. Messages differ per validator
  (D1-D3: action quoting, empty-list text, path prefix format).
- D4 [INFERENCE]: verbatim-copying the canonical block (with `note` +
  `screening`) into `config/orchestration.json` would fail the fixture parse —
  the "same names, separate surface" holds for exactly `{paths,action}`.

Confidence: high for source anchors; medium for D4 and null-as-absent
(serde inference, not executed).
