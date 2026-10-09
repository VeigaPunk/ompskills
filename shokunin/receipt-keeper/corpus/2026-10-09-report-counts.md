# report-counts — Lane-report completeness vs registries vs receipts

Source: r1 lane `ReportCounts` (fleet `shokunin3`, mission `receipt-keeper`, wave `receipt-keeper-r1-w1`); anchor launcher `sighting/tower-fleet.mjs` @ `ada7a90` (sha256 `80f0814e…`).

## Asked

Do report files, registries, spec items and receipt claims agree?

## Observed

- 52 report dirs: 36 name-identical, 16 non-reconciling.
- HIGH: `tower1/rounds/tf-audit-wall-r1.md:37-45` names 9 FAIL lanes; disk has 7 (`L1BoundCritic29`, `WallVerbsReviewer21` read PASS). Header count 25/7 matches disk; the named list does not.
- tf-audit-routing-r1 header 8 CLEAN/24 CWG/0 VIOLATION vs table+disk 8/23/1 BY-LUCK (lane 03).
- tf-audit-launcher r2 overwrote r1 registry rows (`SwarmCritic10/14`, `SwarmSentinel11`): registry 45 members, disk 48 `.md` incl. three `*-2.md` with no row. tf-launcher avoided it via `swarm-registry-r1.json`.
- Unreceipted registries (tf-wavetest-priors, towerprobe band-point scopes) are fixtures/probe artifacts.
- Name-level joins break where lanes renamed their files (`point-NN-*`, `r1-*`, `lane-NN-*`); counts may still reconcile.

## Unknowns

- Only the 9 named wall lanes were reread.
