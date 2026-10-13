# 2026-10-09 — the omarchy skill's scope (OmarchySkillScope)

**Asked:** distill `~/.agents/skills/omarchy/SKILL.md` (392 lines) into the
boundary for end-user config advice.

## Observed

- MUST-use triggers (frontmatter + body `:23-35`): editing
  `~/.config/{hypr,waybar,walker,alacritty,foot,kitty,ghostty,mako,omarchy}/`;
  `omarchy` CLI requests; window/animation/opacity/theme/monitor/binding
  topics. Enforcement line `:35`: "about to edit ~/.config on this system →
  STOP, use this skill." `~/.config/swayosd/` in the component table but not
  the trigger lists (drift).
- Safety rule (`:41`): `~/.local/share/omarchy/` NEVER modified (lost on
  `omarchy update`); reading is safe/encouraged (`cat $(which
  omarchy-theme-set)`, defaults under `default/`). Safe write dirs:
  `~/.config/`, `~/.config/omarchy/themes/<custom>/`, `~/.config/omarchy/hooks/`.
- Component table (`:75-83`): Hyprland `~/.config/hypr/` (10 files listed —
  live dir also has `ai-usage.conf`, `xdph.conf`, `monitors.conf.bak`),
  waybar `config.jsonc`/`style.css`, terminals (alacritty.toml/foot.ini/
  kitty.conf/ghostty config), mako, swayosd, plus btop/fastfetch/lazygit/
  starship/git/walker.
- CLI: `omarchy <group> <action>` dispatcher (`bin/omarchy`); discovery —
  `omarchy commands [--all|--json|--check|--markdown]`, `<group> --help`,
  `<group> <cmd> --help`; unknown cmd → exit 127.
- Reload discipline: hyprland auto-reloads (validate `hyprctl reload` +
  `configerrors`; `omarchy refresh hyprland` does NOT itself reload — drift
  vs skill's "restarts the component" claim); waybar/walker MUST be
  restarted (`omarchy-restart-waybar` = `pkill -9 -x waybar` + `setsid
  uwsm-app`); `omarchy-restart-terminal` handles alacritty (touch) + kitty
  (SIGUSR1) + ghostty (SIGUSR2) — **no foot branch** though the skill lists
  foot.
- Rules of engagement: window-rule syntax drifts → fetch Hyprland wiki first;
  rebinding a used key needs `unbind` first; `omarchy refresh <app>` resets
  after confirmation; Pattern-4 reset "restarts the component" is true only
  for waybar/walker.
- Out of scope: `~/.local/share/omarchy/` edits, migrations, `omarchy dev`.

## Unknowns

- Hyprland auto-reload claim not verified upstream; `--markdown` flag not in
  the skill's docs.

Confidence: high for the distilled contract and verified drift.
