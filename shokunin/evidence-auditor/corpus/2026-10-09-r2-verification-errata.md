# 2026-10-09 — round-2 verification errata (corrections to round-1 entries)

**Asked.** Round 2 dispatched 30 verification lanes over the round-1 deliverable —
28 lanes checking one corpus entry each against its sources at HEAD, one checking
the card against the shokunin contract, one checking the index and the append-only
protocol. This entry records what they **contradicted**, so the corpus carries the
correction without rewriting the original entries (the corpus only grows).

**Observed — contradictions that stand** (each re-derived by the lane; the two I
re-checked myself are marked ✔).

1. **`evidence/README.md` is 52 lines, not 43** (`VSubstrateTree`). `wc -l` = 52
   at HEAD, at `41edcaea` (50) and at `72ab84a8` (52); 43 occurs in no reachable
   revision. The entry's own anchors (`:42-46`, `:48-53`) only fit a ≥53-line file.
   ✔ (I re-ran `wc -l` → 52.)
2. **The "fleet proof uses the isolated clone and `bash scripts/gates.sh`, not
   this tree" quote is real, not a paraphrase** (`VEphemeral`). It occurs verbatim,
   markdown-wrapped, at `docs/evidence/README.md:6-7` and `research/README.md:6-7`,
   and in **357 tracked files**; a line-oriented search missed it because it wraps.
   The entry's "quote correction" is therefore itself wrong — a false-provenance
   correction. `docs/SOURCES.md:10-11` and `docs/adr/001-…:8-10` remain the policy
   lines, not "the only real lines".
3. **`git grep -n 'check-ignore'` now returns rc=0, not rc=1**
   (`VGitignore`). ✔ The round-1 measurement was true when taken (the card and
   corpus were untracked); committing them made the string tracked, so the
   command now matches `.omp/agents/evidence-auditor.md:26` and three corpus lines.
   **The artifact under construction changed its own measurement** — the entry's
   rc=1 claim is false at HEAD, and the *scoped* variant
   (`git grep -n -i gitignore -- '*.mjs' '*.js' '*.json' '*.yml'`) still returns
   rc=1. The underlying claim (no in-repo gate) is unaffected.
4. **`--out` / `--report-dir` are not both `path.resolve`d** (`VGitignore`):
   `test/run-wave-test.mjs:250` stores `reportDir` raw and `:281` uses
   `path.posix.join`; only `:251` resolves `--out`.
5. **"Exactly two files written" omits the backups** (`VApplyDry`): `backupFile`
   creates two additional `.bak` files on a normal apply.
6. **"All `record` checks run before any mutation" is overstated** (`VRegistry`):
   `ufo-swarm-wave.mjs:1764-1782` validates and mutates sequentially, so an earlier
   assignment can mutate before a later invalid assignment fails. Also: the
   blanket "no code carries `details`" is contradicted by the `SwarmWaveError`
   details handling (`:305-310, 1384-1393, 1432-1437`).
7. **`reportSummary`'s field is `missing`, not `missing-by-name`** (`VLaneReport`).
   ✔ (`ufo-swarm-collect.mjs:751` emits `missing`.) The same lane found the
   collector join cited as `ufo-swarm-wave.mjs:619`; the join is in
   `ufo-swarm-collect.mjs:619`.
8. **The waves directory is 49 files / 14 wave-id prefixes, not 46 / 15**
   (`VWaveArtifacts`).
9. **`sighting/l1-prompt.md` is 180 lines, not 181** (`VSkillClauses`).
10. **`conflicting_member` fails at `ufo-swarm-collect.mjs:557`, not `:556`**
    (`VHonestyRules`). The same lane found `grep -rn corpus` over the substrate
    `scripts/` + `crates/` returns 14 matches in 7 files, not nothing — the
    narrower claim (no code reads `shokunin/<name>/corpus/`) still holds.
11. **`native_header.rs:192-229` compares digests to already-derived handoff
    hashes rather than calling hash functions** (`VDigest`) — "Rust recomputes" is
    behaviourally supported but slightly overbroad for those exact lines.
12. **Anchor slips in the substrate entries** (`VSubstrateIndex`, `VProvenance`,
    `VEphemeral`, `VBlocked`, `VLkg`, `VSubstrateTree`): the publication-boundary
    quote is at `docs/EVIDENCE-INDEX.md:37-38` (not `:11-13`); the capacity
    demotion spans `:12-13`; the mock gloss is at `EVIDENCE-INDEX.md:31-32` (not
    `BEHAVIOR-MATRIX.md:208`); `PROVENANCE.md`'s deletion marks are at `:11-13`
    and its repo table at `:113-129`; `BLOCKED.md`'s verdict is at `:58` (not
    `:57`), its route-declaration sentence at `:14-15`, and "Do **not** fake host
    live." at `:60`; `tf-audit-tests.md`'s §8 sentence is at `:242` (not `:243`).
13. **The per-section refrain family totals 11, not 5 + variants**
    (`VSubstrateIndex`): 5 at `:241,260,297,325,343`, 6 "live churning tree" at
    `:358,375,391,406,421,436`, 2 "live multi-owner tree" at `:450,463`.
