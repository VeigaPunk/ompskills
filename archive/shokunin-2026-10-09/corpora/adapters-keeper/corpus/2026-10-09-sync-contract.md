# sync-contract — the writer and the gate for packages/

Asked: how sync-ufo-contracts.mjs produces and verifies the packages/* trees.
Source: lane SyncMirror (`reports/adapters-keeper/SyncMirror.md`).

## Observed

- **Regenerate**: `npm run contracts:sync` = `sync-ufo-contracts.mjs &&
  project-devin-subagents.mjs && render-seat-tables.mjs` (root package.json:27).
- **Verify**: `npm run contracts:check` = sync `--check` + project-devin-subagents
  `--check` + check-routing-free-config + render-seat-tables `--check` +
  check-hand-authored-sets (package.json:26). `--check` is read-only by code guard.
- **Write set under packages/**: skills/ufo mirrors into all 7 adapter packages +
  contract-support/assets + cursor/.cursor + devin/.devin native variants; agents/*.md
  into {substrate-omp,kimi,cursor,devin} + .omp; ssot directive into every package's
  ssot/ + native variants; wwkd dep closure into skills/wwkd; scope tags into the five
  charterlist slots (writer loop :1997-2020; source = docs/ufo-fsd-charterlist.json
  assigned_slots, validateCharterlist :312-378).
- **Authored under packages/** (never sync output): package.json, README.md, src/**,
  test/**, schemas/**, tsconfig.json; `packages/devin/.devin/agents/**` comes from
  `project-devin-subagents.mjs` (a different writer); the packages/* dir set itself is
  enforced by check-hand-authored-sets.
- **Live check state at anchor** (`sync --check`, read-only): exit 1 — copies 193,
  missing 18 (all `.devin` roots — generated/gitignored, converge on `contracts:sync`),
  drifted 2 (`crates/ufo-core-runtime/bundled`), depsClosure 6 unsatisfied under .devin,
  routesEquivalence mismatch, surfaceDigest drift; `packageScopes.ok` and
  `skillsSums.ok` true. `check-hand-authored-sets` exit 0.
- `check-hand-authored-sets.mjs` checks **directory membership only** (:117-124); it
  does not read scope tags or adapter contents — that is sync's job.

## Contract

Byte-authority flow: canonical sources → sync writer → packages/* mirrors →
`contracts:check` byte-gate. Any packages/* file a sync target doesn't name is either
authored or ungated residue.

## Unknowns

- Cause of `packages/devin/.devin` absence vs substrates/devin/substrate.json declaring
  it (gitignore + generate-on-demand; ordering effect observed).
- tests/sync-ufo-contracts.test.js shadowSkillTargets omits grok+opencode — test blind
  spot, not a sync gap (ContractCompare lane).
