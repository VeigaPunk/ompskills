# receipt-slots-tower1 — Receipt slot census, tower1 (26 receipts)

Source: r1 lane `ReceiptSlotsTower1` (fleet `shokunin3`, mission `receipt-keeper`, wave `receipt-keeper-r1-w1`); anchor launcher `sighting/tower-fleet.mjs` @ `ada7a90` (sha256 `80f0814e…`).

## Asked

What headings/slots tower1 receipts actually use.

## Observed

- H1 forms: bare 12, suffixed 7, `round receipt —` 4, lowercase 1, middot 2.
- Modal H2 core (12 files): axis, method, wave, lane, evidence, decision; full 8 (+explicit accepted, rejected) in 7.
- Slot presence /26: axis 21, method 18, wave 23, lane 24, accepted 23, rejected 16, evidence 25, decision 23 (3 carry the decision inline).
- Lane outcome form: explicit N/M 17, verdict split 5, spawn-only 2, no wave 2. STOP 15 / CONTINUE 11.
- Internal contradictions: tf-launcher-r2 H2 says 15/16, header and body 16/16; tf-smokedoc-r2 lane budget 17 vs 16 spent.
- No machine-parsable accepted/rejected counts anywhere — extract by slot regex.

## Unknowns

- Accept/reject placement is judgment-based.
