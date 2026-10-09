# 2026-10-09 — adversarial audit of the shokunin fleet's own receipts

**Asked.** Cross-check every shokunin-fleet round receipt’s claimed lane counts
against the artifacts actually on disk, and rank the receipts by how well their
claims are backed. (lane `HonestyClaimsAudit`, sentinel.)

**Observed.** Read-only over `.tower/fleets/{shokunin,tower1-safety-r2}/rounds/`
(15 receipts), `reports/<mission>/`, `waves/`, and worktree git objects —
evidence taxonomy: 15 receipts, 11 reports dirs, 13 registries (397 rows),
50 wave artifacts, 8 corpora, 13 commit claims fired, 9 receipt-cited numbers
re-derived.

**Headline.** Lane-count claims are **15/15 fully artifact-backed** — every
registry has `claimed spawn == members == .md reports == spec items == payload
tasks`, 0 null handles, 0 orphan reports (and `agentId === name` with 0 resume
rows across all 13 shokunin registries). **The failures are second-order
numbers:**

- `fleet-warden-r2` “SpecSchemaClaimVerification (101 live runs)” — **HIGH**: no
  “101” appears in that report, which explicitly says the runs used a **copy** of
  the launcher (contradicting “live”); resembles a “31 live runs” elsewhere.
- `fleet-warden-r2` “167 citations, 4 mismatches” — **MEDIUM**: the report’s own
  verdict table re-sums to 157 / 5.
- `host-smith r1` / `r2` role censuses contradicted by their own registries
  (22≠26, 17≠16).
- `wave-smith-r2`: “4 entries fully clean” names five; “index + 30 entries”
  undercounts its committed corpus (31).
- `skill-scribe-r1`: lane table lists 23 of 24 real lanes (one registry row + file
  exist, omitted from the table).
- `mission-keeper-r1`: an evidence name points at a plan artifact not on disk
  (cosmetic); `wall-watcher-r2`’s “18/20” and “36 clusters” are not re-derivable
  from the cited reports; `test-smith-r2`’s third-lane timing unprinted.

**Positive falsifications (claims that survived re-derivation).**
`skill-scribe-r2`’s AxisEvidenceScribe 242/11/43 marker tally re-derived
**exactly** over the 24 cited reports; `wave-smith-r2`’s NoInventionSweep walk
line (35 files / 1115 rows / 11 all-null / 24 with handles) appears verbatim in
the report (current walk 48/1457/14/34 — growth disclosed, 0 resume rows still
true); **11/11** spot-fired commit/blob/line-count claims byte-exact (29 files
+1818, 209-line card, blobs `78b33fc2`/`29cf0822`, +1170, +672, +1414);
`test-smith-r1`’s “every report ≥ 500 bytes” verified (min 6105 B).
`fleet-warden-r1` lists 8 codes under “six typed codes”; `wave-smith-r1`’s
“26 codes” and registry absolutes were refuted by its own r2 rejection table —
**self-correcting lineage, with the stale numbers persisting in `rounds/`.**

**Honest limits — all 15 disclose them.** Strongest: `mission-keeper-r2` (N=4 <
`waveMin` executed directly, “no lane manufactured to reach a floor”);
`wall-watcher-r1` (a mutating-substrate violation **self-reported** with a
corrective command and an unrepaired residual); `host-smith-r2` (ambient
`NODE_COMPILE_CACHE` + omp-unpack write/restore); `route-auditor-r1` (inference
kept as inference).

**Ranking (best → weakest).** mission-keeper-r1/r2 > skill-scribe-r2 >
test-smith-r1/r2 > wall-watcher-r1 > route-auditor-r1 > skill-scribe-r1 >
wall-watcher-r2 > fleet-warden-r2 > wave-smith-r2 > fleet-warden-r1 > host-smith-r1
> host-smith-r2 > wave-smith-r1 (stale-claim penalty).

**Distilled lesson for the corpus.** The first-order honesty claim (the count) was
backed everywhere; what drifts is the **second-order number** — a census, a tally,
a “fully clean” count — the exact class a round receipt’s own registry can refute.
And a superseded number left in `rounds/` is not corrected by a later round’s
rejection table: the stale text persists in the artifact.

**Changed.** Nothing — read-only research.

**Unknown.** One-shot batched dispatch, suite runs, and card-dispatch sessions
were not observed (artifact proxies checked only); `git diff` contents beyond
shortstat/rev-parse/ls-tree were not read; substrate source-line claims were out
of scope. Lane report:
`.tower/fleets/shokunin2/reports/evidence-auditor/HonestyClaimsAudit.md`.