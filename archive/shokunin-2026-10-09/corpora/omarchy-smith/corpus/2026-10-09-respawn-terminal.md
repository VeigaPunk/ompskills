# 2026-10-09 — respawn-terminal contract (RespawnTerminal)

**Asked:** the full `respawn-terminal` verb contract.

## Observed

- Dispatch (`ufo-sighting.mjs:4511-4517`): no command args
  (`INVALID_ARGUMENT`); only `--geometry` accepted — and its value is NOT
  validated at dispatch: `parseGeometry` (`:1191`) runs **after** the client
  is detached and a new terminal launched. Format `WIDTHxHEIGHT`, lowercase
  `x` only.
- Order (~`:2828-2880`): `WALL_ABSENT`/`FOREIGN_SESSION` → `reconcileLocked`
  (may kill-pane/respawn-pane -k/kill-window — wall-watcher territory) →
  `DUPLICATE_CLIENTS` (`:2843`) → `continuitySnapshot` →
  `resolveTerminalOnce` → **`detach-client` (`:2848`) →
  `launchOrFocusAttach` (`:2854`) → `waitForOneClient` (`:2855`) →
  `resolveAttachedGeometry` (`:2861`)** → `applyLiveLayouts` (`:2870`) →
  `assertContinuity` (`:2873`) → `writeManifest` (`:2875`).
- Spawn: same omarchy-or-xdg branch as attach (detached spawn, confirm on
  spawn or 2 s). The resolved `desktopId` is never used for the launch.
- `resolveAttachedGeometry` (`:2774-2790`): `!terminalPid` →
  `TERMINAL_PID_UNAVAILABLE` FIRST, regardless of `--geometry`. Geometry
  source priority: override → hyprland-client pixel size → `selectedGeometry`
  (tmux cells → cached → default). `CAP_EXCEEDED` (`:2786`) when
  `liveMissionsForFleet(state,null).length > geometry.cap` (strict `>`,
  default window only) — checked AFTER attach; refusals here are
  post-mutation (client already detached, terminal already spawned).
- Return: `display_client_replaced` is declared (`surface.mjs:171`) but
  **never emitted** — success returns `getStatus()` +
  `respawnTerminal:{preserved:true, missionCount, paneProcessCount,
  previousClientPid}`.
- Test: `ufo-sighting.test.js:1110-1172` is the only respawn happy-path test
  (panes byte-identical, launcher called twice); attach-timeout case pinned.
  TERMINAL_PID_UNAVAILABLE / CAP_EXCEEDED / INVALID_GEOMETRY /
  DUPLICATE_CLIENTS on respawn are NOT tested.

## Unknowns

- Whether the old window closes after detach (governs how often the
  collision fallback fires).
- Terminal pid match uses the resolver command basename; launch uses the
  omarchy launcher — mismatch possible [INFERENCE, unexercised].

Confidence: high for dispatch/order/pid-first/priority/cap/return shape;
medium for post-failure states.
