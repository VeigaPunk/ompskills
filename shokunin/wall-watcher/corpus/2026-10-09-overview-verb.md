# 2026-10-09 — `overview` verb and the display grid

**Asked:** document `overview` and the display-grid rendering, and decide whether the overview/grid
capacity comes from `layouts` geometry or from `sighting.windowPaneCeiling`.

**Sources (exact; `ufo` = `/home/vgpnk/Projects/ufo-fsd-alpha`)**

- `ufo/scripts/ufo-sighting.mjs:4468-4505` — the `overview` branch.
- `ufo/scripts/ufo-sighting.mjs:1367-1373, 1375-1387` — `OVERVIEW_MARKER`/`@ufo_overview_pid`/
  `OVERVIEW_TITLE`, `OVERVIEW_PANE_HEIGHT = 8`, `overviewPaneHeight`.
- `ufo/scripts/ufo-sighting.mjs:1389-1431` — `paneRunsOverviewWatcher`, `bindOverviewPane`,
  `overviewBindings`, `clearPaneMetadata`.
- `ufo/scripts/ufo-sighting.mjs:1579-1634` — `renderFleetOverview`; `:1466-1526` — `runOverviewWatch`.
- `ufo/scripts/ufo-sighting.mjs:1778-1780` — `profileContract`; `base.mjs:295-299` — `fleetLayoutContract`;
  `ufo/scripts/ufo-sighting.mjs:2140-2142, 2177-2186` — `windowPaneCapacity` / `assertCapacity`.
- `ufo/config/ufo.json` — `layouts` (`16:9` 3×5; `21:9` 3×6), `windowPaneCeiling` 16.
- Live: `tmux list-panes -t ufo_sighting:1`, `tmux show-options -w -t ufo_sighting:2 -v @ufo_fleet_missions`.
- Test: `ufo/tests/ufo-sighting-wall-heavy.test.js:239-262`; `ufo/tests/ufo-sighting.test.js:559-566, 1945-1948`.

**Observed**

- Flags: `--watch` (bool) and `--width COLS` (positive safe integer; validated in the verb **before** any
  marker mutation). One-shot mode writes `renderFleetOverview(...)` + `"\n"`; `--watch` repaints in place
  (`"\x1b[H\x1b[J" + view + "\x1b[J"`, no newline), `fs.watch(stateDir)` on `manifest.json` /
  `observations.json` with a 200 ms debounce plus a 2.5 s safety tick, and exits with 130/143/129 on
  SIGINT/SIGTERM/SIGHUP.
- Render: column floor `Math.max(72, --width || process.stdout.columns || 120)`; closed hatch →
  single line `"UFO fleet · hatch closed · 0 missions"`; fixed cell widths (fleet 14, runId 14,
  levels 12, phase 9, age 8, r 4), one row per `sortMissions(liveMissions(state))`, footer rule +
  totals line `L1(n) | L2(n|?) | L3(n) · runners used/globalRunnerCeiling`.
- Capacity: the overview strip's height is **dynamic** — `Math.min(Math.max(5 + live, 8), floor(windowHeight/2))`;
  live 13 rows at 8 missions. The strip lives in the **default window only** (`exactWindowTarget()`), is
  **not** a mission pane (`register` refuses it: `INVALID_PANE "<%N> is the fleet overview pane"`), and is
  **never** charged against `windowPaneCeiling` (`assertCapacity` counts `liveMissionsForFleet` only; the
  strip is passed as a separate `topStrip`, consuming grid height, not a cell).
- Mission-grid capacity splits by window: default window → `profileContract(state.profile)` from
  `layouts[profile]` (16:9 cap 15, 21:9 cap 18); fleet window → `fleetLayoutContract()` from
  `sighting.windowPaneCeiling` (cap 16, `maxColumns = ceil(16/3) = 6` → 18 layout cells > 16 missions).
  Binding order: `assertL1Capacity` (`maxConcurrentL1` 16) runs **before** `assertCapacity`, so even the
  21:9 cap 18 is unreachable — the 17th launch is `L1_CEILING_EXCEEDED`.
- Pane markers: `@ufo_overview = "dashboard"`; bound iff `@ufo_overview_pid === pane_pid` **or** the pane
  process still runs `<execPath> <MODULE_PATH> overview` (a marker-preserving `respawn-pane` is provably
  stale); unbound panes have both markers unset. Fleet/window markers `@ufo_fleet_missions`/`_l1`/`_l2`/`_l3`
  + the `pane-border-format` are written per refresh; window 2 live shows `@ufo_fleet_missions 8`, `_l2 ?`.
- Declared `states: {"*": "render"}` but the verb self-marks the pane (only when the pane is not already a
  mission pane) and `readManifest({create:false})` tightens a loosened state root — display-only in intent,
  not side-effect-free.

**Changed:** nothing.

**Unknown:** whether a consumer depends on the invented `opened_or_focused`/`display_client_replaced`
state names — the surface's state names are declared, not emitted.