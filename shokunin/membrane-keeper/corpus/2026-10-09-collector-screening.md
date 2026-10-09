# collector-screening — the five classes and the config override

Asked: the screening site, each class's patterns, the config override
semantics, where flags land, whether flags are evidence-only.

Observed (wave r1-w1 lane CollectorScreening):

- Screening runs at `scripts/collect-omp-native-handoff.mjs:1076-1088` (spec
  06 cites :824 — stale). Class definitions live in
  `scripts/collect-omp-native-handoff-lib/screening.mjs`:
  `DEFAULT_SCREENING_CLASSES` (:25-31) and the known set (:33) — both are
  exactly the five classes:
  - `directive_bytes` — override patterns matching godspeed directive bytes
  - `terminal_marker` — the terminal envelope marker text
  - `judge_imperative` — text that looks like a judgment instruction
  - `assignment_header` — dispatch/assignment header shape
  - `directive_task_data` — embedded task-payload data (added after spec 06;
    spec lists four)
  (Screen regexes at screening.mjs:168-186.)
- Config override (collector :456-471): `membrane.screening.classes` present
  → must be an array of known names (non-array → die; unknown name → die,
  exit 2 — a config/collector version skew dies rather than screens less);
  absent block → defaults; **`classes: []` silently disables all screening**;
  `screening: null` throws TypeError (unhandled).
- Emit: `screening_flags` (sorted string array) on the NativeProposal wrapper
  beside `body` (:1276-1291, serialized :1742/:1754); omitted under
  `omp-native-v1` and when empty.
- Evidence-only confirmed: judge reads flags only for the v1 refusal
  (native_scores.rs:232-243), an empty-string check (:250-261), and verdict
  provenance (:460) — **no admission branch reads them**. The only
  content-reachable hard refusal in the screen path is the lone-surrogate
  die at screening.mjs:220-223.
- `screening.version` is validated by the judge (lib.rs:879-886) and **never
  read or stamped by the collector** — declared, not enforced.
- Divergences: stale spec anchor (:824); spec's singular `screening_flag` vs
  landed plural array; judge-vs-collector empty/unknown handling differs.

Confidence: high for anchors; medium for null/empty runtime behavior
(isolated node evaluation of exact expressions, not a live collector run).
