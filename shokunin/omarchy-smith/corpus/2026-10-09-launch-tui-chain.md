# 2026-10-09 — omarchy-launch-tui exec chain (LaunchTuiChain)

**Asked:** the exec chain `~/.local/share/omarchy/bin/omarchy-launch-tui` and
how the window's Hyprland `class` ends up `org.omarchy.<basename>`.

## Observed

- `:6` `exec setsid uwsm-app -- xdg-terminal-exec
  --app-id=org.omarchy.$(basename $1) -e "$1" "${@:2}"`.
- `setsid` (util-linux) gives the tree a new session, orphaned from the
  launcher — live wall window pid 8519 has ppid `systemd --user`, own
  session/pgrp.
- `uwsm-app` (uwsm 0.26.6, POSIX sh client) does NOT exec the target; it
  sends argv to `wayland-wm-app-daemon` over a FIFO; the daemon returns a
  `systemd-run --user --scope` command (main.py ~3704-3760) — the terminal
  lands in `app-graphical.slice`.
- `xdg-terminal-exec` consumes `--app-id=` and maps it through the resolved
  entry's `X-TerminalArgAppId`; this host's user `Alacritty.desktop` carries
  `X-TerminalArgAppId=--class=` → `alacritty --class=<id>` (`--print-cmd`
  verified). `alacritty --class` sets the Wayland app_id → Hyprland class.
- Drift: the `--class` mapping lives only in `~/.local/share/applications/
  Alacritty.desktop`; the `/usr/share` copy lacks `X-TerminalArgAppId`, so a
  desktop entry without the key silently drops the appId
  (`xdg-terminal-exec:1426-1427`).
- Live confirmation: `hyprctl clients` — pid 8519 class
  `org.omarchy.ufo-sighting`; control alacritty pid 2518 (no `--class`)
  class `Alacritty`.

## Unknowns

- uwsm daemon event loop mechanism (read, not executed).
- Hyprland app_id→class mapping rule itself not read from Hyprland source
  [INFERENCE].

Confidence: high for launcher line, `--app-id` prepend, print-cmd argv, live
pids; medium for uwsm daemon assembly.
