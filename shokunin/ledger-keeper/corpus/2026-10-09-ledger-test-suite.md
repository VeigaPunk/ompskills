# ledger-test-suite — what the 105-case ledger suite pins

Asked: the harness, per-group pins, and deliberate gaps. Anchor: `ufo-fsd-alpha@5ace2559`; `scripts/primeagent-refinement-ledger.mjs` sha256 `ae69c40c7e774161812bbed3b34964978bb2d204b8daf19721ab5dd54e145096`. Source: `reports/ledger-keeper/<Lane>.md` (mission round 1, wave `ledger-keeper-r1-w1`). Lane: `LedgerTestSuite` (reviewer).
Live: `node --test tests/primeagent-refinement-ledger.test.js` → 105/105 pass, exit 0, 3021 ms.

Observed:
- `node:test` + `assert/strict`; 105 flat `test()` cases, zero skip/only/todo; `tmpLedger()`/`entryInput()`/`cli(spawnSync)`;
  ~13 tests inject races via `syncBuiltinESMExports`.
- Groups: core store r01-r02 (:63-273); r07/r08 read-side coherence (:296-570); r17 credential corpus (:573);
  r19 policy floor + projection (:646-828); r20 lineage integrity (:848-1151); r21 atomic write + residue (:1169-1557);
  r22 S11 retention + F1 (:1587-1965); r23 archive observability (:2031-2348); r24 machine contract (:2416-2809);
  r25 status (:2865-3397); SUB-7 tail (:3433-3509).
- Deliberate gaps: canonical write-time cap refusals (64/4096/120/8/200) never exercised; canonical maxTotalBytes 65536 API-only;
  no real multi-process writer (S8 deferred); CLI `--mission`/`--evidence`/default-createdAt unpinned; ZWJ-only screening pin
  (bidi arm unpinned); CLI `validate` on a chain-broken store unpinned; `--include-archives`+`--include-bodies`+`--json` untested.
- Doc drift: doc's "99 in the ledger suite" is stale (105); the r24 frozen key table omits the additive `omitted`/`archives` keys;
  the r01/r02 per-round counts are unreconcilable (squashed history).

Changed: nothing. Unknowns: provenance of the "pristine r23" goldens (no pre-SUB-7 blob in git).

Report: `reports/ledger-keeper/LedgerTestSuite.md`.
