# successor-projection — `readForSuccessor` projections and caps

Asked: the default titles-only projection vs `--include-bodies`, the store-layer entry cap,
`omitted`, the one-read/one-validation rule, and the per-surface byte cap. Anchor: `ufo-fsd-alpha@5ace2559`; `scripts/primeagent-refinement-ledger.mjs` sha256 `ae69c40c7e774161812bbed3b34964978bb2d204b8daf19721ab5dd54e145096`. Source: `reports/ledger-keeper/<Lane>.md` (mission round 1, wave `ledger-keeper-r1-w1`). Lane: `SuccessorProjection`.

Observed:
- `readForSuccessor(ledgerPath, expectedParentRun, policy, includeBodies=false)` (:726).
  Default per-entry `{seq, kind, title, createdAt, sha256}` (:741); top-level `{schema, parentRunId, entryCount, bytes, entries}`
  (+`omitted` when capped) :744-753; source sliced to newest 16 (:738).
- `--include-bodies` = `BODIES_PROJECTION "bodies-v1"` (:723), whole store, adds body/axis/evidence/createdByRun + top-level parentSessionId (:740,:754).
- `SUCCESSOR_MAX_ENTRIES = 16` (:719); `omitted = entryCount - tail` emitted only when >0 (:746,:752); no byte cap at the module layer —
  the 1 KiB cap is per consuming surface (hook status line `digestMaxBytes` 1024; wave-context `MAX_REFINEMENT_BYTES` 1024).
- `readValidatedGeneration` (:691-712): one `readLedger`, validate **before** the empty check (wrong-schema empty → invalid, not absent),
  empty → `no ledger state`, parent mismatch → `identity binding refused: ledger parent is X, successor expected Y` (CLI exit 2).

Changed: nothing. Unknowns: the package digest reimplements the read rather than calling `readForSuccessor` (unification undecided in source).

Report: `reports/ledger-keeper/SuccessorProjection.md`.
