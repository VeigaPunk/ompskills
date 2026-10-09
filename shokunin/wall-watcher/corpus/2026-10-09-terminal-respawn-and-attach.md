# 2026-10-09 — terminal trigger, attach, and respawn

**Asked:** document terminal respawn / launcher-trigger behaviour and reconcile the doc with the code.

**Sources (exact; `ufo` = `/home/vgpnk/Projects/ufo-fsd-alpha`)**

- `ufo/docs/ufo-sighting-terminal-respawn.md` (44-49).
- `ufo/scripts/ufo-sighting` (shim) `:17, 26-35, 95` — the doc's command line, the attach route, the fall-through.
- `ufo/scripts/ufo-sighting.mjs:4399-4402` — the `INVALID_ATTACH_ROUTE` guard; `:4444-4449` — `open`;
  `:4511-4516` — `respawn-terminal`; `:2731-2757` — `launchOrFocusAttach`; `:2704-2726` — `spawnDetached`/`launchTerminal`;
  `:2854, 2807` — the two callers; `:2759-2771` — `waitForOneClient`.
- `ufo/scripts/ufo-sighting-lib/base.mjs:195, 71` — `terminalLauncher` projection, `DEFAULT_ATTACH_TIMEOUT_MS`.
- `ufo/scripts/ufo-sighting-lib/surface.mjs:171, 260, 281` — `respawn-terminal` descriptor + usage.
- `ufo/config/ufo.json:56` — `terminalLauncher: "omarchy-launch-or-focus-tui"`.
- `ufo/docs/BEHAVIOR-MATRIX.md:222`.
- Live: `tmux list-clients`, `tmux show-options -t ufo_sighting @ufo_terminal_pid`.

**Observed**

- Chain: (1a) operator runs the shim / a trigger phrase; (1b) the tower launcher triggers the wall only via
  `wallCli(spec, "open")` — it never attaches or respawns (no `terminalLauncher`/`UFO_SIGHTING_ATTACH`/
  `respawn` occurrence in `tower-fleet.mjs`). (2) `main()` guards `UFO_SIGHTING_ATTACH=1` with zero argv
  (`INVALID_ATTACH_ROUTE`, "the public shim owns terminal attachment"). (3) `open`/`respawn-terminal` call
  `launchOrFocusAttach`: exactly one client → focus it (`hyprctl dispatch focuswindow pid:^(PID)$`);
  >1 → `DUPLICATE_CLIENTS`; 0 → launch `UFO_SIGHTING_LAUNCHER || sighting.terminalLauncher` (config
  `omarchy-launch-or-focus-tui`) with `UFO_SIGHTING_ATTACH=1`, else fall back to
  `xdg-terminal-exec --app-id org.omarchy.ufo-sighting -e <shim>`. (4) The shim's attach route validates
  `UFO_SIGHTING_TMUX_SOCKET` against `^[A-Za-z0-9_.-]{1,80}$` and runs
  `tmux [-L <socket>] attach-session -d -t 'ufo_sighting:1'`.
- `respawn-terminal [--geometry WIDTHxHEIGHT]` is the display-recovery verb (server + mission panes alive,
  no client); it never runs `kill-session`. The doc positions `open` as the recovery command too; it does
  **not** state the flag surface, the trigger rule, or the geometry precedence (those are source-only).
- `waitForOneClient` blocks (50 ms poll) up to `UFO_SIGHTING_ATTACH_TIMEOUT_MS` else
  `DEFAULT_ATTACH_TIMEOUT_MS = 10 s`, then `ATTACH_TIMEOUT`.
- Socket isolation: `UFO_SIGHTING_TMUX_SOCKET` is honoured by every tmux-touching verb via `tmuxPrefix()`
  (so a test socket never touches the operator wall) and is validated in both the shim and the module.
- Trigger path: `sighting.triggers` phrases call `openWall` only; `autoOpenWall` false + missing wall →
  `WALL_NOT_OPEN` ("display existence, not work origination").

**Changed:** nothing.

**Unknown:** whether the shim's non-`realpath`-canonical `ROOT` can diverge from the module's
`realpathSync` `ROOT` in a symlinked-parent setup (theoretical).