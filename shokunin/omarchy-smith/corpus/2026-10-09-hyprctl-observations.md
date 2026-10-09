# 2026-10-09 — hyprlandTerminalObservations and focusTerminalPid (HyprObservations)

**Asked:** `hyprlandTerminalObservations` (`ufo-sighting.mjs:2506-2523`) and
`focusTerminalPid` (`:2691-2700`).

## Observed

- Spawn: `spawnSync("hyprctl", ["clients","-j"])` — 8 MiB buffer, 30 s.
  Any error or non-zero exit → `[]` — indistinguishable from a true zero;
  `getStatus` reports it as `matchingClassProcessCount: 0` (`:3087`).
- Filter (`:2517`): `String(client.class||"").toLowerCase() === APP_ID` —
  **exact equality**, not regex; contrast with the omarchy engine's
  case-insensitive `\b` regex over class OR title (false-focus surface).
- Mapping (`:2518-2519`): `pid=Number(client.pid)` kept only if safe integer
  >0; `size` mapped `Number` if array else null — length/finiteness unchecked.
- `UFO_SIGHTING_TEST_TERMINAL_PID`: validated only here (`INVALID_TERMINAL_PID`,
  `:2510`); returns `[{pid,size:null}]` without calling hyprctl. Four other
  readers (`:2734`,`:2810`,`:2857`,`:3044`) use unvalidated `Number()`. In
  `openWall`/`respawnTerminal` the launch happens before the validating call.
  The synthetic observation trips `classCollision` (`:2743-2744`), forcing
  the xdg path when the configured launcher is default. `INVALID_TERMINAL_PID`
  has no test.
- `focusTerminalPid`: `hyprctl dispatch focuswindow "pid:^(${pid})$"`;
  returns false silently on falsy pid or missing hyprctl
  (`commandExists` = existsSync only, no exec-bit check). Its boolean is
  discarded at `:2737`. Test fake hyprctl answers only `clients`, so the
  dispatch argv is never asserted.
- Host: Hyprland 0.56.0; `hyprctl clients -j` returns numeric pid and
  `size [w,h]`; `hyprctl dispatch` no-args prints usage error.

## Unknowns

- Whether Hyprland 0.56.0 accepts `pid:^(N)$` (anchored regex group) vs a
  bare integer — not probed (dispatch mutates focus).
- `hyprctl dispatch` exit code on dispatch-level failure.
- Whether `clients -j` can emit null entries in practice.
- Live identity between the Wayland client pid and the walked terminal pid.

Confidence: high for code-cited contract; medium for ordering; low for
Hyprland pid-regex acceptance.
