# safety-r2-and-towerprobe — Single-mission fleets tower1-safety-r2 and towerprobe

Source: r1 lane `SafetyR2Towerprobe` (fleet `shokunin3`, mission `receipt-keeper`, wave `receipt-keeper-r1-w1`); anchor launcher `sighting/tower-fleet.mjs` @ `ada7a90` (sha256 `80f0814e…`).

## Asked

Reconstruct the two one-mission fleets.

## Observed

- tower1-safety-r2: fleet.json `fleet: "tower1"`, `stateDir` overridden (`fleet.json:7`); launched 03:05:52.794Z, 55 s before tower1's rewrite. One 18-lane read-only wave: 17 HOLD, 1 VIOLATED (F1 symlinked derived write paths, HIGH, at `60bf371`), F2/F3 LOW; STOP at ceiling 1. F1-F3 since fixed on main (`99af0eb`, `0bc1c79`, `6206db3`) — the verdict is stale for HEAD.
- Directory name ≠ `fleet` field ≠ registry fleet identity (wall attributes `tf-safety-r2` to `tower1`).
- towerprobe: ceiling 1, maxTime 1h; one 16-lane wave, one per band point; deliverable `5daeda4`. Headline: live `config/ufo.json` flapped `0e416f0a` → `7efc813b` (rollback 01:22:15Z) → `0e416f0a` (01:30:57Z). Two lane FAILs overridden to PASS by the L1. Session ended by sighup at 03:05:38Z, 111 min after launch (past 1h).

## Unknowns

- The original safety `--spec` file.
- Point-12 final PASS adjudication.
