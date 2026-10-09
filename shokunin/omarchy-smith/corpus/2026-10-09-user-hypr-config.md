# 2026-10-09 — ~/.config/hypr survey and wall-window landing (HyprUserConfig)

**Asked:** file survey of `~/.config/hypr/`; bindings touching
terminals/omarchy launchers; any rule matching `org.omarchy.*` or terminal
classes; monitor layout.

## Observed

- `hyprland.conf` sources: omarchy defaults (`autostart`,
  `bindings/media|clipboard|tiling-v2|utilities`, `envs`, `looknfeel`,
  `input`, `windows`) → `~/.config/omarchy/current/theme/hyprland.conf` →
  user `monitors/input/bindings/looknfeel/autostart.conf` →
  `~/.local/state/omarchy/toggles/hypr/*.conf` → `ai-usage.conf`.
- User bindings (`bindings.conf`, all `bindd`): SUPER RETURN → `uwsm-app --
  xdg-terminal-exec --dir="$(omarchy-cmd-terminal-cwd)"`; SUPER ALT RETURN →
  tmux; SUPER SHIFT ALT M → `omarchy-launch-or-focus-tui cliamp`; SUPER
  SHIFT D → `omarchy-launch-tui lazydocker`; SUPER SHIFT M → `or-focus
  spotify`; `^signal$`/`^obsidian$` anchored patterns; webapp launchers.
  `hyprctl binds` confirmed live (modmask in parens): Terminal(64), Tmux(72),
  Music TUI(73), Docker(65), Activity(68 → `omarchy-launch-tui btop` from
  `default bindings/utilities.conf:63`).
- Rules: **no match anywhere** for `ufo`/`ufo-sighting` in user config or
  defaults. Existing `org.omarchy.*` rules: `ai-usage.conf:2-5` (float/
  center/875×600 for `org.omarchy.ai-usage`); `default apps/system.conf:6`
  floats `org.omarchy.bluetui|impala|wiremix|btop|terminal|bash`;
  `system.conf:11-13` screensaver; `apps/terminals.conf:2` `+terminal` tag on
  `Alacritty|kitty|com.mitchellh.ghostty|foot`; `windows.conf` catch-all
  `+default-opacity` (the wall window carries only `default-opacity*`).
  Only workspace rule: `apps/browser.conf:19` special silent (screen-share).
- Live: DP-1 3440×1440@100 scale 1.0 (matches `monitors.conf:10`);
  `general:layout=dwindle`; gaps/border/rounding all 0 via
  `toggles/hypr/window-no-gaps.conf`; wall window tiled ws1 `[1720,26]`
  `[1720,1414]`, beside Alacritty pid 2518 — shared dwindle split.
- Dead files: `default/hypr/bindings.conf` (deprecated, undefined
  `$terminal`) and `plain-bindings.conf` — not sourced.
- `monitors.conf.bak.20261003-190229` = prior `GDK_SCALE,2` +
  `preferred,auto,auto`; not sourced.

## Unknowns

- Runtime `hyprctl keyword` rules not in files are invisible.
- Waybar as source of the 26px reserved strip [INFERENCE].
- `hyprctl binds` is a snapshot vs file state — reload races not checked.

Confidence: high for files/binds/live state; medium that tiling is absence-
of-rule inference.
