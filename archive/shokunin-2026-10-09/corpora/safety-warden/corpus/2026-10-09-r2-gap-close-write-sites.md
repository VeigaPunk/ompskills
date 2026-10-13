# r2-gap-close-write-sites — r2-gap-close-write-sites — close writes nothing; :906 shape confirmed

Asked: do the close/status legs write, and is the `:906` post-open refusal shape as the card says?
Source: `sighting/tower-fleet.mjs:1151-1233,892-901,906-907,931,1209,1223,1298-1305`; card `:98,157-175`. Lane: `GapCloseWriteSites`.

- Eight `close` legs (absent mission, live row without `--force` → `PANE_LIVE`, `--force` → completed, retired row, `--mission` scoping, `UNKNOWN_MISSION`, live sibling) and one `status` leg: every leg's `state`/`wt`/`ufo` snapshot (`type|size|mtime_ns|ino|nlink|sha256`) was byte-identical before/after — **`close`/`status` write nothing**.
- `:906` refusal re-driven with a `fleet.json` symlink planted on the wall's `open`: `exit 2`, stdout 0 bytes, `INVALID_SPEC` "fleet state … is a symlink — refusing a write through it", wall log shows `open`/`status --lite`/`launch` **before** the refusal, no `fleet.json` written; the no-hook control exits 0 and writes `fleet.json`, so the refusal is attributable.
- Static: `verbClose` has zero fs primitives; `:906` sits after the per-mission catch and before `emitJson`.

## Unknowns
- Real tmux wall/pane liveness not touched (stub only); the printed `git worktree remove` not executed; `COMPLETE_FAILED` not re-driven.
