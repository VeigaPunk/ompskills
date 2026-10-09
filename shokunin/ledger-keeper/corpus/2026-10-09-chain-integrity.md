# chain-integrity — mutation probe of the sha256 chain

Asked (by mutation): prove the chain, the prune re-anchor, successor-reset, and the residual limits.
Anchor: `ufo-fsd-alpha@5ace2559`; `scripts/primeagent-refinement-ledger.mjs` sha256 `ae69c40c7e774161812bbed3b34964978bb2d204b8daf19721ab5dd54e145096`; `config/primeagent-assimilation.json` sha256 `d6348cabfcbf3e8195e8335eb1dd3578681f644770f10dd3efdc21dc58439674`. Source: `reports/ledger-keeper/<Lane>.md` (mission round 1, wave `ledger-keeper-r1-w1`). Lane: `ChainIntegrity` (mutation-tester).

Observed (all under a scratch root with a real config copy; every mutation restored byte-identically):
- Killed: entry-body tamper → `sha256 chain broken at seq 1`; entry-`sha256` tamper → `… seq 2`; entry reorder →
  `… seq 2`; drop-genesis → `… seq 2`; store unknown key → `store carries 1 key(s) outside the ledger schema`;
  credential-shaped `parentRunId` → writer-coherence `entry seq 1 was written by run-A, not the parent run run-B`;
  credential `parentSessionId` → `ledger lineage refused: matches credential pattern "sk-ant-…"`; 129-char session → shape refusal.
- Survived (coverage findings): tampering only `parentSessionId` or top-level `createdAt` validates (`ok`) —
  top-level lineage is **not** chain-covered; a **full re-chain** (body+createdAt+lineage rewritten, all links recomputed) validates — the chain is unkeyed with no external anchor.
- `prune` re-anchors retained entries at GENESIS (`prev=null`), preserving `seq`, changing every retained hash; `keep 0` nulls lineage.
- `successor-reset` archives validated bytes byte-identically, then removes the live file only after
  `canonical(live)===canonical(read)`.

Changed: nothing. Residual limits: re-signing writer wins; no cross-generation link; only newest 3 managed slots kept.

Report: `reports/ledger-keeper/ChainIntegrity.md`.
