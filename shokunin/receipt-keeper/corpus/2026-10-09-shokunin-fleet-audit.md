# shokunin-fleet-audit — Reconstruction of fleet shokunin

Source: r1 lane `ShokuninFleetAudit` (fleet `shokunin3`, mission `receipt-keeper`, wave `receipt-keeper-r1-w1`); anchor launcher `sighting/tower-fleet.mjs` @ `ada7a90` (sha256 `80f0814e…`).

## Asked

Cross-index fleet `shokunin` (8 missions).

## Observed

- Identity consistent: spec ids = fleet.json ids = prompts = sessions; all 8 `tower/shokunin/*` tips are ancestors of main with merge commits.
- fleet.json is launch-time only: every mission shows phase working, terminal false — outcome must come from rounds/waves/reports/git.
- Receipt-vs-git drift: corpus counts lag commits by one (wave-smith r2 says 30, branch tip `84074ac` has 31; skill-scribe r1 24 vs `3a0cad9` 25; test-smith r1 26 vs `57ca282` 27); wall-watcher r2 cites `cf1e83c` but tip `86b7124` is in no receipt.
- Post-receipt main commits `ada7a90` and `87c351a` add corpus entries cited by no receipt; wave-smith `…r3-reverification…` entry has no receipt, wave or report.
- route-auditor: 26 lanes → 13 entries, stopped at r1.
- Three wave-artifact shapes coexist (payload-only; plan/dispatch/err; assignments/dispatch-result).

## Unknowns

- Per-wave counts-vs-report parity only spot-checked.
