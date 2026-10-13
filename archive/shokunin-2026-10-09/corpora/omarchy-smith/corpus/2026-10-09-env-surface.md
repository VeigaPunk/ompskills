# 2026-10-09 — env vars of the desktop-terminal layer (EnvSurface)

**Asked:** every `UFO_SIGHTING_*` governing the desktop layer: where read,
validation, who sets it, abuse/staleness surface; plus `commandExists`.

## Observed

| Variable | Read at | Validation | Set by | Surface |
| -------- | ------- | ---------- | ------ | ------- |
| `UFO_SIGHTING_LAUNCHER` | `launchOrFocusAttach :2742`, live every attach | `commandExists` only; no exec-bit/realpath | operator/parent env; tests | arbitrary executable runs with full env once per attach; not cached; non-default value **skips the classCollision guard** (`:2743` compares to config default) |
| `UFO_SIGHTING_TERMINAL_RESOLVER` | `resolveTerminalOnce :2483` (only when manifest lacks terminal block) | output bounds only; **no commandExists precheck** | operator; tests | arbitrary binary, 30 s/8 MiB; output cached in manifest **forever**; only `command[0]` basename reused (`:2678`) |
| `UFO_SIGHTING_ATTACH` | shim `scripts/ufo-sighting:26`; `main :4400` | exact `"1"` + zero args → tmux attach `-d`; `=1`+argv → `INVALID_ATTACH_ROUTE` | wall sets it on spawned launcher `:2749,:2755`; tests | exporting it in an operator shell makes bare `scripts/ufo-sighting` attach and `-d`-kick other clients |
| `UFO_SIGHTING_ATTACH_TIMEOUT_MS` | `waitForOneClient :2760` via `boundedTimeoutMs` | lower bound only: `" "`→0, `"1e308"` accepted, `""`→10 s default | operator; tests | huge value holds the wall op lock → other verbs `WALL_BUSY` |
| `UFO_SIGHTING_TEST_TERMINAL_PID` | `:2507` (validated → `INVALID_TERMINAL_PID`), `:2734,:2810,:2857,:3044` **unvalidated** | **not test-gated**; `Number()`+truthiness | tests; no production setter observed | overrides real hyprctl/ancestor pid; drives live `focuswindow pid:^(N)$` dispatches; trips `classCollision` |
| `UFO_SIGHTING_STATE_DIR` | `stateDir base.mjs:301-303` | **any non-empty value skips the beneath-ROOT guard** (`:345`); existing dir chmod'd 0700 | operator; tests | chooses manifest/observations/lock dir; fleet-dispatcher does not read it |

- `commandExists` (`:2473-2479`): `existsSync` only — non-executable file or
  same-named directory returns true (spawn then `EACCES` →
  `TERMINAL_LAUNCH_FAILED`, not launcher-missing). Empty PATH entries are
  skipped by the check but honored by `spawn`/`spawnSync` — POSIX resolves
  an empty segment as cwd, so a PATH like `":/usr/bin"` makes the resolver
  path (no precheck) run a same-named file in cwd. Scratch-verified.

## Unknowns

- Who else could set the test-pid in production (no gate observed).
- Whether a same-named cwd file has ever shadowed `xdg-terminal-exec`.

Confidence: high — every row cites a line; empty-PATH divergence probed.
