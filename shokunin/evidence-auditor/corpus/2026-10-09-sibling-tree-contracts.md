# 2026-10-09 — the sibling historical-tree contracts

**Asked.** What provenance contract do the sibling historical trees declare, and
how do they differ? (lane `SiblingTreeContracts`, connector.)

**Observed.** Read-only: `docs/artifacts/README.md`, `reports/README.md`,
`research/README.md` (plus `evidence/README.md`, `docs/evidence/README.md`).

All five trees declare **one shared provenance contract**, named verbatim *“Same
provenance contract, separate dirs”*: point-in-time capture as provenance, never
present state; a host-era isolation stanza (*“fleet proof uses the isolated clone
and `bash scripts/gates.sh`, not this tree”*); a redirect to live authority; a
self-fencing scope (*“This README fences the tree; it does not replace
`docs/evidence/`”*); counted per-file pin sweeps with an “unpinned count 0”; dated
re-verify stamps with HEAD pins and the banner’s own provenance pointer
(`git log -p --follow`); a retention fence (evidence tree only: *“Do not delete
without an explicit archive decision”*); and a *“Do not infer present-tense …”*
clause.

| tree | is | is not |
| --- | --- | --- |
| `docs/artifacts/` | 192-entry dump index (150 JSON jq-verified clean), mostly pre-`96a4b6b4` iteration evidence | current runbooks — *“Nothing here is an authoritative operating procedure”*; `goal-audit-latest.json` is *“a retained pointer, not a fresh audit”*; `wwkd-phase0-*.md` *“are NOT live instructions”* |
| `reports/` | dated human operator audits (debloat survey, deep-review record) | this checkout’s state — *“Do not treat host paths or byte counts … as describing this isolated nc5 checkout unless re-measured here”* |
| `research/` | arXiv-style paper corpus only (README+pdf+txt) | completeness proof — deep-review *“is historical record, not a current completeness proof”* |
| `evidence/` | root machine dumps (315 tracked `.md`, 12 `gates-*.txt`) | *“a live runbook or current routing authority”*; `gates-evidence-prior.txt` is *“provenance of the reclaim, not current-run evidence”* |
| `docs/evidence/` | pre-2026-09-11-cutover probes/dry-runs/live-rounds (39 `.md`) | current runbooks or live claims; also **not** `docs/EVIDENCE-INDEX.md`. It uniquely indexes an **“Absent”** inventory (a file marked absent here but present in `docs/artifacts/`) |

**Fence pattern**: title *“historical \<class\>”* + dated round stamps + isolation
stanza + sibling cross-table + inventory (and anti-inventory) + an is/is-not
sentence + a *“Do not infer”* clause + a sweep count + self-provenance. The
tripartite invariant is **inventory + negative clause + re-verify stamp**, mirrored
on the live side by `BEHAVIOR-MATRIX.md:208`’s is/not table.

**Observed drift** (the failure mode current stamps cannot see): `reports/nc6`
(22 tracked files) and `reports/refactor` (44 tracked files) are committed and
clean but **absent from `reports/README.md`’s inventory** — extent drift invisible
to four rounds of re-verify stamps; `evidence/README.md` records “316 files
pinned” while r5 and the live tree say 315.

**Proposed move (lane, not integrated — outside this mission’s scope).** Extend the
existing periodic re-verify stamps to an **inventory-completeness check**: assert
every tracked subdirectory of a fenced tree appears in the banner’s inventory table
(`git ls-files dirname` set-difference vs banner paths), reported in the
“unpinned count 0” stamp idiom. Expected first failure on HEAD: exactly
`reports/nc6` and `reports/refactor`.

**Changed.** Nothing — read-only research.

**Unknown.** `jq` over the 150 JSON was not re-run; `scripts/gates.sh` not run;
per-file footnote contents not opened; `nc6`/`refactor` contents not read. Lane
report: `.tower/fleets/shokunin2/reports/evidence-auditor/SiblingTreeContracts.md`.