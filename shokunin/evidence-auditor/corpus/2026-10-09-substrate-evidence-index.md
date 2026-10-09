# 2026-10-09 — the historical round evidence index and its standing caveats

**Asked.** What standing caveats, structure, and recovery rule does
`docs/EVIDENCE-INDEX.md` carry? (lane `SubstrateEvidenceIndex`, scribe.)

**Observed.** `docs/EVIDENCE-INDEX.md` (498 lines; substrate HEAD `5ace2559`,
shallow clone, tracked clean; self-dated snapshot 2026-09-24, nc5-docs r43).

**Standing caveats, exact:**

- Intro aggregate (`:29-33`): *“This index summarizes the deleted R2–R5 notes.
  Scores, admissions, gate counts, spawn counts, and timings below are **claims
  recorded in those historical notes**, not independently re-exercised results of
  this consolidation. A mock reported as "live" remains mock evidence. None is
  current native OMP execution proof or a capability score for this mission.”*
- Per-section refrain (5 occurrences, `:241,260,297,325,343`): *“Point-in-time
  measurements of a churning tree, not standing guarantees.”* Variants add:
  *“`scripts/gates.sh` was deferred and is not claimed passing. Swarm reports are
  advisory and enter no `NativeRoundHandoff`.”*
- Capacity demotion (`:10-12`): the 2026-09-11 probes *“are serving evidence, not
  native execution proof or a capability score for any future mission.”*
- Publication boundary (`:11-13,47`): *“A local artifact path is not published
  proof.”* / *“All `.ufo/` paths are gitignored local artifacts, not published
  proof.”*
- Pinned-commit demotion (`:204-205`): the recovery commit *“is a comparison base,
  **not an independently verified last-known-good**.”*
- Closing authority rule (`:226-229`): *“Current eligibility, dispatch permission,
  and judgment come only from the canonical contract and actual run evidence;
  local helper availability is not authorization to launch a model, worker, or
  mission.”*

**Structure.** R2–R5 table (round, date, recorded base commit, historical axis,
recorded score delta, recorded work — e.g. R5 “hold-steady” for “stress +
saturation”); a 2026-09-11 capacity-evidence section (13 point-in-time route-health
probe rows, `ufo-route-health-state-v1`, ~1 h `expiresAt`; aggregate
`availability.json`; the operator contract chain ending in
`final-operator-contract.json`; fleet missions; gates/guidance sync; baseline
provenance); and a **Deleted-source recovery** block (`:199-229`) naming the ten
staged deletions, preserved at comparison commit
`5f52e03a9f765476b63d2f2f54e29b72f22b6359`, with a read-only recovery example
`git show 5f52e03a…:docs/EVIDENCE-R4.md`.

**Per-tree index siblings.** `evidence/*/INDEX.md` follow a shared convention
(lane `HistoricalEvidenceIndexes`): an `## Files (N)` heading counting artifacts
excluding INDEX.md; **two registers** of bullets — founding records mirroring the
JSON’s real top-level fields (schema string + `runId` `gq`+16hex) vs round
artifacts citing `rNN iteration-N/8` + payload counts, where a bullet **never
asserts an identifier the artifact lacks**; a standing rule verbatim in all three
(*“read-only historical evidence — do not regenerate, re-run, or treat their
claims as current state”*); and a five-layer banner whose same-commit isolation
blockquote is byte-identical across trees. `evidence/nightcall-integration/INDEX.md`
diverges: a 112-entry `Layout:` arithmetic (22 subdirs + 90 files) + `## Generations`
buckets + class buckets, with no schema strings.

**Fidelity recheck (lane `HistoricalEvidenceIndexes`, at HEAD).** All 21 subdir
file counts exact; class counts 28/13/10/2/6; total 112 ✅. **Divergence**: the
claimed 22nd subdir `nc2-verify-r1/` (“empty directory”) is **absent** — zero git
tree entries, zero log commits; measured 21 dirs + 91 files. Git cannot persist
empty dirs, so the decomposition counts a working-tree-only container while the
`22+90 = 21+91 = 112` identity masks the ±1 swap in **both** terms — the concrete
trap for a historical index: **totals can stay true while decomposition terms
drift.**

**Changed.** Nothing — read-only research.

**Unknown.** No `ufo`/gate command was run; the probe, round, and fleet claims are
transcribed, not re-executed. Lane reports:
`.tower/fleets/shokunin2/reports/evidence-auditor/SubstrateEvidenceIndex.md`,
`…/HistoricalEvidenceIndexes.md`.