# boundary-map — receipt-keeper's boundary with neighbouring shokunin

Source: r1 lane `BoundaryMap` (fleet `shokunin3`, mission `receipt-keeper`, wave `receipt-keeper-r1-w1`); anchor launcher `sighting/tower-fleet.mjs` @ `ada7a90` (sha256 `80f0814e…`).

## Asked

Non-overlap with ledger-keeper, mission-keeper, fleet-warden, evidence-auditor, wave-smith, wall-watcher.

## Observed

- Split: producer/enforcer cards own what must happen while a fleet runs; receipt-keeper owns what the recorded bytes mean afterwards and what they honestly support.
- mission-keeper (highest overlap): owns receipt *prescription* (`l1-prompt.md` step 7, path, N rule). receipt-keeper owns observed receipts and the observed-vs-required delta.
- fleet-warden: owns why/when fleet.json is written and LAUNCH_PARTIAL fires. receipt-keeper owns what a past fleet.json's fields record.
- wave-smith: validator legality and outputs. receipt-keeper: what a past `waves/` file records.
- wall-watcher: wall CLI/manifest. receipt-keeper: the pane history a fleet recorded and its join to the manifest.
- ledger-keeper: the refinement ledger (separate store). evidence-auditor: general admissibility.

## Unknowns

- None material.
