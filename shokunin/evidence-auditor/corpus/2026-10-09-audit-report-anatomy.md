# 2026-10-09 — the anatomy of an operator audit report

**Asked.** What is the shape of an operator audit report, and how do its siblings
compare? (lane `AuditReportAnatomy`, scout.)

**Observed.** `reports/` holds nine operator reports (no README, no subdirs):
`tf-audit-{band,docs,launcher,prompt,routing,tests,wall}.md`, `tf-probe-band.md`,
`tf-safety-r2.md`. Per-mission lane evidence lives **outside the repo** under
`.tower/fleets/tower1/reports/` (one subdir per mission, 18 observed) — so an
audit report is a **synthesis over an external lane corpus**, not a primary record.

`reports/tf-audit-tests.md` (274 lines, md5 `0c92d519…`) spine:

| section | lines | content |
| --- | --- | --- |
| header | 1–9 | fleet/mission/axis, subject + suite identity, worktree + scope, lane-evidence path, **revision hashes**, HEAD |
| §0 verdict + headline numbers | 10–26 | one-word verdict + a measure/value/**“verified in”** table |
| §1 method, provenance, independent verification | 28–58 | AC-source tags A/B/C, L1-reproduced commands **with observed output**, live band authority |
| §2 acceptance-criteria traceability | 60–88 | the 74-row matrix + §2.1 criteria with no implementation |
| §3 untested behaviours | 89–149 | 32 numbered items, each with code site + absence proof |
| §4 tests that re-pin incidental behaviour | 151–173 | P1–P19 verbatim assertions + why incidental |
| §5 dead/unreachable code | 178–193 | reported “so it is not counted as untested” |
| §6 adjudications, corrections, process notes | 195–218 | judge log + **corpus-stability warning** (cite anchor text, not lines; snapshot by hash) |
| §7 cheapest tests (ranked) | 220–234 | remediation, explicitly unapplied |
| §8 what this audit does not prove | 236–244 | honest-limit list |
| §9 round-2 verification log | 246–274 | per-lane verdicts + saturation decision |

Numbers: verdict **GAP** (`:12`); 74 criteria → 15 PASS (+2 elsewhere) / 24 WEAK /
33 GAP; 18 typed codes emitted, 4 asserted (`USAGE` only as exit 64); 30 symbols
(11 never entered) / 104 branch rows; mutation probe 43 mutants → 17 killed /
26 survived; round-2 = 18 lanes (3 PASS / 9 FAIL / 6 GAP), all 9 FAILs citation
defects. §2.1 lists three criteria **with no implementation** — relaunch pane+
prompt idempotence; `status` reconciling wall ↔ `fleet.json`; `close` refusing a
live pane unless `--force` — each “proven by enumeration, not by argument”.

Revision pins (`:7-8`): `sighting/tower-fleet.mjs` md5 `d365090b…`;
`test/tower-fleet.test.mjs` md5 `d6b8c8fe…`; re-derived at HEAD `8e48b75`. Both
md5s reproduce via `git show 8e48b75:<path> | md5sum`.

**Growth caveat** — the report records that a **grown** suite exists: §3.12 item
32 (`:149`) names an **unlanded** sibling rewrite `tower/tower1/tf-tests @ 24a47c5`
(1617 lines, +1344); §8 (`:243`) says the recommendations are “not known to be
un-implemented there”. Observed now: the current suite is 1685 lines (md5
`3f46ca6a…`), the launcher 1306 lines — the 294-line/≈73-assertion census and the
17/26 tally describe the `8e48b75` bytes **only**.

**Siblings.** `tf-audit-launcher.md` (475 lines): revision pin → “Verdict summary”
(6 invariants × verdict × worst severity) → §1–§7 invariant sections → what
changed vs the contract → advisory remediation order → provenance (48 lanes) →
round-2 refutation pass. `tf-audit-routing.md` (205 lines): field/value header
(**no file hash** — pins base `main` `3dee568` and per-body digests instead) →
Verdict (Claim 1 PASS / Claim 2 PASS-AT-REST-BY-LUCK) → audited surfaces (16 rows)
→ F1–F10 → round-2 verification (0 refuted, 36/36 citations) → method → re-run
recipe. All three share: revision/scope header → verdict → per-row evidence
ledger → method+provenance → adversarial round 2 → honest limits.

**Distilled rule.** A report’s evidence-bearing fields are: verdict; a measure
table where **every number names its re-verification**; a traceability ledger that
separates “no test” from “no implementation”; a typed-code/symbol/branch inventory
with death-proofs; mutation kill/survive; method+provenance with reproduced
commands **and observed output**; honest limits; an adversarial round-2 log; and a
**revision identity** (per-artifact hash + HEAD) plus a growth caveat. The honest
universal is narrower than “every audit pins its revision”: an audit that quotes
per-artifact counts must pin that artifact (routing, which counts tokens rather
than lines, pins a base commit + per-body digests).

**Changed.** Nothing — read-only research.

**Unknown.** the 40 fleet lane reports were listed, not opened; no suite run, no
mutation re-run. Lane report:
`.tower/fleets/shokunin2/reports/evidence-auditor/AuditReportAnatomy.md`.