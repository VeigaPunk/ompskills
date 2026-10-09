# wall-cross-ref — Joining fleet.json to the wall manifest

Source: r1 lane `WallCrossRef` (fleet `shokunin3`, mission `receipt-keeper`, wave `receipt-keeper-r1-w1`); anchor launcher `sighting/tower-fleet.mjs` @ `ada7a90` (sha256 `80f0814e…`).

## Asked

Can fleet.json paneIds and states be trusted later?

## Observed

- Join by `runId` (= fleet.json mission id), not the wall's `m_<hex>` missionId.
- paneId agrees on all 44 joined rows, but `%6-%11` are reused by stopped tf-* rows and live shokunin3 rows (different `panePid`); tmux server restarted 2026-10-09T18:34:57Z, so older `%N` no longer resolve. Identity needs (`paneId`, `panePid`, `@ufo_sighting_mission`) on live tmux, and only for live rows.
- fleet.json carries no `panePid` and no terminal state; terminal state lives only in the wall registry: `completed` = closed-with-note (may be a refusal), all 17 stopped rows carry `exitCode 129`, 5 also `RECONCILE_UNATTESTED_STOP`.
- `status --lite` strips `panePid` and caps lists at 50 — read raw `.ufo/sighting/manifest.json` for audits.

## Unknowns

- Causes of the 05:04:15Z stop cluster; three manifest sequences (4-6) missing.
