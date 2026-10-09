# continue-stop-ledger — Every round's continue/stop decision across 59 receipts

Source: r1 lane `ContinueStopLedger` (fleet `shokunin3`, mission `receipt-keeper`, wave `receipt-keeper-r1-w1`); anchor launcher `sighting/tower-fleet.mjs` @ `ada7a90` (sha256 `80f0814e…`).

## Asked

Classify every decision and check consistency with ceilings.

## Observed

- Contract: `sighting/l1-prompt.md:178-180` (saturation, blocked with a named cause, or round ceiling — lanes or rounds, whichever first); `<N>` = 1 + existing receipt count (:139-140).
- 59 receipts / 33 missions / 5 fleets: 26 continue (all r1) / 33 stop. Stop causes: saturation only 10, round ceiling only 15, both 8, blocked 0, lane ceiling 0, unstated 0.
- Consistency: no r2 under ceiling 1; no r1 "continue" without an r2; no premature ceiling claim.
- Hazards: tf-smokedoc-r2 header "rounds used 1 of 2" contradicts its own position; tf-safety-r2 has two fleet.json records with ceilings 2 (tower1) and 1 (tower1-safety-r2) — its receipt cites 1; the `-r2` mission suffix is a relaunch generation, not a round.
- Some L1s distinguish "stop at ceiling, not saturated" — record both fields separately when auditing.

## Unknowns

- Blocked and lane-ceiling branches never exercised (0/59).
