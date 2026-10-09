# 2026-10-09 — domain boundary vs wall-watcher and the omarchy skill (BoundaryMap)

**Asked:** classify the domain's fact areas into wall-watcher's, the omarchy
skill's, and this card's new territory.

## Observed

- (a) **wall-watcher owns:** tmux session/window/pane model; manifest schema
  + registry; verb dispatch + usage + exit codes; ceilings
  (windowPaneCeiling/maxConcurrentL1/globalRunnerCeiling/layouts cap);
  respawn's lock/reconcile/continuity (`ufo-sighting.mjs:2830-2846,:2872-2873`);
  the `{ok:false,code,message}` refusal envelope shape; `DUPLICATE_CLIENTS`
  tmux counting.
- (b) **omarchy skill owns:** `~/.config` edit + backup rules; the
  `~/.local/share/omarchy` read-only rule; `omarchy` CLI groups;
  `hyprctl reload`/`configerrors` validation; theme/hook/keybinding patterns.
- (c) **omarchy-smith owns (new):** the launcher chain
  `ufo.json:56 → or-focus-tui → or-focus → launch-tui → xdg-terminal-exec`;
  APP_ID (`base.mjs:39`) + launcher-side derivation (`or-focus-tui:6`);
  `desktopId` (recorded/validated/reported — never matched, finding F4);
  `hyprctl clients -j` class match (`:2517`) + pid focus (`:2693`); the
  ancestor walk (`:2677-2689`); geometry (`classifyGeometry :1202-1206`,
  `ASPECT_BOUNDARY base.mjs:43`); respawn-terminal's terminal sub-chain
  (`:2847-2870`); the desktop refusal codes
  (TERMINAL_RESOLUTION_FAILED, TERMINAL_LAUNCH_FAILED, UNSAFE_LAUNCH_PATH,
  TERMINAL_LAUNCHER_MISSING, ATTACH_TIMEOUT, TERMINAL_PID_UNAVAILABLE,
  INVALID_TERMINAL_PID).
- Findings worth keeping:
  - F1 defect: `ufo-sighting.mjs:2753` space-form `--app-id` vs
    `xdg-terminal-exec` `=`-only parse; the `ufo-sighting.test.js:1184` stub
    reads shim as `$4` — only works under the broken argv, so a fix requires
    changing the fake in the same cutover.
  - F2: wall-watcher corpus `2026-10-09-terminal-respawn-and-attach.md:27`
    records the broken form — needs a wall-watcher errata entry (not this
    mission's scope).
  - F3: `processCount` is a presence flag (`:3086`), pinned at `:1202`.
  - F5: `state.terminal` never re-resolved; no clearing path.
  - F6: `focusTerminalPid` return discarded (`:2737`).
  - F7: respawn detaches before terminal-side refusals — not zero-mutation.
  - F8: tests never execute the real omarchy script chain — stubs only.
  - F9: `omarchy restart terminal` has no foot branch (skill F-drift).

## Unknowns

- Live two-word launch outcome; whether old window survives respawn;
  omarchy title-match capture; `focuswindow pid:^(N)$` syntax;
  manifest recreation on reset (governs F5 in practice).

Confidence: high for the boundary classification and F1 parse defect.
