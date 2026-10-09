# append-semantics — `appendEntry` contract

Asked: the argument list, genesis vs parent re-confirm, session-rebind/mission rules, the bounds order,
CLI mapping, and probes. Anchor: `ufo-fsd-alpha@5ace2559`; `scripts/primeagent-refinement-ledger.mjs` sha256 `ae69c40c7e774161812bbed3b34964978bb2d204b8daf19721ab5dd54e145096`; `config/primeagent-assimilation.json` sha256 `d6348cabfcbf3e8195e8335eb1dd3578681f644770f10dd3efdc21dc58439674`. Source: `reports/ledger-keeper/<Lane>.md` (mission round 1, wave `ledger-keeper-r1-w1`). Lane: `AppendSemantics` (reviewer).

Observed (`appendEntry(ledgerPath, input, policy, parentSessionId = null)` :613 → `{ok:true, entry, bytes}` :682):
- Order: `readLedger` (ENOENT → empty genesis) → `validateEntryShape` :617 → session bound 128 + screen :623-631 →
  mission shape+screen+differing-mission refusal :639-649 (idempotent in-memory re-bind :650) →
  genesis founds run/session/mission/createdAt :652-656 vs later-parent run-scope refusal :657 → session-rebind
  strictness: bound store refuses a differing session :667, session-less store refuses **any** late bind :670,
  omission permitted :664 → seq/prev/digest :674-676 → `validateLedger` candidate :678 → `writeLedgerAtomic` :680 (only disk mutation).
- CLI `append` :1472-1491: `--run`→createdByRun, `--session`→4th arg, `--mission/--kind/--axis/--title/--body`, `--evidence` comma-split,
  `--created-at` default `new Date().toISOString()`; success `{appended, sha256, bytes}`.
- Probes: genesis/differing-run/differing-mission/differing-session each typed exit 2 with store hash **byte-identical
  after every refusal** (zero mutation); credential title refused at screening; `2026-02-30` refused; unknown flag refused.

Changed: nothing. Note: in-memory mission re-bind precedes run-scope refusal (zero disk effect).

Report: `reports/ledger-keeper/AppendSemantics.md`.
