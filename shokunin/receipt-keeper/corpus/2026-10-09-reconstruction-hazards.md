# reconstruction-hazards — Fifteen ways a fleet dir misleads an auditor

Source: r1 lane `ReconstructionHazards` (fleet `shokunin3`, mission `receipt-keeper`, wave `receipt-keeper-r1-w1`); anchor launcher `sighting/tower-fleet.mjs` @ `ada7a90` (sha256 `80f0814e…`).

## Asked

Adversarial hazards in reconstructing a past fleet, each with a check.

## Observed

HIGH: H1 fleet.json overwritten whole each launch (earlier failures vanish) → check transcripts for prior launch output. H2 out-of-band writes (`tower1` `reconciledAt`) → flag keys no writer emits; compare mtimes. H3 status `ok:true` literal → judge reconciliation arrays, not `ok`. H4 receipts are unparsed prose + prefix matcher → verify claims against disk. H5 `launchResult` may be carried from prior state → check `launchResultFrom`. H6 no failure fields anywhere; the one real LAUNCH_FAILED survives only in prose/transcripts.
MEDIUM: H7 receipt in another fleet dir (`tf-safety-r2`) → search all `rounds/`. H8 paneIds reused across fleets. H9 19/59 registries all-null; cumulative registries mislabel waves. H10 receipt lane counts disagree with registry/dir (tf-audit-launcher 32/16 vs 45 members vs 48 files). H11 deliverables live in worktrees/git, not the state dir.
LOW: H12 `warnings: []` is not evidence of none. H13 `RECONCILE_UNATTESTED_STOP` is wall data. H14 no spec.json → status unusable for that dir. H15 empty session dir (tf-audit-safety) — sessions only prove what reached omp.

## Unknowns

- Out-of-band writer identity; launcher copy (main 1326 lines dirty vs worktree 1306) per launch.
