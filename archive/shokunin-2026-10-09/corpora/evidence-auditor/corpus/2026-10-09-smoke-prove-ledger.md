# 2026-10-09 — the smoke doc's prove / not-prove ledger

**Asked.** What does `test/sighting-wave-smoke.md` prove, not prove, and what
rules does it carry? (lane `SmokeProveLedger`, scribe.)

**Observed.** `test/sighting-wave-smoke.md` (652 lines; last touched
`d0839914`, 2026-10-08) is “the live half, step by step, including the one step no
script may take”. The three artifacts of one test: `test/run-wave-test.mjs`
(automated dry half), `test/tower-fleet.test.mjs` (launcher dry half, fixtures
only), and this doc.

- **Band-authority table** (`:24-49`): one source `host/ufo-sighting-dispatch.json`
  merged into `<ufoRoot>/config/ufo.json` by `node host/apply.mjs --apply`;
  post-apply `waveMinLanes 16`, `waveMaxLanes 32`, `maxLanes 100`,
  `maxConcurrentL1 16`, `windowPaneCeiling 16`, `l1Alias m_strong`. Measurement
  rule: measure from the merged config, never the table; pre-apply a `--band live`
  run refuses `apply_not_landed` (exit 1) rather than test the wrong band.
- **“What this test proves”** (`:51-69`), 6 items: the band edges are real
  (16/32 admit; 15 `too_few_lanes`, 33 `wave_too_wide`, 101 `too_many_lanes`);
  the payload is one batched call whose lanes each carry a role, no per-lane
  `model`, and Godspeed invoked; `tower-fleet.mjs plan` reads every band number
  live and writes nothing; the wall opens/reads/closes; lane reports are
  collectable into `ufo-mission-result-v1`.
- **Steps 0–8** incl. 1b (wave visibility as the parent’s L2 counter) and 1c (the
  tower-fleet launch). Step 5 is *“the step no script takes”* — exactly one
  batched `task` call with the payload’s `context` + `tasks` verbatim.
- **Negative-assertion table** (`:570-601`), 15 rows, all checked by
  `run-wave-test.mjs` against the real planner: band edges, resume-only
  floor-exemption, no Godspeed on a resume message, `singleFamily`
  concentration, `duplicate_expansion`, `role_required`, `unknown_role`,
  `resume_unknown_member`, `resume_role_forbidden`, `impossible_band`.
- **Failure/honesty rules** (`:603-617`): a refusal is a reason to fix the spec
  or execute directly — never to bypass validation or split one wave; *“Report
  only observed results. If the wall says `opaque`, the reports are 13/16, or a
  lane timed out, that is the finding.”*; the wave is advisory to one L1; never
  hardcode a provider/model/credential; a launcher failure is data too
  (`LAUNCH_PARTIAL`, a `not-on-wall` row, a reused-worktree warning go in the
  record verbatim). Honest-closing rules (`:555-568`): complete only after step
  6/7 evidence; the note states what was observed, never a round number you did
  not count; a failed/partial wave is a result, not a silent retry.

**“What it does not prove”** (`:71-128`), 10 distinct claims: swarm lanes are not
wall missions (a wave appears only as the parent’s L2 counter; `levels.l2 null` +
`levelDetails.l2.status "opaque"` = UNKNOWN); pane capacity; `complete` kills the
pane; the Godspeed hook is project-scoped; a launched pane is not a working fleet;
plus six tower-fleet-side claims.

**Cross-check (this lane).** The band-table header attributes all six rows to
`host/ufo-sighting-dispatch.json`, but that file (186 B) carries only five keys
and omits `windowPaneCeiling`; the merged `config/ufo.json` carries
`windowPaneCeiling: 16` (`:71`). The table matches the merged band while the
declared single source does not supply every row — recorded verbatim, not judged.
Also: `.omp/hooks/pre/ufo-godspeed-inject.js` is absent from this repo but present
in the read-only substrate (3819 B), consistent with the project-scoped claim.

**Changed.** Nothing — read-only research.

**Unknown.** No test/apply/wall/launcher was executed — every exit code and value
is quoted from the doc. Lane report:
`.tower/fleets/shokunin2/reports/evidence-auditor/SmokeProveLedger.md`.