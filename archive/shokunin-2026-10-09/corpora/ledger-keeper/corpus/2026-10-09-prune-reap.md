# prune-reap — `pruneLedger` identity parity and `reapLedgerTemps`

Asked: prune's identity parity, the keep-0 fix, the genesis re-anchor, CLI mapping, and reap's shapes/refusals.
Anchor: `ufo-fsd-alpha@5ace2559`; `scripts/primeagent-refinement-ledger.mjs` sha256 `ae69c40c7e774161812bbed3b34964978bb2d204b8daf19721ab5dd54e145096`. Source: `reports/ledger-keeper/<Lane>.md` (mission round 1, wave `ledger-keeper-r1-w1`). Lane: `PruneReap` (reviewer).

Observed (`pruneLedger(ledgerPath, keep, policy, expectedParentRun = null)` :1241):
- Gate matrix (all executed): missing+none → legacy no-op `{pruned:0,remaining:0}` exit 0 (no file); missing+explicit → refuse;
  non-empty+none → `prune requires --expect-parent-run for a non-empty ledger …`; non-empty+mismatch → `identity binding refused: …`;
  empty+explicit → `empty store has no parent to match`; empty+none → no-op.
- Precedence: `--keep` integer check first (:1244); full validation **before** identity (:1251-1254, corruption named first);
  identity gate **before** the no-op early-return. Refusals are zero-mutation.
- keep-0 fix (:1268-1269): `keep===0 ? [] : slice(-keep)`; executed pre-fix hazard `[1,2,3].slice(-0).length===3`.
- Re-anchor (:1270-1279): retained tail re-signed from `prev=null` (GENESIS), `seq` preserved, lineage nulled only when `kept.length===0`.
- CLI :1518-1524: `Number(flags.keep)`, `expect-parent-run ?? null` (not hard-required — keeps the missing-store no-op reachable);
  `--keep=` empty operand refuses at the parser (:1383-1391).
- `reapLedgerTemps` (:566-611): matches exactly the two producible tmp shapes (legacy `.tmp-<pid>`, r21 `.<pid>.<v4-uuid>.tmp`);
  lookalikes survive; lstat-no-follow; unlink removes the link not the target; dirs/sockets refused, never recursed; ENOENT races skipped;
  missing dir = no-op; deliberately **no** reap-on-open (would delete a live writer's tmp).

Changed: nothing. Unknowns: the true ENOENT-continue interleavings (read + doc claims, not executed live);
pre-r21 V1/V2/V3 exploits adopted from the doc (pre-r21 code is gone).

Report: `reports/ledger-keeper/PruneReap.md`.
