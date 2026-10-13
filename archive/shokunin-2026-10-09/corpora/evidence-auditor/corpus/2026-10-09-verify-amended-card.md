# 2026-10-09 — re-verification of the amended `evidence-auditor` card

**Asked.** Bounded re-verification after the card was amended: (1) read
`.omp/agents/evidence-auditor.md` whole; (2) check that EVERY substrate path the
card names exists at HEAD — in particular the sibling-tree READMEs
`docs/artifacts/README.md`, `reports/README.md`, `research/README.md`, and the
`.tower/` paths the card labels state-directory artifacts; (3) re-check the
`test/evidence/.gitignore` bullet by running
`git grep -n -i gitignore -- '*.mjs' '*.js' '*.json' '*.yml'` and
`git grep -n 'check-ignore'`, recording each exit code and output, and stating
whether the card's wording now matches what the commands do; (4) write exactly
one corpus entry + one index row.

**Where.** Worktree `/home/vgpnk/Projects/ompskills/.tower/worktrees/shokunin2/evidence-auditor`
(`git rev-parse --show-toplevel` → that path, rc=0), revision pinned
`git rev-parse HEAD` → `ecee97e7613cc52b7e6e7b33db2fb677252cdcfa`; tracked file
count `git ls-files | grep -c .` → `273`. Substrate `/home/vgpnk/Projects/ufo-fsd-alpha`
READ-ONLY, `git rev-parse HEAD` → `5ace25599283f5f5a9c3c46157ee40591a0a3421`.

## Observed — card-named repo paths (worktree, `test -e` + `git ls-files --error-unmatch`)

All present and git-tracked at `ecee97e…`:

| card path | `test -e` | tracked |
| --- | --- | --- |
| `test/evidence/.gitignore` | PRESENT | TRACKED |
| `test/run-wave-test.mjs` | PRESENT | TRACKED |
| `test/sighting-wave-smoke.md` | PRESENT | TRACKED |
| `test/tower-fleet.test.mjs` | PRESENT | TRACKED |
| `sighting/l1-prompt.md` | PRESENT | TRACKED |
| `sighting/tower-fleet.mjs` (named in the round-receipt bullet) | PRESENT | TRACKED |
| `host/apply.mjs` | PRESENT | TRACKED |
| `host/ufo-sighting-dispatch.json` | PRESENT | TRACKED |
| `.omp/skills/tower/SKILL.md` | PRESENT | TRACKED |
| `.omp/skills/swarm/SKILL.md` | PRESENT | TRACKED |
| `.omp/skills/shokunin/SKILL.md` | PRESENT | TRACKED |
| `reports/tf-*.md` | PRESENT (9 files) | TRACKED |

`reports/tf-*.md` expands to `tf-audit-band.md`, `tf-audit-docs.md`,
`tf-audit-launcher.md`, `tf-audit-prompt.md`, `tf-audit-routing.md`,
`tf-audit-tests.md`, `tf-audit-wall.md`, `tf-probe-band.md`, `tf-safety-r2.md`.

## Observed — card-named `.tower/` state paths

The card's repo parenthetical is `/home/vgpnk/Projects/ompskills` **or the
worktree you were started in**. The `.tower/` state dir is a child of the *main
repo root*, not of this worktree (the worktree is itself nested at
`.tower/worktrees/shokunin2/evidence-auditor`). Measured both:

- In this worktree: `.tower`, `.tower/comms`, `.tower/comms/{MISSIONS.md,state.json,missions,reviews,findings,log/activity.log}`, `.tower/fleets` → **all ABSENT** (`test -e` false).
- In `/home/vgpnk/Projects/ompskills`: `.tower`, `.tower/comms`, `.tower/comms/MISSIONS.md`, `.tower/comms/state.json`, `.tower/comms/missions`, `.tower/comms/reviews`, `.tower/comms/findings`, `.tower/comms/log/activity.log`, `.tower/fleets` → **all PRESENT**.

