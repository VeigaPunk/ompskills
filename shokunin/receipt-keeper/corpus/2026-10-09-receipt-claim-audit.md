# receipt-claim-audit — Procedure and results of auditing four receipts

Source: r1 lane `ReceiptClaimAudit` (fleet `shokunin3`, mission `receipt-keeper`, wave `receipt-keeper-r1-w1`); anchor launcher `sighting/tower-fleet.mjs` @ `ada7a90` (sha256 `80f0814e…`).

## Asked

Verify checkable claims in four receipts; derive a procedure.

## Observed

- 61 claims: 47 CONFIRM, 2 REFUTE, 12 UNCHECKABLE. Refutes: tf-launcher-r2 registry holds 32 members (16 R1 + 16 R2), not 16; towerprobe registry path is valid only under the fleet dir (`.tower/fleets/towerprobe/.ufo/scopes/…`), not the substrate.
- Band claims match the then-live working-tree `config/ufo.json` (sha `0e416f0a`), not committed HEAD (`7efc813b`) — live state must be time-scoped.
- Corpus counts are commit-scoped (ledger-keeper 32 at `3eb7e3a`, 33 at HEAD).
- Procedure: (1) pin revisions, `git show <rev>:<path>`; (2) name the path root (fleet dir / worktree / substrate); (3) re-hash anchors at anchor and HEAD; (4) registries: parse `.members`, per-round prefix subsets; (5) waves: plan `.counts`, payload `.taskCall.tasks|length`, spec `items|length`; (6) reports/corpus set-compare at the receipt's commit; (7) commits: `rev-list --count`, `merge-base --is-ancestor`; (8) live files: record sha at check time — mismatch is drift, not refutation; (9) `/tmp` outputs UNCHECKABLE; (10) disclose counting method; (11) CONFIRM/REFUTE/UNCHECKABLE at the pinned revision.

## Unknowns

- Append-only corpus history cannot be proven from git.
