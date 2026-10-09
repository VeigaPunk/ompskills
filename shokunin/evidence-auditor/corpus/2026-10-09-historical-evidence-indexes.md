# 2026-10-09 — per-tree historical-evidence index conventions

**Asked.** What convention do the `evidence/*/INDEX.md` per-file bullet lists
follow? (lane `HistoricalEvidenceIndexes`, connector. Companion to
`2026-10-09-substrate-evidence-index.md`, which covers `docs/EVIDENCE-INDEX.md`.)

**Observed.** Read whole: `evidence/nightcall-swarm-evidence/INDEX.md`,
`evidence/nc2-evidence/INDEX.md`, `evidence/nightcall-integration/INDEX.md`,
`evidence/README.md` (substrate HEAD `5ace2559`, clean).

- **Count headings.** `## Files (N)` counts artifacts **excluding INDEX.md**
  (measured: 13+1 and 2+1 entries).
- **Two bullet registers.** (a) *Founding-record bullets* mirror the JSON’s real
  top-level fields — e.g. `verification.json` (`nse-verification-v1`, runId
  `gq90e974a72fa3394f`), `r01-verification.json` (`nc2-evidence-r01-v1`, runId
  `gq7545f92e63f7d1d4`), `v3r01-integration.json`
  (`nc2-evidence-integration-v1`, runId `gq1ec257dcbc50c48b`, HEAD `a0e40d7e`) —
  all exact field matches (`runId` pattern `gq`+16hex; sessionId
  `omp-<runId>`). (b) *Round-artifact bullets* (r03–r11) cite iteration position
  (`rNN iteration-N/8`) plus payload counts, even though all 12 files carry
  `nightcall-swarm-evidence-rNN-v1` schemas. **The bullet never asserts an
  identifier the artifact lacks**, and not every present identifier is cited.
- **Standing rule**, verbatim in all three: *“read-only historical evidence — do
  not regenerate, re-run, or treat their claims as current state”*, wrapped in a
  fixed paragraph (since-deleted-surface enumeration; *“capture-time records, not
  live state”*; a closer *“Counts and shapes below were verified against the live
  tree during the nc3-docs rNN sweep”* where rNN matches the title).
- **Banner convention** (five layers, identical across trees): title with authoring
  date + sweep id; a **byte-identical** blockquote at L4-7
  (`*2026-09-24 (nc5-docs r43, isolation distinction):*` routing fleet proof to
  the isolated clone + `bash scripts/gates.sh`); a bold `**Historical snapshot
  (2026-09-21).**` opener; mission/capture-window; verified-closer. The footnote is
  a **rotating pin**, not static text (`01e616db` “r42→r43 footnote rotation”;
  dated annotations layer, never rewrite).
- **`nightcall-integration/INDEX.md` divergence**: a 112-entry tree replaces the
  flat per-file list with `Layout:` arithmetic (22 subdirs + 90 files = 112),
  `## Generations` (5 fleet-generation buckets), and `## Top-level files (90)`
  class buckets (Receipt audits 28 / Wave control 13+10+2 / Main probes / Fleet
  state 6); no schema strings — provenance travels in filename patterns; the rule
  sentence is ordered after the class + deleted-surface enumeration; scope widened
  from “these JSONs” to “JSON/TXT artifact classes” with globs; no capture window;
  sweep r15 vs r17.

**Fidelity recheck (at HEAD).** All 21 existing subdir file counts exact
(17/17/17/17, 16/12/14, 20/18/6/1, 9/17×7, 19/31); class counts 28/13/10/2/6;
pairing files; **total 112 ✅**. **Divergence**: the claimed 22nd subdir
`nc2-verify-r1/` (“empty directory”) is **absent** — zero git tree entries, zero
log commits; measured 21 dirs + 91 files (INDEX.md tracked). Git cannot persist
empty dirs, so the Layout decomposition counts a **working-tree-only container**
while the `22+90 = 21+91 = 112` identity **masks the ±1 swap in both terms**.

**Distilled trap.** In a historical index, **totals can stay true while
decomposition terms drift** — re-verify the terms, not just the sum.

**Changed.** Nothing — read-only research.

**Unknown.** No command executed beyond reads/`ls`/`git ls-files`; the substrate’s
own nc9-evidence r01–r09 honesty-repair/restamp series continuously fixes this
index class (plus nc7-evidence stale-claim repairs) — noted, not run. Lane report:
`.tower/fleets/shokunin2/reports/evidence-auditor/HistoricalEvidenceIndexes.md`.