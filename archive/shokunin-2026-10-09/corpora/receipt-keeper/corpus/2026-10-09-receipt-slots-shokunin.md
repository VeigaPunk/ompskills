# receipt-slots-shokunin — Receipt slot census, shokunin + shokunin2 (31 receipts)

Source: r1 lane `ReceiptSlotsShokunin` (fleet `shokunin3`, mission `receipt-keeper`, wave `receipt-keeper-r1-w1`); anchor launcher `sighting/tower-fleet.mjs` @ `ada7a90` (sha256 `80f0814e…`).

## Asked

Slot coverage of the shokunin-era receipts.

## Observed

- Full 7-slot set (axes, wave plan, lane outcomes, accepted, rejected, verification dispatch, continue/stop) in 21/31.
- Counts: axes 29, wave plan 30, lane outcomes 30, accepted 29, rejected 27, verification 24, continue/stop 29.
- Lane N/M parseable in 30, all N=M. mission-keeper-r2 has none (L1 ran 4 lenses directly, N < waveMin).
- Gaps: fleet-warden r1/r2 lack axis and continue/stop headings (bullets only); 7 lack a verification heading (3 defer the card dispatch to r2 by design).
- 15 Continue (all r1 except route-auditor-r1, which stopped) / 16 Stop. H1 has 5 families.

## Unknowns

- godspeed-keeper-r2 verification line not found.
