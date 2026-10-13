# docs-self-declared-gaps — what the repository admits it has not settled

Asked: the gaps, frictions, and blocked/deprecated surfaces the substrate declares about itself.
Source: lane DocsSelfDeclaredGaps report. Anchor: ufo-fsd-alpha@5ace2559,
`config/ufo.json` sha256 `0e416f0abc559e9a…` (worktree — ` M` against HEAD).

## Observed

- Nine gap docs each carry the fence "point-in-time record; paths and statuses may be stale. See
  README.md for current state." (`KNOWN-GAPS.md:3`, `FRICTIONS.md:3`, `BLOCKED.md:3-4`,
  `LKG-SOURCES.md:2`, `MOLD-FALLBACK.md:2-3`, `LANE-STATUS.md:3`, `GOAL-STATUS.md:3`,
  `GOAL-COMPLETION-AUDIT.md:3`, `CONFORMANCE-FINDINGS.md:3`). Current goal authority is delegated
  to `docs/BLOCKED.md` (+ `GOAL-AUDIT.md`, `REMAINING.md`).
- Settled-in-admission gaps: `BLOCKED.md:16-18,58` "**Goal stays OPEN.** Completion is UNPROVEN."
  with two operator-owned open clauses — authenticated native-OMP live LLM evidence and the private
  LKG byte-identical clone; `CONFORMANCE-FINDINGS.md:456-467` F-C3 SIGSEGV "Observed once, not
  reproduced in 42 subsequent pair runs … not fixed"; `ports/ufo-core-runtime/SRC-PARTIAL.json`
  "TipByte 12 OPEN"; `GOAL-COMPLETION-AUDIT.md:385-393` "What remains unproven (do not invent)".
- Residue sweep (`find` for `*.bak|*trunc*|*corrupt*|*.seed`): 9 **untracked**
  `config/ufo.json.<stamp>.bak` (2026-10-08T19:15:32Z…2026-10-09T01:30:57Z), not gitignored, unnamed
  by any doc, writer not in the tree; 3 **tracked** `evidence/` files
  (`gates-current.txt.trunc-bak` 454,638 B; `gates-evidence-prior.txt.seed` 604,346 B,
  byte-identical to the live file; `gates-evidence-prior.txt.trunc-bak` 491,937 B), all committed
  at `72ab84a8`, fenced by `evidence/README.md:48-52` "do not reconstruct or delete them".
  No `corrupt-*` file names exist ("corrupt" appears only as content in docs).
- Drift between claim and tree: `evidence/README.md:20-21` "still 12" gates files → 13 at HEAD;
  `evidence/README.md:50` "not a committed blob" → committed `72ab84a8`;
  `KNOWN-GAPS.md:175-178` stamps `gates.sh` blob `c5b14cab`/872 lines → HEAD `8d6b042e`/1001 lines;
  `BLOCKED.md:22` "artifacts 150" → 192; `BLOCKED.md:21-27` bundled mirror `7072817d` → now
  `d4364b67`; `GOAL-STATUS.md:513`/`REMAINING.md:1004` "prior file absent" → present, 14,389 lines.

## Contract

1. Every gap/friction/blocked/status doc is a dated snapshot; `README.md` is the current-state
   pointer and current goal authority is `docs/BLOCKED.md`.
2. The parent goal stays OPEN; "Do not redefine completion" (`GOAL-COMPLETION-AUDIT.md:395`).
3. Two operator-owned open clauses (native-OMP live LLM evidence, private LKG clone); L3 /
   certified-64 / recall A/B rows are **Shelved**.
4. Disputed cross-port merges are retained as disputes, "not silently flattened" (`KNOWN-GAPS.md:25,88`).
5. Evidence-dump fence: do not delete or reconstruct `evidence/` artifacts (`evidence/README.md:48-52`);
   `.seed`/`.trunc-bak` residue is provenance, not current-run evidence.
6. Honesty labels are load-bearing: dry/mock/local ≠ live; "Route declarations do not prove
   entitlement, capacity, or a model actually served to a run" (`BLOCKED.md:14`).
7. Friction register rule: any round that finds/fixes/reclassifies friction MUST update
   `FRICTIONS.md` in the same commit (`:36`).
8. `.bak` is sweepable scratch for the wall (`ufo-sighting.mjs:3205`) and a rotation-contract
   violation in ledger families (`fleet-selfheal-verify.mjs:370,900-907`); config-root `.bak`
   residue is tolerated but undeclared.

## Not carried by the source

- No doc owns the 9 `config/ufo.json.*.bak` files; no in-tree writer exists; no retention policy for
  them. No doc stamps the current `gates.sh` bytes, and no doc records that
  `gates-evidence-prior.txt` was committed. F-C3 / tip-byte / live-OMP are unre-measured by admission.

## Unknowns

- Writer identity of the config backups (external fleet/tower tooling per the timeline — **[INFERENCE]**);
  whether an `authority_boundary` seal was raised/signed for the 01:30Z band edit; live global OMP
  config state; network claims (crates.io 404, upstream tip `05297518`); FRICTIONS C1 MCP host state.