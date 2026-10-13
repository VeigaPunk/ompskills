# 2026-10-09 — the substrate `evidence/` tree contract

**Asked.** What does `/home/vgpnk/Projects/ufo-fsd-alpha/evidence/README.md`
contract, and does the recorded state hold? (lane `SubstrateEvidenceTree`, scout.)

**Observed.** `evidence/README.md` (43 lines; substrate HEAD `5ace2559`, shallow
clone).

- **Dump contract** (`:5-9`): the directory *“is a historical evidence dump. Its
  files record gate runs, swarm rounds, and integration probes captured during
  prior UFO-FSD iterations; they are retained as provenance, **not** as a live
  runbook or current routing authority.”* The load-bearing distinction is
  **provenance vs authority**.
- **Per-file isolation footnote is the enforcement mechanism**: every non-README
  `.md` opens with the same `*2026-09-24 (nc5-docs r43, isolation distinction):*`
  block routing fleet proof to *“the isolated clone and `bash scripts/gates.sh`,
  not this tree”*. Measured: 314/314 non-README `.md` carry it (README itself
  holds a retained r14 pin). The footnote is a **rotating pin**, not static text
  (`01e616db` “r42→r43 footnote rotation”).
- **Live routing lives elsewhere** (`:42-46`): current seat routing and L2/L3
  dispatch are in `docs/L2-L3-ROUTING.md`; explicit prohibition — *“Do not infer
  present-tense seat tables, capacity, or operator procedure from files in this
  tree.”*
- **Sibling-tree table** (`:31-38`): “Same provenance contract, separate
  directories” → `docs/artifacts/` (JSON/MD iteration dumps), `research/`
  (arXiv-style paper corpus only), `reports/` (dated operator audits).
  `:52-53` fences but does not replace `docs/evidence/` (a separate tree; 39 `.md`).
- **Retention fence is citation-anchored, not freshness-anchored** (`:48-53`):
  “**Do not delete** dumps here without an explicit archive decision.”
  `gates-evidence-prior.txt` is fenced because `docs/GOAL-STATUS.md` and
  `docs/REMAINING.md` cite it — even though the README itself labels it a
  *recovered transcript* (runner SHA-1 `d81de4f6`, `GATES_EXIT=1` on “cited gate
  evidence is reproducible”), *“provenance of the reclaim, not current-run
  evidence”*. Its fragments `.seed` (590 KB) and `.trunc-bak` (480 KB) also
  survive — “do not reconstruct or delete them.”
- **Most recent recorded counts**: 315 live `.md`; unpinned 0; pin HEAD
  `41edcaea`; 316 files pinned “this round”; `gates-*.txt` 12; retained runner
  SHA-1 `d81de4f6`.

**Observed vs recorded (this lane, read-only).** 315 tracked `.md` holds ✅;
314 non-README footnoted ✅; `docs/evidence/` = 39 ✅; pin `41edcaea` exists
(2 commits behind HEAD) ✅; `gates-evidence-prior.txt` sha1
`fc696b8687b30fbf3208080a120ccf89b4d7dc74`, byte-identical to its `.seed` ✅.
**Drift** (the contract predicts it): the README’s own refresh recipe
`ls evidence/gates-*.txt | wc -l` now yields **13** (not 12) because the recovered
transcript matches the glob; “316 pinned” vs 315 observed; the footnote is labelled
r43 in files but r23/r37 in the README; `gates-evidence-prior.txt` is **now
tracked** despite the README’s “git history still shows none under this name”;
`docs/GOAL-STATUS.md:513` still says the file is absent; `evidence/swarmport-e2e/`
(README: “present but empty and untracked”) is **absent**.

**Changed.** Nothing — read-only research.

**Unknown.** Reconciliation causes for the drifts are tensions, not conclusions;
the runner file hashing to `d81de4f6` is not named in the README and was not
recomputed. Lane report:
`.tower/fleets/shokunin2/reports/evidence-auditor/SubstrateEvidenceTree.md`.