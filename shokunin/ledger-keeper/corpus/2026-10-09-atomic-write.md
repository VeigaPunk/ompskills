# atomic-write — write/read discipline and the residual window

Asked (adversarially): `writeLedgerAtomic`, the read fd discipline, the documented TOCTOU residual,
and what an attacker can/cannot do. Anchor: `ufo-fsd-alpha@5ace2559`; `scripts/primeagent-refinement-ledger.mjs` sha256 `ae69c40c7e774161812bbed3b34964978bb2d204b8daf19721ab5dd54e145096`. Source: `reports/ledger-keeper/<Lane>.md` (mission round 1, wave `ledger-keeper-r1-w1`). Lane: `AtomicWrite` (sentinel).

Observed:
- `writeLedgerAtomic` (:514-555): tmp `<ledger>.<pid>.<uuid-v4>.tmp` (CSPRNG :516); create
  `O_WRONLY|O_CREAT|O_EXCL|O_NOFOLLOW` 0600 (:520); write through the owned fd (:527); `lstat` regular-file gate (:530-536);
  `renameSync` (:538); own-tmp cleanup only while `!renamed && !disarmCleanup` (:543-553). Store lands 0600.
- `readLedger` (:457-495) is the only store open besides the writer: `O_RDONLY|O_NOFOLLOW` (:468), ENOENT→missing (:470),
  ELOOP→`ledger path is a symlink` (:471), fstat-regular (:475), `readFileSync(fd)` (:479). Every read path inherits it;
  a symlinked parent dir is inside the trust boundary.
- **No `fsync` anywhere** (grep exit 1): guarantee is process-crash atomicity, not power-loss durability.
- Residual (:508-513; doc :940-948): an active dir-writer can swap the tmp pathname after the pre-rename lstat;
  detected (typed refusal / next-read ELOOP / chain recompute), never silent; that is the trusted-operator boundary.
- CANNOT without dir-write: predict the tmp name, hijack create (EEXIST/ELOOP), make readers follow a store symlink,
  revive legacy `.tmp-<pid>`, force unlink of foreign objects, or write bytes outside the dir. CAN with dir-write:
  DoS reads/pathname swaps/truncate — all degrading to typed refusals or `chain-invalid`.
- Asymmetries vs the hook mirror (in-boundary, low): `readLedger` lacks `O_NONBLOCK` (a planted FIFO blocks open) and has no pre-read size gate.

Changed: nothing (report-only). Unknowns: post-lstat foreign-regular swap not race-executed here; S8 multi-writer deferred.

Report: `reports/ledger-keeper/AtomicWrite.md`.
