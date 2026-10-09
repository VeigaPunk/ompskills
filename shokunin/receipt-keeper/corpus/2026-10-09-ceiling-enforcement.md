# ceiling-enforcement — roundCeiling and maxTime are not enforced

Source: r1 lane `CeilingEnforcement` (fleet `shokunin3`, mission `receipt-keeper`, wave `receipt-keeper-r1-w1`); anchor launcher `sighting/tower-fleet.mjs` @ `ada7a90` (sha256 `80f0814e…`).
L1 re-verified: lines 388-391, 436, 474, 915-916 grepped at HEAD.

## Asked

Is any ceiling enforced by code, and did missions exceed them?

## Observed

- `roundCeiling`: parsed :388-389, copied :915, rendered :436 — no code counts rounds. The validator has no round counter; its only cap is per wave.
- `maxTime`: parsed :390-391, copied :916, passed as `omp --max-time` :474. Sessions outlived it in shokunin (4h, +320 min), tower1 (3h, +45), towerprobe (1h, +51); zero post-cap activity; every `session_exit` is `sighup`, clustered in two teardown windows (external teardown [INFERENCE]).
- No mission exceeded `roundCeiling` (33 missions).
- `launchedAt` trails session start by up to 51 s — audit time from session records.
- No round/time overrun code path or record field exists.

## Unknowns

- What omp does internally with `--max-time`.