14. **"Regenerated on each state transition" is over-generalized** (`VHubState`):
    `activity.log:73-77` records five later hub events with no `MISSIONS.md` /
    `state.json` mtime change. The supported claim is "regenerated at the last
    write". Also: the generator string *does* occur in `.tower/comms/` (the very
    lines quoted) — "nowhere" is true only under the tracked-tree reading
    (`.tower/` is excluded via `.git/info/exclude`); and `ref=` appears on 41 of
    77 `activity.log` lines, so it is optional, not a per-line component.
15. **"The doc row is the only in-tree description of the tags" is false**
    (`VLkg`): `docs/charter-ufo-fsd/index.html:586-590`, 12 locale JSONs, and
    `evidence/nightcall-integration/nc2-verify-w2-r2/ProbeEvidenceIndex.md:89` all
    name them. The lane report's narrower claim ("of its contents") was dropped in
    condensation. Also: the phrasing-class table has 32 rows, not 31; and
    "historical baseline evidence" / "not current green or runtime proof" occur
    only in `docs/PROVENANCE.md:51`.
16. **The `reporting-parse` allowlist group is not in `fleet-dispatcher.mjs`**
    (`VBlocked`): none of those seven codes appears in that file; their owners are
    `ufo-l0-monitor.mjs`, `ufo-mission-result.mjs`, and `ufo-swarm-collect.mjs`.
    Also: "no `failed`/`error`" holds only for the **loop terminal set**
    (`ARCHITECTURE.md:170-172`), not for lane outcomes; and the `Unknowns:` line
    is a mission-keeper-local convention, not a corpus-wide one.
17. **`dc31bdb2…` does resolve** (`VPinStaleness`): the full digest is recorded at
    `crates/ufo-core-runtime/bundled/omp-seat-routing.json:597-600`; only
    `798b3fb2…` is unresolvable today. Also: the landing merge is `d47e474`
    (mainline `df3267d`), not `1b9d8b2`, which is a merge inside the branch.
18. **The `41edcaea` "2 commits behind HEAD" is a shallow-clone artifact**
    (`VSubstrateTree`): `41edcaea` is **not** an ancestor of HEAD
    (`merge-base --is-ancestor` → no); `rev-list --count` returns 2 for unrelated
    controls too. "Exists" is confirmed.
19. **Scope mixing in the honesty audit** (`VHonestyClaims`): the entry's
    `{shokunin,tower1-safety-r2}/rounds/` scope holds 16 receipts, not 15; the
    50-wave count only works when `tower1-safety-r2`'s single spec is included.
    The claimed current NoInventionSweep walk (48/1457/14/34) is not reproducible
    from a stated scope at HEAD; `resumeRows = 0` remains true.
20. **`VHermetic`**: the entry overstates that `status`'s only external effect is
    `status --lite` (the source proves the exact stub argv plus no drift in the
    listed roots/window); and `BAND` carries five numeric fields plus the string
    `l1Alias`. The snapshot **is** metadata-only (path/kind/size/mtime), not a
    content hash — confirmed.
21. **`VRoundReceipt`**: the cited matcher also admits malformed-but-matching
    names (e.g. `<id>-report.md`) and sorts them at key 0 — a caveat the entry's
    naming rule omits.
22. **`VTreeIndexes`**: not all 12 non-verification swarm artifacts carry
    `nightcall-swarm-evidence-rNN-v1` schemas (`r02-review`, `r08-main-probes`,
    `r11-sighting-l2-observer-gap` differ). The `22+90` vs `21+91` divergence and
    the missing `nc2-verify-r1/` are confirmed as the entry states.
23. **`VSiblings`**: "Same provenance contract, separate dirs" is not verbatim
    across all five sources (several say "directories"; `docs/evidence` lacks the
    phrase), and the fence-pattern invariant over-generalizes clauses absent from
    some trees.

**Rejected verification findings** (the verifier is wrong; recorded so the
rejection is auditable):

- `VCardContract` — "the corpus protocol omits the invariant never to reorder or
  drop index rows": the card carries it verbatim (`.omp/agents/evidence-auditor.md:130-131`).
- `VSiblings` — "current `ls evidence/gates-*.txt | wc -l` returns 13, while the
  entry reports 12": the entry reports **13** as the current value and 12 as the
  README's recorded value; the verifier misread the drift sentence.

**Changed.** The card was amended (not the entries): the substrate sibling-tree
paths were corrected — `docs/{artifacts,reports,research}/README.md` →
`docs/artifacts/README.md`, `reports/README.md`, `research/README.md` (only the
first is under `docs/`) — and the `.tower/…` paths are now labelled
state-directory artifacts rather than repo sources. No corpus entry was rewritten
or deleted; this entry is the correction channel.

**Unknown.** The verification lanes ran read-only and mostly unexecuted: no test
suite, launcher, wall CLI, or `host/apply.mjs` run; the substrate is a shallow
clone (single-commit file history, `5f52e03a` unresolvable), so the recovery pin
is contract-only here. `VManifest`'s cited historical precedent manifest is absent
from the current revision and could not be re-derived. Lane reports:
`.tower/fleets/shokunin2/reports/evidence-auditor/V*.md` (30 reports).