# 2026-10-09 — autoOpenWall config/flag chain (AutoOpenWall)

**Asked:** `sighting.autoOpenWall` → `SIGHTING_CONFIG` → flags → consumers;
what `autoOpenWall=false` does to `launch`.

## Observed

- Config: `config/ufo.json:74` `autoOpenWall: true` → `base.mjs:154,202-203`
  `SIGHTING_CONFIG.autoOpenWall` + `autoOpenWallSource` (`"config"` boolean |
  `"default"`). Non-boolean silently coerces true at runtime — only
  `sync-ufo-contracts.mjs:1141-1142` rejects non-booleans.
- Flags: `resolveAutoOpenWall` (`ufo-sighting.mjs:2360-2370`);
  `--auto-open`/`--no-auto-open` declared for `open`, `launch`, `resume`
  only (`:4447,:4557,:4629`; `surface.mjs:65,76,92,190`); both flags →
  `INVALID_ARGUMENT`.
- Gate: `:2419` `!sessionExists && autoOpenWall !== true` → `WALL_NOT_OPEN`
  before `ensureOwnedSession`/`launchMissionLocked` — provisioning only.
  Test-pinned `ufo-sighting.test.js:4040-4058`: autoOpenWall=false + no
  session → launch refused, no manifest row, no mission, no tmux session,
  no terminal — a launched mission does NOT open a desktop terminal.
- Present-wall case: session exists → gate passes, and `openWall`
  (`:2799` re-gate) still focuses or spawns a terminal even with
  autoOpenWall=false unless `--no-open`. `autoOpenWallSource` is
  display-only.
- `fleet-dispatcher.mjs:8771,8780` always passes `--no-open`: queued
  launches never open a terminal, though they can provision a headless tmux
  session under config true.
- `twin` (`:3969`) calls `ensureOwnedSession` without consulting the flag —
  can recreate a missing session under autoOpenWall=false [INFERENCE,
  source-only].
- `run-omp-native-trial.mjs:1282-1299` inherits config; its separate gate
  `autoOpenL1Enabled` reads `autoRegisterInvokedNativeTrial`, not
  `autoOpenWall`.

## Unknowns

- Whether the twin provisioning bypass is reachable at runtime.
- No runtime execution; source and test reads only.

Confidence: high for resolution/gate/refusal (line-cited, test-pinned);
medium for twin bypass.