Pattern members confirmed present at the main repo root:

- `.tower/fleets/<fleet>/rounds/<mission>-r<N>.md` — e.g.
  `.tower/fleets/shokunin2/rounds/evidence-auditor-r1.md`, `godspeed-keeper-r1.md`;
  `.tower/fleets/shokunin/rounds/` holds 15 receipts.
- `.tower/fleets/<fleet>/reports/<mission>/<Name>.md` + `swarm-registry.json` —
  e.g. `.tower/fleets/tower1/reports/tf-audit-launcher/swarm-registry.json`
  (`find .tower -name swarm-registry.json` → 53 hits; the registry sits **inside**
  the mission report dir, matching the card's `reports/<mission>/` + registry
  pairing, not at `.tower/fleets/<fleet>/`).
- `.tower/fleets/<fleet>/waves/<wave>.{spec,plan,payload,dispatch-result,assignments}.json`
  — e.g. `.tower/fleets/shokunin2/waves/evidence-auditor-r1-w1.{spec,plan,payload,dispatch-result,assignments}.json`
  (plus `.dispatch.err`, `.plan.err`, `.record.json` siblings).

## Observed — card-named substrate paths (READ-ONLY, `test -e` + `git ls-files --error-unmatch`)

All 14 present and TRACKED at substrate HEAD `5ace255…`:

`evidence/README.md`, `evidence/nightcall-integration/r01-receipt-audit.mjs`,
`docs/EVIDENCE-INDEX.md`, `docs/BEHAVIOR-MATRIX.md`, `docs/PROVENANCE.md`,
`docs/LKG-SOURCES.md`, `docs/REPO-LAYOUT.md`, `docs/BLOCKED.md`,
`docs/KNOWN-GAPS.md`, `docs/artifacts/README.md`, `reports/README.md`,
`research/README.md`, `scripts/ufo-swarm-wave.mjs`, `scripts/ufo-swarm-collect.mjs`.

The three sibling-tree READMEs the card now names all exist; the card's
parenthetical "(only the first is under `docs/`)" is accurate —
`docs/artifacts/README.md` is under `docs/`, while `reports/README.md` and
`research/README.md` sit at the substrate root.

## Observed — the two `git grep` commands (worktree, verbatim, with exit codes)

1. `git grep -n -i gitignore -- '*.mjs' '*.js' '*.json' '*.yml'`
   → **no output; rc=1** (zero matches in tracked `.mjs/.js/.json/.yml`).
