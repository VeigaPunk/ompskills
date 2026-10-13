# 2026-10-09 — fleet-window model (sessions, windows, panes, the strip)

**Asked:** document the tmux model — session, default window, per-fleet windows, one pane per live
mission, the overview strip — and how each is addressed.

**Sources (exact; `ufo` = `/home/vgpnk/Projects/ufo-fsd-alpha`)**

- `ufo/scripts/ufo-sighting-lib/base.mjs:21-31` — `SESSION_NAME`, `WINDOW_INDEX`, `TMUX_TARGET`,
  `DEFAULT_WINDOW_NAME = "fleet"`, `FLEET_NAME_PATTERN`.
- `ufo/scripts/ufo-sighting-lib/base.mjs:268-299` — `exactSessionTarget`, `exactWindowTarget`,
  `validateFleetName`, `missionFleet`, `windowTargetFor`, `liveMissionsForFleet`, `fleetLayoutContract`.
- `ufo/scripts/ufo-sighting.mjs:1071-1093` — `configureOwnedWindow`; `:1129-1154` — `ensureFleetWindow`;
  `:1155-1180` — `killFleetWindowIfEmpty`; `:921-930` — `findWindowByName` (`FLEET_WINDOW_AMBIGUOUS`).
- `ufo/scripts/ufo-sighting.mjs:2225-2295` — `spawnPaneForMission` (split into `windowTargetFor(fleet)`).
- `ufo/scripts/ufo-sighting.mjs:1636-1722, 1739-1798` — `ensureOverviewPane`, `refreshFleetDisplay`,
  `updateSessionStatus`; `:244-247` — manifest fleet normalization; `:3046-3078` — status `windows[]`.
- Live: `tmux list-windows -t ufo_sighting`, `tmux list-panes -t ufo_sighting:1`,
  `tmux list-panes -t ufo_sighting:2 -F '#{pane_index} #{@ufo_title} #{@ufo_position} #{@ufo_run_id}'`,
  `tmux show-options -t ufo_sighting`.

**Observed**

- Session `ufo_sighting`; window index `1` named `fleet` is the **default/no-fleet** window (not a fleet);
  `base-index 1` live. A named fleet `--fleet NAME` gets its own window titled exactly `NAME`.
- Addressing: `windowTargetFor(fleet)` = `ufo_sighting:=<fleet>` (tmux exact-name match) or
  `ufo_sighting:1`; `missionFleet` normalizes an absent/empty fleet to `null`. Fleet membership is one
  manifest field (`fleet`), validated `^[a-z0-9][a-z0-9_-]{0,47}$` on every load
  (`MALFORMED_MANIFEST` otherwise).
- `--fleet` exists **only** on `launch`; `register` has no `--fleet` and always binds the default window
  (`fleet: null`).
- Window creation: first launch of a fleet runs `new-window -d -t ufo_sighting -n <fleet> node
  ufo-sighting.mjs __idle`, then asserts the created window's index is not 1 (else
  `INVALID_ARGUMENT "fleet name collides with the default sighting window"`) and fails
  `TMUX_ERROR` if it cannot be confirmed. `configureOwnedWindow` turns off `automatic-rename`/
  `allow-rename`, sets `remain-on-exit on`, `pane-base-index 1`, `pane-border-status bottom`,
  `history-limit 2000`. Two windows with the same name → `FLEET_WINDOW_AMBIGUOUS` (fail closed, never
  adopt the first).
- `"fleet"` is a reserved fleet name (always collides with window 1).
- Panes: one pane per live mission, split into its fleet's window; mission identity lives in pane options
  (`@ufo_sighting_mission`, `@ufo_run_id`, `@ufo_session_id`, `@ufo_position` `<i>-of-<n>`, `@ufo_title`,
  `@ufo_relay`, `@ufo_phase`, `@ufo_l1/l2/l3`, `@ufo_telemetry`) plus the window's `@ufo_fleet_*` and a
  `pane-border-format`; the window **name** stays the fleet name.
- The overview dashboard strip (`@ufo_overview=dashboard`, `@ufo_overview_pid`) lives in the **default
  window only** (`ensureOverviewPane` targets `exactWindowTarget()`); it is not a mission pane and every
  fleet window has none. Fleet windows are **ephemeral**: created on first mission, killed when the last
  mission leaves and no wall-owned pane remains (`killFleetWindowIfEmpty`; any live foreign pane blocks
  teardown).
- Capacity is per-window and **not uniform**: status `windows[]` gives the default window
  `profileContract(profile).cap` (16:9 → 15) and each fleet window `sighting.windowPaneCeiling` (16).
  `fleetLayoutContract()` = `{profile:"fleet", rows:3, maxColumns: ceil(windowPaneCeiling/3)=6, cap:16}`.
- Live read: window 1 `fleet` (2 panes: `%2` `UFO fleet overview` + `%0` `__idle`), window 2 `shokunin`
  (8 mission panes `%22`–`%29`, `@ufo_position` `1-of-8`…`8-of-8`, `@ufo_run_id` `wave-smith`…`host-smith`).

**Changed:** nothing.

**Unknown:** whether `@ufo_mission_id` (empty on live panes) is set elsewhere under a different marker
name was not traced; `@ufo_title` is volatile (child process retitles the pane), so mission identity must
be read from the `@ufo_*` markers / manifest rows, not `pane_title`.