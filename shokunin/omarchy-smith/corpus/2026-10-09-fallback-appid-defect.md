# 2026-10-09 — fallback xdg-terminal-exec spawn loses the appId

**Asked:** when `ufo-sighting` falls back to the direct `xdg-terminal-exec`
spawn (classCollision or missing omarchy launcher), does the spawned window
get the `org.omarchy.ufo-sighting` appId/class on this host, and why or why
not? (CardSmoke verification lane.)

## Answer

No — the window does not get the class. Two independent source facts:

## Observed

- `ufo-sighting.mjs:2753` (in `launchOrFocusAttach`, `$UFO_ROOT/scripts/`):
  the fallback branch spawns
  `launchTerminal("xdg-terminal-exec", ["--app-id", APP_ID, "-e", SHIM_PATH])`
  — the **space-separated** form. Reached when `classCollision`
  (`:2743-2744`: configured launcher is the default AND a same-class window
  already exists) or when the configured launcher fails `commandExists`
  (`:2745`); guarded only by `commandExists("xdg-terminal-exec")` →
  `TERMINAL_LAUNCHER_MISSING` (`:2752`).
- `/usr/bin/xdg-terminal-exec` (pacman 0.14.0) parse loop, `:1221`: the only
  app-id pattern is `--app-id=*` (equals form). A bare `--app-id` falls to
  the `-*` branch at `:1299` → `debug "discarding unknown option"` → `shift`.
  The next token `org.omarchy.ufo-sighting` matches `[!-]*` at `:1295` →
  `debug "found non-option"` → **`break`**: option processing stops and
  APP_ID becomes the first word of the command to exec (with `-e SHIM_PATH`
  as its arguments).
- Consequence on this host: the resolved terminal command
  (`~/.local/share/applications/Alacritty.desktop`, `X-TerminalArgAppId=--class=`)
  never receives the id, so the window opens with Alacritty's default class
  and additionally tries to exec a nonexistent `org.omarchy.ufo-sighting`
  program. `hyprlandTerminalObservations` (exact class equality,
  `ufo-sighting.mjs` `APP_ID` filter) would not count it; `waitForOneClient`
  then fails `ATTACH_TIMEOUT` (`:2771`). [INFERENCE for the exec failure —
  no mutating probe run; the class loss itself follows directly from the
  parse branches.]
- Contrast: the healthy omarchy path uses the equals form —
  `omarchy-launch-tui` emits `xdg-terminal-exec --app-id=org.omarchy.$(basename $1)`
  — which is why the defect only bites the collision/missing-launcher
  fallback. Masked in substrate tests by the stub at
  `tests/ufo-sighting.test.js:1184` reading the shim path positionally
  (per `2026-10-09-pinned-behavior.md` — the stub masks the argv shape).

## Unknowns

- What the spawned terminal actually shows when asked to exec the APP_ID
  string (alacritty's `-e` behavior with a missing program) — not probed;
  research forbids launching.
- Whether the fallback branch has ever fired on this host (needs a stale
  same-class window or absent `omarchy-launch-or-focus-tui`).
