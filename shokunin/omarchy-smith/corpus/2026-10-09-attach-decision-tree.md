# 2026-10-09 — launchOrFocusAttach decision tree (LaunchOrFocusAttach)

**Asked:** the attach/launch decision tree at `ufo-sighting.mjs:2731-2757`
and how the two focus mechanisms differ.

## Observed

- Tree:
  1. `listClients` == 1 → `focusTerminalPid(overridePid ||
     terminalPidFromAncestor(client, terminal))`; return — no launch; the
     focus return value is **discarded** (`:2737`).
  2. > 1 → `DUPLICATE_CLIENTS` (`:2740`).
  3. 0 clients → `configured = env.UFO_SIGHTING_LAUNCHER ||
     SIGHTING_CONFIG.terminalLauncher`; `classCollision` = configured IS the
     default launcher AND `hyprlandTerminalObservations` non-empty
     (`:2743-2744`) → skips the omarchy launcher because
     `omarchy-launch-or-focus-tui` would FOCUS the stale same-class window,
     attach nothing, and `ATTACH_TIMEOUT`.
  4. `!classCollision && configured && commandExists` → `UNSAFE_LAUNCH_PATH`
     gate on SHIM_PATH only (`:2746`) → `launchTerminal(configured,
     [SHIM_PATH], {UFO_SIGHTING_ATTACH:"1"})`.
  5. else `xdg-terminal-exec` direct spawn `["--app-id", APP_ID, "-e",
     SHIM_PATH]`; missing binary → `TERMINAL_LAUNCHER_MISSING` (`:2752`).
- Two separate focus mechanisms: desktop-level (omarchy engine, Hyprland
  `address:` on regex class/title match) vs PID-level (wall's own
  `focuswindow pid:^(N)$` on the /proc-walked terminal pid). Only the PID
  path is used when a client is attached.
- Live probe: one attached tmux client (pid 8540) under the wall window
  (pid 8519, class `org.omarchy.ufo-sighting`) — branch 1 is the live path.
- Divergences found: exact-class guard vs class-or-title omarchy match;
  `TERMINAL_LAUNCHER_MISSING` misleading after a deliberate collision
  bypass; guard fails open on hyprctl error (`[]` → no collision);
  `UFO_SIGHTING_TEST_TERMINAL_PID` forces `classCollision` true with the
  default launcher; `UNSAFE_LAUNCH_PATH` gates SHIM_PATH on the omarchy
  branch only, the direct branch is ungated; `respawnTerminal` always
  detaches first so it never reaches branch 1.

## Unknowns

- Whether the space-form fallback defect produces a visible failure on this
  host (read-only; not spawned).
- Hyprland `pid:` selector grammar beyond the call site.

Confidence: high for the tree and mechanism separation; medium for
end-to-end defect effect.
