# 2026-10-09 — the mutation probe and what it says about the suite

**Asked.** How was the mutation probe run, what are the kill/survival numbers
and survivor categories, and does the grown suite now kill one recorded
survivor? (Lane `MutationProbe`, mutation-tester.)

**Observed.** Sources: `reports/tf-audit-tests.md` (274 lines, md5
`0c92d519…`) §3 and §5; the probe record
`.tower/fleets/tower1/reports/tf-audit-tests/r1-pin-refusals.md` (290 lines,
md5 `1bfe3a20…`) §3 + §5 (lines 178-193 = mutant rows); current
`test/tower-fleet.test.mjs` (1685 lines, 37 sections, md5 `3f46ca6a…`);
current `sighting/tower-fleet.mjs` (md5 `198b2b59…`).

- Probe shape: a single-line launcher mutant + a full suite run per mutant,
  against isolated `/tmp` copies (`/tmp/tf-audit-tests/AuditPinRefusals/mut-*`),
  driven by `mutate.mjs` over 6 spec files; the repo and substrate were never
  written, so no in-place revert was needed.
- Baseline: `ALL CHECKS PASS`, exit 0, 239 ms median over 9 runs.
- Counts: 43 mutants (launcher) + 1 test-refactor → **17 killed / 26 survived**
  (verbatim: "mutants: 43 survivors: 26 killed: 17"). All 6 unique killers were
  retained. Trust anchors: audit-time md5s test `d6b8c8fe…`, launcher
  `d365090b…`; band read live 16/16/16/32, `l1Alias m_strong`.
- Survivor categories: (a) redundant-cluster tail never exercised
  (fleet-unanchored-end, fleet-length-cap-200, fleet-hyphen-illegal,
  fleet-lead-underscore-legal, fleet-nocaps — `T:259` killed 0 of 43);
  (b) one-sided pairs, refusal pinned but acceptance missing
  (l1-ceiling-offbyone-strict, guard-unconditional, scope-identical-legal,
  scope-first-mission-pairs-only, scope-overlap-direction-sensitive,
  id-mangling); (c) multi-site/disjunction pins (abs-scope-site-removed,
  empty-part-rule-removed, scope-second-clause-dead — dead `impl:169`);
  (d) unasserted refusal classes and message/payload granularity
  (pane/maxtime/roundceiling-check-removed, dotdot-scope-check-removed,
  tilde-scope-legal, fleet-check-trims-input, typed-message-blanked,
  usage-no-typed-payload; plus the audit extras mut-model and
  omp-worktree-clear re-add).
- Discriminating power: 26/43 (60%) mutations invisible; 18 of 32
  refusal-slice assertions are decided by 2 emitter lines; "covered" means
  "touched" (`T:259`/`260` are one branch); dead-code survivors are reachability
  findings.
- Re-derivation (static, read-only): the survivor `l1-ceiling-offbyone-strict`
  (`>` → `>=` at the L1 gate) — the current 37-section suite **would kill it**:
  launcher `:337` `if (missions.length > authority.maxConcurrentL1)`; test §4
  `:336` comment "The gate is `>` not `>=`"; `:337` plans exactly
  `missionsOf(BAND.maxConcurrentL1)` = 16; `:338` checks `at-ceiling plan exit
  0`; the mutant fires `L1_CEILING_EXCEEDED` at 16 → exit 2 → `:338` fails →
  suite exit 1. Strength: static read-based [INFERENCE], not executed.

**Changed.** Nothing — read-only research; no mutation was performed and all
consulted bytes are unchanged.

**Unknown.** The current suite was not run and the launcher was not mutated
(§5 is static); the 17/26 tally is transcribed, not re-measured; the other 25
survivors were not re-derived against the grown suite.
