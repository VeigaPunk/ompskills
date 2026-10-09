# ParetoGate — the strict admission rule and its verdicts

**Asked:** the operative admission rule in `gate.rs`.
**Source:** `/home/vgpnk/Projects/ufo-fsd-alpha/crates/ufo-core-runtime/src/gate.rs` (203 lines);
`loop_driver_judge.rs`; `axis_checks.rs`.

## Observed

- Doc comment, verbatim (L39-L42): `/// Strict Pareto gate: admit iff ≥1 axis improves and none regress
  (paper R1).` plus `/// Missing declared keys are malformed, not aliased to the baseline. A scalar /
  confidence field is structurally absent from decide.`
- `pub fn decide(&self, baseline: &ScoreVector, candidate: &ScoreVector) -> GateDecision` (L70-L78).
  `GateDecision` is an internally-tagged enum (`verdict`, snake_case; L13-L37): `Admit` (L16-18),
  `RejectRegression` (L19-21), `RejectNoImprovement` (L22), `RejectMalformed` (L23-26),
  `RejectInsufficientEvidence` (L27-36).
- `verdict()` (L153-162): **regressions checked first** — non-empty `regressed` ⇒ `RejectRegression`, even
  alongside improvements; else empty `improved` ⇒ `RejectNoImprovement`; else `Admit`. Malformed /
  non-finite delta ⇒ `RejectMalformed`; never `Admit` on malformed.
- **`RejectInsufficientEvidence` is never produced by `ParetoGate::decide`** (explicit at L32). The caller
  (`loop_driver_judge.rs:352-361`) constructs it from
  `axis_checks::CandidateMeasurement::unmeasured_material`, **downgrading an otherwise-Admit** when a
  material axis is UNKNOWN — "a baseline placeholder is never proof of non-regression".
- Mapping to filter.md: `improves_at_least_one_axis` ↔ `improved.len() >= 1` (L161 Admit);
  `harms_no_axis` ↔ `regressed.is_empty()` (L156). Same rule. The bridge note (filter.md:62) confirms a
  single-axis improvement with no regression passes. No symbol-level linkage: filter.md never names
  `ParetoGate`, it references the file path only.
- Provenance caveat (L1-L6 module header): SRC-PARTIAL — a local paper-parity port; the upstream tip
  (`VeigaPunk/ufo-core-runtime@05297518`) has not published the `.rs`; not OAuth live, not invented bytes.

## Unknown

`AxisSet::delta` sign convention (d>0 = improves) is defined outside `gate.rs`;
`loop_driver_judge.rs`'s construction site of `RejectInsufficientEvidence` not opened (peer-verified
separately, L352-361).

## Tooling note

Non-raw read line labels appeared offset vs `grep -n` physical numbering on `gate.rs`; reported to
`xd://report_issue`. All anchors here use `grep -n`.