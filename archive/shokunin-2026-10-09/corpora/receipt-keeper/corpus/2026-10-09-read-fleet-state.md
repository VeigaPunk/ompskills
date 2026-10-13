# read-fleet-state — readFleetState and its two callers

Source: r1 lane `ReadFleetStateUse` (fleet `shokunin3`, mission `receipt-keeper`, wave `receipt-keeper-r1-w1`); anchor launcher `sighting/tower-fleet.mjs` @ `ada7a90` (sha256 `80f0814e…`).
L1 re-verified: lines 725 and 1008 read at HEAD.

## Asked

How the launcher reads fleet.json back.

## Observed

- `readFleetState` :583-593: missing → `null`; JSON parse error → warn `fleet state <path> is unreadable (...) — continuing without it` → `null`; non-object → `null`. Never throws.
- Callers: `verbLaunch` :725 builds `previousById` from `.missions`; `verbStatus` :1008. `verbClose` does **not** call it.
- Adoption carry-over :770-774: when a wall row already owns the run id, the prior record's `launchResult` is copied and `launchResultFrom: "prior-state"` set, so a relaunch does not lose what the first launch saw.
- Observed `launchResultFrom` count across all six fleet.json: 0 (no adopted relaunch recorded).

## Unknowns

- Malformed `missions` entries (non-array) may throw in `.map` [INFERENCE].
