# omarchy-smith corpus index

The omarchy desktop terminal layer: launcher chain → appId/desktopId →
observe/focus/pid → geometry/respawn → where windows land → domain boundary.
One entry per researched item; the `fallback-appid-defect` entry is the
verification-dispatch entry.

| entry | topic | added |
| ----- | ----- | ----- |
| 2026-10-09-launcher-wrapper.md | `omarchy-launch-or-focus-tui`: argv contract, APP_ID derivation, handoff, metadata convention, zero-arg behavior | 2026-10-09 |
| 2026-10-09-focus-match-semantics.md | `omarchy-launch-or-focus`: unescaped `\b` regex over class OR title, `head -n1`, `eval exec setsid`, silent fallthroughs, `$(…)` execution | 2026-10-09 |
| 2026-10-09-launch-tui-chain.md | `omarchy-launch-tui`: setsid→uwsm-app→xdg-terminal-exec→`--class=`; how the Hyprland class is produced | 2026-10-09 |
| 2026-10-09-xdg-terminal-exec.md | `/usr/bin/xdg-terminal-exec` 0.14.0: argv surface, terminal selection, `--print-id/--print-cmd`, `=`-only `--app-id` | 2026-10-09 |
| 2026-10-09-appid-consumers.md | `APP_ID=org.omarchy.ufo-sighting` consumers; exact-class filter vs launcher regex; classCollision route | 2026-10-09 |
| 2026-10-09-terminal-resolution.md | `resolveTerminalOnce`: resolve-once cache, `--print-id/--print-cmd` bounds, manifest terminal block, desktopId never matched | 2026-10-09 |
| 2026-10-09-attach-decision-tree.md | `launchOrFocusAttach`: 1-client pid focus, DUPLICATE_CLIENTS, classCollision bypass, UNSAFE_LAUNCH_PATH, xdg fallback | 2026-10-09 |
| 2026-10-09-attach-wait-and-env-flag.md | `waitForOneClient` poll/timeout/lock; `UFO_SIGHTING_ATTACH=1` → shim `attach-session -d` | 2026-10-09 |
| 2026-10-09-hyprctl-observations.md | `hyprlandTerminalObservations` class filter + silent `[]`; `focusTerminalPid` `pid:^(N)$` discarded return; test override | 2026-10-09 |
| 2026-10-09-process-attribution.md | `terminalPidFromAncestor` 0/1 identity walk; `processCount` is a presence flag; runner census is telemetry-only | 2026-10-09 |
| 2026-10-09-respawn-terminal.md | `respawn-terminal` order (detach before checks), post-mutation refusals, `display_client_replaced` never emitted | 2026-10-09 |
| 2026-10-09-geometry-profiles.md | `--geometry` → profile (16:9 cap 15 / 21:9 cap 18), source precedence, no window resize/placement | 2026-10-09 |
| 2026-10-09-auto-open-wall.md | `autoOpenWall` config/flag/consumer chain; `WALL_NOT_OPEN` gate; dispatcher `--no-open` | 2026-10-09 |
| 2026-10-09-env-surface.md | `UFO_SIGHTING_*` env table: validation, setters, abuse surface; `commandExists` exec-bit/empty-PATH divergences | 2026-10-09 |
| 2026-10-09-refusal-surface.md | terminal-layer refusal table (corrected site counts) + silent-failure inventory | 2026-10-09 |
| 2026-10-09-sighting-config-block.md | `sighting` config keys: type/live value/consumer/desktop effect; `surfaceDigest` drift at HEAD | 2026-10-09 |
| 2026-10-09-user-hypr-config.md | `~/.config/hypr` survey: sourcing order, terminal bindings, no rule matches the wall class, live monitor/layout | 2026-10-09 |
| 2026-10-09-window-landing.md | live wall window tiled ws1 DP-1; no float/pin rule; fresh spawn lands tiled on active workspace | 2026-10-09 |
| 2026-10-09-launcher-family.md | `omarchy-launch*`/`omarchy-cmd-*`/`omarchy-webapp*` table, shared setsid/uwsm/appId pattern, metadata keys | 2026-10-09 |
| 2026-10-09-domain-boundary.md | seam classification: wall-watcher (tmux/registry) vs omarchy skill (~/.config) vs this card (desktop layer); F-findings ledger | 2026-10-09 |
| 2026-10-09-omarchy-skill-scope.md | omarchy skill scope distilled: triggers, read-only rule, CLI discovery, reload discipline, its own drift | 2026-10-09 |
| 2026-10-09-pinned-behavior.md | substrate test pins vs gaps for the desktop layer; fixture stub shapes | 2026-10-09 |
| 2026-10-09-fallback-appid-defect.md | card-verification entry: space-form `--app-id` at `ufo-sighting.mjs:2753` is discarded by xdg-terminal-exec (APP_ID becomes the exec target) | 2026-10-09 |
