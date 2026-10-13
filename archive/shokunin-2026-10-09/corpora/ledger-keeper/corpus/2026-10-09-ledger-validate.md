# ledger-validate — `validateLedger` contract and precedence

Asked: every ordered check, refusal reason, the writer-coherence rule, "not chain-covered"
implications, and callers. Anchor: `ufo-fsd-alpha@5ace2559`; `scripts/primeagent-refinement-ledger.mjs` sha256 `ae69c40c7e774161812bbed3b34964978bb2d204b8daf19721ab5dd54e145096`; `config/primeagent-assimilation.json` sha256 `d6348cabfcbf3e8195e8335eb1dd3578681f644770f10dd3efdc21dc58439674`. Source: `reports/ledger-keeper/<Lane>.md` (mission round 1, wave `ledger-keeper-r1-w1`). Lane: `LedgerValidate`.

Observed (`validateLedger(store, policy)` :368-455, pure, `{ok:true, ledger, bytes}`):
1 root object; 2 `schema`; 3 `version===1`; 4 `STORE_KEYS` count; 5 `entries` array;
6 parentMissionId null-or-≤128; 7 parentSessionId null-or-≤128; 8 top-level createdAt canonical **iff non-empty**;
9 `maxEntries` (64, before per-entry work); 10 per-entry `validateEntryShape(..., STORED_ENTRY_KEYS)` labelled by seq (e.g. `entry 1: title violates ledger.maxTitleChars (120)`);
11 seq unique positive int (no contiguity). 12 sha256 chain over **array order** (`sha256 chain broken at seq N`);
13 empty side: all four lineage fields null; 14 non-empty: parentRunId non-empty ≤128 + **every** `createdByRun === parentRunId`
(`entry seq 2 was written by intruder-run, not the parent run probe-run-a`); 15 lineage credential screen (:444-450);
16 `maxTotalBytes` (65536) over **stored** canonical bytes.
Precedence (mutate-then-resign probes): shape/seq/chain → coherence → lineage screen → bytes.
`parentRunId` is deliberately excluded from check 15 (covered by 14 + per-entry screen).
Callers: append :678, readValidatedGeneration :700 (→ readForSuccessor/successorReset), archive scans :879,
prune :1253/:1290, CLI validate :1513, status :1573, `ufo-refinement-context.mjs:96`, package :351 (→ `chain-invalid`).

Finding (MED): `pruneLedger` has no live-bytes parity guard (successorReset does at :1208-1211); a concurrent
append acknowledged during prune can be lost. Report: `reports/ledger-keeper/LedgerValidate.md`.
