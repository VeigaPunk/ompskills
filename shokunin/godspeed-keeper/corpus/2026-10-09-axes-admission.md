# Axes and admission — how an L1 applies the Pareto rule

**Asked:** how an L1 applies the axes/Pareto admission rule, and where its wording is thinner than the
sources.
**Source:** `sighting/l1-prompt.md` step 6; `shokunin/mission-keeper/corpus/2026-10-09-pareto-judgment.md`;
`run-logic.md`; `axes.rs`; `axis_checks.rs`; `loop_driver_judge.rs`.

## Observed

- **The axis set is the sole measuring stick** (l1-prompt.md:62-64): "dynamic, externally visible, stable
  within the round, free to evolve between rounds. Never freeze one axis set for the whole mission." Fleet
  path = declared per round by the L1 (run-logic:253-256); native path = `config.axes` frozen at launch.
  Contract teeth (`axes.rs:81-83`): **"unmeasurable axes are not axes"**. Kinds: Executable `{check,
  material(default true), tolerance(default 0)}`, Evidence (native-only, fail-closed), Subjective
  (symmetric argument; one-sided claims "dropped to baseline and flagged", :90-119); deltas are
  direction-aware (Max/Min, :56-60) with an optional deadband. Example declared set `config/ufo.json:253-258`
  (correctness, safety, legibility, coverage).
- **"An unmeasured claim is unknown, never an accept"** requires a per-axis observation actually measured,
  recorded as provenance (run-logic:981-982). Unknown fails closed via four mechanically distinct paths:
  R3a missing/undeclared/non-finite score → `RejectMalformed` ("a missing or undeclared axis is not
  'unchanged'"); R3b UNKNOWN on a blocking axis → `RejectInsufficientEvidence`, caller-constructed only,
  **downgrading an otherwise-Admit** (`loop_driver_judge.rs:352-361`); R3c UNKNOWN clamps to a 0.0 delta
  ("never regression cover and never a phantom gain", `axis_checks.rs:12-16,365-366`) → `RejectNoImprovement`;
  R3d subjective one-sided claim clamped+flagged. Blocking set is broader than `material:true`: every
  evidence axis and non-finite computed deltas also block (`axis_checks.rs:370-374`).
- **Accept/reject test** (`gate.rs:155-163`): regressed non-empty → `RejectRegression` (first); improved
  empty → `RejectNoImprovement`; else `Admit{improved}`. filter.md:36-38 pseudocode; **trap:** filter.md:48
  prose contradicts its own pseudocode — the bridge note (:62) rules single-axis-no-regression passes. The
  card must quote prose+bridge note together.
- **Re-score after every accept** (l1-prompt.md:131). Corrected mid-flight: the runtime counterpart
  `judge_wave` reports ONE composite move via bare `gate.decide(baseline,next)`
  (`loop_driver_judge.rs:115-123`, frontier advance :351,352,386 with `effective = baseline + own deltas`
  :299-314), so two proposals improving different axes cannot both admit in one wave; the fleet L1's
  physical re-score on the post-accept tree DOES admit both (orthogonal mover inherits through the tree).
  "Frozen contract" ≠ "static verdict reference".
- **Out-of-scope rejection** (l1-prompt.md:129-130) is **pre-gate admission**, not a `GateDecision` (no
  scope variant exists). Runtime analogs: declared `candidate_writes`-only scratch materialization
  (`axes.rs:91-92`), write-escape degrading to UNKNOWN (`axis_checks.rs:12-13`). Do not conflate with the
  membrane `authority_boundary` (`config/ufo.json:24`), a different class.

## Unknown

Empirical multi-accept fleet round still unrecorded; the pre-gate `RejectMalformed` entries for undeclared
subjective axes / empty vectors (`loop_driver_judge.rs:223-253`) not opened.