# 2026-10-09 — probe-report anatomy: measured versus restated

**Asked.** What does a probe report record, and how does it separate a measured
value from a restated one? (lane `ProbeReportAnatomy`, scout.)

**Observed.** Model: `reports/tf-probe-band.md`. Fixed blocks, in order: scope
statement (“Read-only mission: the only file written in the repo is this one.”);
headline (the strongest **falsified** claim, stated false-as-steady-state with the
reason it is still true right now); §1 Method (axes declared before dispatch, WWKD
plan, the wave, the exact planner command **with its env**, the planner reply, the
wave-dispatch receipt); evidence-pin table (per-artifact sha256 prefix + worktree +
base commit + mid-mission sibling commits); §2 flap timeline (time Z | observation
| evidence artifact); §2a cause attribution + corroboration limits; §3 findings
with **two verdict columns**; §4 adjudication (lane vs L1); §5 proven / not-proven
+ hazard; §6 reproduce (pin the authority first). The round receipt
`.tower/fleets/towerprobe/rounds/tf-probe-band-r1.md` adds a per-lane outcome
table, a `Rejected / not admitted` list, and an **`Evidence provenance`** paragraph
splitting lane evidence from L1 evidence.

**Devices that keep measured ≠ restated** (all observed):

1. **Two verdict columns** — `verdict as measured` ≠ `status @01:35–01:36Z`;
   points 3/4/7/12 read FAIL as measured and PASS after recovery. The measured
   value is never overwritten.
2. **Every live claim carries a sha256 and a time window** — “Any ‘the live
   authority carries X’ claim is only meaningful with a sha256 and a time window.”
3. **A printed value is not a measurement** — `band.live`/`band.authority`/
   `band.fixture` are “always-pass printouts (recorded `ok` even while the live
   config read 32/100)”; `plan.floorBoundary` “is a tautology under the `--lanes`
   arg gate”.
4. **The authority in force beats the expectation** — lane 9’s 16–32 expectation
   “came from the task text, and the file’s live content is the authority”.
5. **Refusing to quote an unobserved line** — lane 6 “correctly refused to quote a
   `policy.waveMaxLanes 32` line from a post-rollback run and said so instead”.
6. **Historical values labelled** (“pre-apply”); **raw shapes corrected vs tasking**
   (“Refusal JSON goes to **stderr** with exit 1 … the tasking text said stdout”);
   a **falsifier per finding**; **one-variable isolation** (a `/tmp` config
   differing *only* in `waveMaxLanes 100→32` → exit 1 `wave_too_wide`);
   **byte arithmetic as closure** (`100→32` is −1 byte, `12000→11999`, zero
   non-band drift); the same-nanosecond `.bak`/live mtime pair as the
   apply-vs-hand-edit signature.

**Residual risk in `reports/tf-safety-r2.md`** is distributed, not one section:
the verdict table names the unprovable leg (`tty-preservation` “HOLDS (E2E
refusal leg INCONCLUSIVE by construction)”); per-finding evidence is graded
(“reproduced by me **and** independently by lane `ConfNestedTargets`”); side
effects are accounted (“substrate config hash unchanged after cleanup”); harness
telemetry is isolated from a launcher defect; `Limits of this audit` gives four
explicit non-claims. Its `Parent remediation (2026-10-09)` closes findings with
regression evidence but ends on a **narrowed claim**: *“static symlink
containment, not race-free capability confinement”* — the verdict column still
reads VIOLATED (F1 HIGH). A probe closes by **shrinking the claim to what was
observed**: `PASS under a sha256 + timestamp`, not `PASS`.

**Band values.** Probe recorded merged `16/32/100/16` at sha256 `0e416f0a…`
(size 11999, measured 01:34:05Z); rolled back `32/100/100/64` at `7efc813b…`
(12000, 01:22:15–01:30:57Z). Live now (read 2026-10-09T11:37Z by this lane):
`0e416f0abc559e9a91bc0c35ea8abd913ba11e1a926db9f72dade2f73d5fa8b3`, size 11999 —
byte-for-byte the merged state, stable 10.1 h. The backup chain corroborates: **no
backup anywhere holds 16/32/16** (the merged band only ever existed in the live
tree), and there is **no `.bak` between 01:14:17Z and 01:30:57Z**, matching the
forensic argument that the 01:22:15Z rollback was not an apply.

**Changed.** Nothing — read-only research.

**Unknown.** The probe’s per-point raw outputs were not re-run; who ran the
01:30:57Z re-apply stays unresolved in both reports; the `19:15 → 19:59` inverse
band change’s attribution is undecidable from backups alone ([INFERENCE]). Lane
report: `.tower/fleets/shokunin2/reports/evidence-auditor/ProbeReportAnatomy.md`.