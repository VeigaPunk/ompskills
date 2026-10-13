# 2026-10-09 — the round-receipt convention

**Asked.** What is the round-receipt convention? (lane `RoundReceiptAnatomy`,
scout.)

**Observed.** 16 receipts read in full across `.tower/fleets/*/rounds/`.

- **Location and naming.** `<stateDir>/rounds/<missionId>-r<N>.md`; `N = 1 +` the
  number of receipt files already present. The mission id is the file stem prefix
  (mission `tf-safety-r2` → `tf-safety-r2-r1.md`). The launcher’s matcher is
  `sighting/tower-fleet.mjs:951-957` (`startsWith '<id>-r' && endsWith '.md'`,
  numeric sort by `/r(\d+)\.md$/ ?? 0`). `stateDir` default `.tower/fleets/<fleet>`.
  The `rounds/` directory is **not** created by the launcher — the L1 makes it.
  Source anchor: `sighting/l1-prompt.md:139-145`.
- **Content slots** (bound by step 7, not by headings — no heading is canonical):
  identity header (fleet/mission/axis/round/worktree/branch/commit); axis set;
  plan (WWKD plan → wave plan); lane outcomes; accepted moves; rejected moves;
  verification; scope discipline; honest limits (not verified); continue/stop
  decision.
- **Field variance observed across the 16**: a WWKD plan section in 7/16; “Scope
  discipline” as its own section only in test-smith r1/r2; “Settlement”, “Band
  stability”, “Residual risks left for the operator”, “Disclosures (ambient,
  honest)”, “Deliverable state”, “Inputs from round 1”, “Sizing (step 2, honestly)”,
  a date line, and lane-budget accounting each appear in ≥1 receipt only.
- **Honest limits are the invariant, not the layout.** Every receipt separates
  observed/verified from not-verified; claims are carried as verbatim
  command + exit + output, `path:line`/symbol, a cited lane report, or an explicit
  inference/unknown — plus provenance (commit, branch, spec/payload/registry,
  report dir) and honest counts.

**Changed.** Nothing — read-only research.

**Unknown.** 27 further receipts under `tower1/`/`towerprobe/` were not opened, so
more section names may exist; the “N restarts if a receipt is lost” behavior is
reasoned from the matcher, not observed. Lane report:
`.tower/fleets/shokunin2/reports/evidence-auditor/RoundReceiptAnatomy.md`.