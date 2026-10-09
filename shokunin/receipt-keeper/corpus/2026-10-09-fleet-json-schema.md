# fleet-json-schema — fleet.json top-level and per-mission record keys

Source: r1 lane `FleetJsonWriter` (fleet `shokunin3`, mission `receipt-keeper`, wave `receipt-keeper-r1-w1`); anchor launcher `sighting/tower-fleet.mjs` @ `ada7a90` (sha256 `80f0814e…`).
L1 re-verified: line numbers 737-754, 905-928 read at HEAD; key counts via jq.

## Asked

The exact fleet.json document `verbLaunch` writes.

## Observed

- Write: `writeFileSync(<stateDir>/fleet.json, JSON.stringify({...}, null, 2)+"\n")` at :907-928, guarded by `assertSafeWriteTarget` :906. One write per launch, after the mission loop.
- 13 top-level keys: `ok` (`failures.length===0`), `fleet`, `repo`, `ufoRoot`, `base`, `stateDir`, `worktreeRoot`, `roundCeiling`, `maxTime`, `band{waveMin,waveMax,roundLaneCeiling,maxConcurrentL1,windowPaneCeiling,l1Alias}` (from `loadBandAuthority`), `launchedAt` (ISO, stamped at write), `warnings`, `missions`.
- No top-level `failures`: it exists only in `--json` stdout (:931) and the LAUNCH_PARTIAL message (:946).
- Record literal :737-754, 16 keys: `id title axis worktree branch base promptPath skills paneId paneReused panePhase retired promptReused worktreeReused worktreeRecreated launchResult`.
- Conditional keys (absent unless set): `failure` :629, `secondaryFailure` :633, `worktreeMissing` :814, `launchResultFrom: "prior-state"` :773.
- `skills[]` = `{name, source}`; `source` null when no copy source found (:823-827).
- `launchResult` = raw parsed wall launch stdout (:887) or carried from prior fleet.json on adoption (:772).
- `--json` emit (:931) drops `launchResult`, adds `launchResultRecorded`, `verb`, `fleetStatePath`, `failures`; omits `repo`, `band`, `warnings`.

## Unknowns

- `--json` stdout never observed live.
- Which launcher revision wrote each on-disk file (see `fleet-json-schema-eras`).
