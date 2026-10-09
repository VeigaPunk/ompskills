# round-receipts-fn — roundReceipts matcher, sort, and prefix hazard

Source: r1 lane `RoundReceiptsFn` (fleet `shokunin3`, mission `receipt-keeper`, wave `receipt-keeper-r1-w1`); anchor launcher `sighting/tower-fleet.mjs` @ `ada7a90` (sha256 `80f0814e…`).

## Asked

How the launcher lists a mission's receipts, against real state.

## Observed

- :951-958: `readdirSync(<stateDir>/rounds)` filtered by `startsWith(missionId+"-r") && endsWith(".md")`, sorted by `Number(/r(\d+)\.md$/ ?? 0)`, mapped to full paths; callers take basenames (:1056, :1084, :1099). No `isFile`, no digit check on the remainder; absent `rounds/` → `[]`.
- Non-numeric names (`x-rc.md`, `x-r1b.md`, `x-r.md`) sort as 0 (first); `x-r01` ties `x-r1`.
- Real data: zero mission-id prefix pairs among all fleet.json/spec ids. Dormant collisions: a mission id `tf-audit` would claim `tf-audit-routing-r{1,2}.md`; `tf-safety` would claim `tf-safety-r2-r1.md`.
- `tf-safety-r2` is in tower1 spec/fleet.json but its receipt lives in `tower1-safety-r2/rounds/`, so `status --spec tower1/spec.json` shows `rounds: []` for it.
- Status reads filenames only, never receipt contents (doc drift: tower SKILL says "reads … round receipts").

## Unknowns

- readdir ordering on ties is filesystem-dependent [INFERENCE].
