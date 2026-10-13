# membrane-mirror — the fixture loop's membrane surface

Asked: what the fixture loop's membrane honours versus the `config/ufo.json` membrane note, and what the membrane drills assert.
Anchor: `ufo-fsd-alpha@5ace2559` (read-only); `config/ufo.json` cited from the working copy (sha256 `0e416f0a…`, uncommitted swarm-band edit only). Lane: `MembraneMirror`. Signing flow is out of scope (membrane-keeper owns it).

## Observed
- Fixture shape `MembraneConfig { paths: Vec<String>, action: String }`, `deny_unknown_fields` (`config.rs:217-222`): honours `paths`+`action` only; `note`/`screening` refused. Read only from `config/orchestration.json` (`loop_driver.rs:506-507`) — absent, so **the fixture-loop membrane is inert on this tree**.
- The native parser (`lib.rs:840-851`) reads config/ufo.json and accepts `note`/`screening`: two parsers disagree on the same block.
- "the canonical path list below is single-sourced here" is **false for the fixture path**: only the matcher (`proposal.rs:354`) is shared; a fixture config must hand-copy the list and nothing checks agreement.
- Intersection: `loop_driver_judge.rs:415-448` (fixture) and `native.rs:317-329` (native), both over `touched_paths` + candidate write paths; boundary override `loop_driver_dry.rs:463-465`.
- `d-membrane` (cargo-test, `crates/ufo-core-runtime/tests/loop_driver.rs:963-1022`) writes a membrane into a **tempdir** `config/orchestration.json` (not a drill shadow — cargo-test forbids `setup`); asserts AuthorityBoundary, one `membrane_accept`, seal fields, checkpoint stop_reason, refusal text naming `ufo charter sign <run_id>`.
- `d-membrane-negative` (`:1024-1043`): proposal outside the configured paths → Saturated, no seal. It does not test the canonical list (which covers `crates/ufo-core-runtime/**`).

## Drift
- Spec 06 landed-status anchors stale (`config.rs:205` is now `BudgetsConfig::validate`; charter sign moved).
