# live-fleet-shokunin3 — An in-progress fleet as a specimen

Source: r1 lane `LiveFleetShokunin3` (fleet `shokunin3`, mission `receipt-keeper`, wave `receipt-keeper-r1-w1`); anchor launcher `sighting/tower-fleet.mjs` @ `ada7a90` (sha256 `80f0814e…`).
L1 re-verified: `ls -la --time-style=full-iso .tower/fleets/shokunin3` read by the L1.

## Asked

What a live fleet dir looks like mid-run vs a completed one.

## Observed

- At 18:4xZ: spec.json, 10 prompts, `lanes-haiku.yml`, fleet.json (403,513 bytes, `ok:true`, 10 missions, mtime = `launchedAt` 18:38:10.258Z), `sessions/` (10), `waves/`, `reports/`, empty `rounds/`, `scratch/`.
- Prompt mtimes span 18:35:08-18:38:10Z, one per mission ~20 s apart; fleet.json lands last — a crash or kill mid-loop leaves panes/prompts/sessions with no fleet.json.
- `lanes-haiku.yml` is an operator `--config` overlay (named in spec `overlays`), not a launcher artifact. `scratch/` is L1-created.
- `rounds/` (mtime 18:38:03Z) predates fleet.json; the launcher never creates it — an L1 did.
- Wall: 10 shokunin3 rows, panes `%2..%11` matching fleet.json.
- `band.l1Alias` `m_strong` vs per-mission `l1Alias` `m_opus`/`m_swe` — the band field is the config default, not what each pane ran.

## Unknowns

- Round outcomes (in progress at snapshot).
