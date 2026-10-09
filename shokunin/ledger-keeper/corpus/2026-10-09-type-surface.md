# type-surface — `primeagent-refinement.d.mts` declared contract

Asked: every exported type/signature, how refusals are named, and declared-vs-runtime disagreements.
Anchor: `ufo-fsd-alpha@5ace2559`. Source: `reports/ledger-keeper/<Lane>.md` (mission round 1, wave `ledger-keeper-r1-w1`). Lane: `TypeSurface`.

Observed:
- 9 declared value exports == 9 runtime exports (type-probe proof); 9 declared types; specifier
  `@ufo/substrate-runtime/primeagent-refinement.mjs` (package.json :13) with **no `types` condition** — resolves only via the TS NodeNext sibling rule.
- `RefusalCode` (:6-13) = 7 literals; `RecoveryRefusalCode` (:95-100) adds observation-invalid/identity-mismatch/continuity-unproven.
  Digest refusal has no `provenance`; every recovery refusal requires it (:161-166).
- Declared-vs-runtime disagreements (all declaration-side, runtime unchanged): (1) the `display` "[untrusted data]" doc claim is
  false for the **writer** path (writer display has no tag; child does); (2) `RecoveryRefusalCode` carries `unbound`/`foreign-mission`
  which are unreachable (expectedParentRun is required); (3) `classifyRefinementSession`/`formatRefinementDigestStatus` declare
  non-nullish inputs the runtime tolerates; (4) the injectable ledger-module seam is untyped; (5) declared numeric ranges are
  descriptive (out-of-range silently falls back via `clampInt`, never `options-invalid`); (6) `options-invalid` is reused for a
  throwing scope resolution.
- Verification: `deno check` on the declaration and a surface probe (exit 0); no in-repo `tsc`/workflow type-checks the declaration
  (`packages/` is out of `tsconfig` scope); a `deno check` of a specifier-shaped `.mjs` import fails (Deno does not apply an adjacent `.d.mts`).

Changed: nothing. Unknowns: whether any out-of-tree seat consumes the subpath's types.

Report: `reports/ledger-keeper/TypeSurface.md`.
