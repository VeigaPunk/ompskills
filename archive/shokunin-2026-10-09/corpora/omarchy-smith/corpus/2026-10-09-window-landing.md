# 2026-10-09 — where a spawned wall window lands (WindowLanding)

**Asked:** where a spawned wall terminal lands; rules in stock defaults;
live `hyprctl clients -j` state.

## Observed

- Live wall window (2026-10-09): address `0x55ebaa550d50`, class
  `org.omarchy.ufo-sighting`, title `ufo_sighting:1.2 fleet`, workspace **1**,
  monitor DP-1 (id 0), `floating:false`, pid 8519, tags `['default-opacity*']`.
- No stock or user rule floats, sizes, pins, or workspaces
  `org.omarchy.ufo-sighting` — grepped `~/.config/hypr`,
  `~/.local/share/omarchy/default/hypr/`, `~/.config/omarchy`. The wall class
  is absent from the `apps/system.conf:6` float list that covers other
  `org.omarchy.*` TUIs (`terminal`, `btop`, `bluetui`, `impala`, `wiremix`,
  `bash`).
- Landing rule: a fresh spawn lands on the **active workspace, tiled**
  under dwindle — no rule intercepts it. `omarchy-launch-or-focus`'s
  `focuswindow address:` jumps to an existing window's workspace.
- Effective dead branch: the omarchy launcher's focus branch is unreachable
  for this class in practice — `launchOrFocusAttach` focuses by pid when a
  client is attached, and `classCollision` bypasses the launcher when a
  same-class window exists. It only runs when zero same-class windows AND
  zero clients — i.e., always the launch path.
- Divergences: `apps/terminals.conf:2` `+terminal` tag omits the wall class
  (only `default-opacity` applies); system float list omits it.

## Unknowns

- Hyprland `focuswindow` cross-workspace switch semantics [INFERENCE].
- `dwindle:force_split` meaning; `alacritty --class=` → app_id mapping rule
  [INFERENCE].
- Whether the old window survives `respawn-terminal` detach (governs
  fallback frequency).

Confidence: high for live state and rule absence; medium for runtime
call-chain; low for inferred Hyprland behaviors. No mutating verbs run.
