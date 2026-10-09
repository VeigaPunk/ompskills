# 2026-10-09 — xdg-terminal-exec on this host (XdgTerminalExec)

**Asked:** locate `xdg-terminal-exec`; argv surface; terminal selection;
`--print-id`/`--print-cmd` outputs.

## Observed

- `/usr/bin/xdg-terminal-exec` — POSIX sh, 1484 lines, pacman package
  `xdg-terminal-exec 0.14.0-1`. Not in `~/.local/bin` or omarchy bin.
- argv surface (`:1221-1297`): `--app-id=VALUE` (equals form ONLY — the space
  form falls to the `-*` discard `:1299-1305`), `--dir=`, `-e` (ends option
  parsing; default exec arg `TerminalArgExec`, `-e` compat), `--print-id`
  (id + optional `:ACTION`), `--print-cmd[=SEP]` (resolved argv, one per
  line), plus `--print-path`, `--print-content`, `--hold`, `--title=`,
  `--test`, `--help`.
- Selection: `$XDG_CONFIG_HOME`/`$XDG_CONFIG_DIRS`
  `<desktop>-xdg-terminals.list` then `xdg-terminals.list`, then
  `$XDG_DATA_DIRS/xdg-terminal-exec/`; entries must have `TerminalEmulator`
  category + PATH-resolvable Exec/TryExec + `TerminalArgExec` (strict) or
  `-e` compat. Host: `XDG_CURRENT_DESKTOP=Hyprland`,
  `~/.config/xdg-terminals.list` → `Alacritty.desktop`, resolved to
  `~/.local/share/applications/Alacritty.desktop` (overrides /usr/share) with
  `X-TerminalArgAppId=--class=`, `X-TerminalArgExec=-e`,
  `X-TerminalArgDir=--working-directory=`, `X-TerminalArgTitle=--title=`.
- Print outputs (live): `--print-id` → `Alacritty.desktop` (full filename,
  not reverse-DNS); `--print-cmd` → `alacritty` (+`--class=<id>` when
  `--app-id=` given); both → `Alacritty.desktop\nalacritty\n`, exit 0.
- **Defect:** `ufo-sighting.mjs:2753` uses space-form `--app-id APP_ID`;
  this parser discards it (see `2026-10-09-fallback-appid-defect.md`).

## Unknowns

- Man page unread; `:ACTION` path unprobed; other distro builds may accept
  the space form.

Confidence: high — location, argv, selection, print outputs, the mis-parse
all directly observed.