2. `git grep -n 'check-ignore'`
   → **rc=0**, 11 lines in 3 files:
   ```
   .omp/agents/evidence-auditor.md:30:  '*.yml'` returns nothing (a bare `git grep check-ignore` matches prose, including
   shokunin/evidence-auditor/corpus/2026-10-09-evidence-gitignore-contract.md:14:`git check-ignore -v test/evidence/wave-20261009T120000Z/manifest.json` →
   shokunin/evidence-auditor/corpus/2026-10-09-evidence-gitignore-contract.md:31:and `git grep -n check-ignore` → rc=1. Nothing would fail if a covered file were
   shokunin/evidence-auditor/corpus/2026-10-09-verify-gitignore-gate.md:8:`git grep -n 'check-ignore'`;
   shokunin/evidence-auditor/corpus/2026-10-09-verify-gitignore-gate.md:9:`git check-ignore -v test/evidence/wave-20261009T120000Z/manifest.json`;
   shokunin/evidence-auditor/corpus/2026-10-09-verify-gitignore-gate.md:21:2. `git grep -n 'check-ignore'`
   shokunin/evidence-auditor/corpus/2026-10-09-verify-gitignore-gate.md:23:3. `git check-ignore -v test/evidence/wave-20261009T120000Z/manifest.json`
   shokunin/evidence-auditor/corpus/2026-10-09-verify-gitignore-gate.md:41:- `git grep -n -iE 'check-ignore|\.gitignore'` (all tracked files, no pathspec)
   shokunin/evidence-auditor/corpus/2026-10-09-verify-gitignore-gate.md:47:- `git grep -n --untracked 'check-ignore'` → **rc=0**, 4 lines in 2 files:
   shokunin/evidence-auditor/corpus/2026-10-09-verify-gitignore-gate.md:57:  `git check-ignore -v --no-index test/evidence/wave-20261009T120000Z/manifest.json`
   shokunin/evidence-auditor/corpus/2026-10-09-verify-gitignore-gate.md:103:- **The mechanism under a write.** `git check-ignore` answers for a path string;
   ```

**Does the card's wording match?** Yes, at this revision.

- Card: the scoped search "returns nothing" → command 1 is rc=1 with no output. Match.
- Card: "a bare `git grep check-ignore` matches prose, including this card, once the corpus is tracked" → command 2 is rc=0, and its hits are exactly prose: the card itself (`.omp/agents/evidence-auditor.md:30`) plus two tracked corpus entries. Match. The "once the corpus is tracked" qualifier is load-bearing: the corpus is now tracked (`git ls-files shokunin/evidence-auditor/corpus/` lists 30 files incl. `index.md`), whereas the earlier `2026-10-09-verify-gitignore-gate.md` entry recorded the same bare command as **rc=1** because the corpus was untracked then. The card's parenthetical correctly describes the *current* tracked state.
- Card: `test/evidence/.gitignore` is `*` plus `!.gitignore` → `cat` shows exactly `*` / `!.gitignore` (with a 4-line comment header); `git ls-files test/evidence/` → `test/evidence/.gitignore` only; `git check-ignore -v test/evidence/wave-20261009T120000Z/manifest.json` → rc=0, `test/evidence/.gitignore:4:*	…`. Match. `ls -a test/evidence` shows only `.gitignore` (no run dirs currently on disk).

## What this establishes

The amended card's path inventory is accurate at the pinned revisions: every
repo path it names is present and tracked in this worktree; every substrate path
it names is present and tracked at substrate HEAD; the `.tower/` paths it labels
state-directory artifacts exist at the main repo root (and, as the card's own
parenthetical implies, not inside this worktree). The `.gitignore` bullet's two
named commands reproduce with the exit codes the card implies (rc=1 scoped /
rc=0 bare-with-prose), so the wording now matches observed behavior.

## Changed

Nothing — read-only. No file outside `shokunin/evidence-auditor/corpus/` was
touched; the substrate was not written. Pre-existing worktree state (unchanged
by this audit): `M .omp/agents/evidence-auditor.md`,
`M shokunin/evidence-auditor/corpus/index.md`,
`?? shokunin/evidence-auditor/corpus/2026-10-09-r2-verification-errata.md`.

## Unknown (not measured)

- **`.tower/` at the worktree root.** The card's repo parenthetical names the
  worktree as an alternative root, but the `.tower/` paths are absent there; I
  measured them at the main repo root instead. Whether the card intends the
  worktree reader to resolve `.tower/` upward to the main repo is a reading
  question, not a measurement — reported, not judged.
- **`swarm-registry.json` placement.** The card writes
  `.tower/fleets/<fleet>/reports/<mission>/<Name>.md` + `swarm-registry.json`;
  observed registries live inside the mission report dir (53 hits under
  `.tower/`), consistent with that pairing, but I did not open one to confirm
  its `ufo-swarm-registry-v1` schema string.
- **Other checkouts / revisions.** Every measurement is from this worktree at
  `ecee97e…` and substrate `5ace255…`. The main repo root's `.tower/` was
  inspected for existence only; its own HEAD was not pinned.
- **The card's other claims** (manifest schema, receipt slots, honesty rules,
  band authority, etc.) were not re-derived here — out of this assignment's
  scope; see the sibling corpus entries.
