# prompt-round-receipts — tf-prompt change history: the prompt's 21 accepted moves

Item: `tf-prompt-r1.md` and `tf-prompt-r2.md` — the prompt's own change history.

Observed: r1 axis set {placeholder-closure, contract-consistency, executability, scope-honesty}; r2 axis set {landed-fidelity, invariant-preservation, patch-implementability}. r1 accepted 21 moves (executability ×11, contract-consistency ×5, scope-honesty ×5) in commits `10bea64` (+101/-38) and `332760e`; regressed no axis. r2 verified with commands and accepted nothing new → STOP (saturation + ceiling 2).
Rejected: the `| L1 route | @{{l1Alias}} |` row — unimplementable (renderer regexes letters-only; the digit-bearing value can neither render nor be detected; injected row shipped verbatim, exit 0); the row's prohibition (never pin an alias) was salvaged into step 4. Also rejected: launcher-side residuals (out of scope), two voice/clarity trims (clauses carry live contract).
Evidence ledger: pristine sha `df499cb4…` (5294 B) → final sha `4baa21b0…` (10534 B); launcher test `ALL CHECKS PASS` 73 ok; render leftovers []; live band 16/32/100.
Divergence noted: the receipt's "branch unmerged into main" is stale — merge `a842b2f` includes `332760e`; the current worktree file is 10877 B sha `c9f10a44…` (tf-prompt rewrite + the `cc0d61f` substrate-write-guard bullet).

Evidence: `PromptRoundReceipts.md`.
Unknowns: r2 `record`, sibling-branch namespace, and `run` payload probes were unverified by the receipt; reproduced from source.
