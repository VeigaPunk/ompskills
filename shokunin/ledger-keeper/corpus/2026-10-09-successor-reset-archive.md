# successor-reset-archive — reset guards and the generation-stamped namespace

Asked: `successorReset` guards, `defaultArchivePath`, `ARCHIVE_RETENTION`, the managed-name rule,
`MAX_MANAGED_BASENAME`, explicit-archive semantics, and crash symmetry. Anchor: `ufo-fsd-alpha@5ace2559`; `scripts/primeagent-refinement-ledger.mjs` sha256 `ae69c40c7e774161812bbed3b34964978bb2d204b8daf19721ab5dd54e145096`. Source: `reports/ledger-keeper/<Lane>.md` (mission round 1, wave `ledger-keeper-r1-w1`). Lane: `SuccessorResetArchive`.

Observed (`successorReset(ledgerPath, expectedParentRun, policy, archivePath=null, seams={})` :1113):
- Step 0 `readValidatedGeneration` (:1114/692) → read/validate/non-empty/parent-match.
- Default branch (:1129-1160): extensionless-ledger refusal, `managedBasenameExceedsBound` (120 **bytes**),
  `dest = defaultArchivePath(...)` (:1139), replay guard (only a validated byte-identical retry overwrites) :1141-1159.
- Shared guards: dest-outside-ledger-dir (effective realpath parents) :1162-1182; collapse guard :1183; effective-alias guard :1190.
- Commit: `writeLedgerAtomic(dest, read.ledger)` :1202 → **live-store-changed** refusal :1205-1211 → `rmSync` :1213.
- `defaultArchivePath` :816 = `<base-without-.json>.archive.<sha256(parentRunId) 64hex>.json` (:796-798) — raw runIds never touch a pathname.
- `ARCHIVE_RETENTION = 3` (:783; **not** in config); `pruneArchiveGenerations` (:906-936) sorts by intrinsic genesis `createdAt` → mtime → name,
  `excludeName` protects the just-written slot, `kept = slots.length - pruned` (honest count).
- `scanManagedArchiveSlots` (:845-893): exact managed names (`ARCHIVE_STAMP_HEX "[0-9a-f]{64}"`), lstat-no-follow, no-follow read-back,
  `validateLedger`, stamp identity, non-empty gate; refused slots are evidence, never deleted.
- Explicit `--archive` may not use ANY managed name and skips retention (:1220-1223) — but still passes containment/collapse/alias guards.
- Crash window leaves over-retention, never loss (:1219-1221).

Changed: nothing (no live CLI probe; behavior pinned by the suite). Unknowns: whether ARCHIVE_RETENTION/MAX_MANAGED_BASENAME should become policy keys (module constants today).

Report: `reports/ledger-keeper/SuccessorResetArchive.md`.
