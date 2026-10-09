# tower1-fleet-audit — Reconstruction of fleet tower1 and its rewritten state

Source: r1 lane `Tower1FleetAudit` (fleet `shokunin3`, mission `receipt-keeper`, wave `receipt-keeper-r1-w1`); anchor launcher `sighting/tower-fleet.mjs` @ `ada7a90` (sha256 `80f0814e…`).
L1 re-verified: `jq '{reconciledAt,launchedAt,ok}' tower1/fleet.json`; `grep reconciledAt` in sighting/ and substrate scripts → no writer.

## Asked

Cross-index fleet `tower1` (16 missions).

## Observed

- 16 ids in spec.json and fleet.json, identical. All 15 original sessions start 01:18:58Z-01:19:20Z; `launchedAt` 01:19:22.918Z — no relaunch.
- `tf-audit-safety` has a prompt, a worktree, an empty session dir, and a `LAUNCH_FAILED` record seen **only** in tf-launcher transcript copies; it is absent from current spec.json and fleet.json.
- spec.json and fleet.json were both rewritten at 03:06:47Z (mtimes 2 ms apart), swapping `tf-audit-safety` for `tf-safety-r2` and adding top-level `reconciledAt: "2026-10-09T03:06:47.984Z"` — a key no repo or substrate code writes. Current file says `ok:true`: the original `ok:false` launch is lost.
- Likely cause of the failure: L1 ceiling 16 across fleets (towerprobe held one L1) [INFERENCE].

## Unknowns

- Writer of the 03:06:47Z rewrite.
- Original 01:19Z fleet.json not on disk.
