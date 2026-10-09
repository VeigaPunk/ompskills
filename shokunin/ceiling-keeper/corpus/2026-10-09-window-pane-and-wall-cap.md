# window-pane-and-wall-cap — two pane capacities, one refusal code

Asked: what `sighting.windowPaneCeiling` and the default wall's capacity enforce.
Lanes `WindowPaneCeiling` and `WallGeometryCap`. `windowPaneCapacity` and `assertCapacity` re-read by the L1 (`:2140-2188`).

- `windowPaneCapacity(fleet, geometry)` = `fleet ? SIGHTING_CONFIG.windowPaneCeiling : geometry.cap` (`:2140-2141`).
- `assertCapacity` `:2177-2188`: `liveMissionsForFleet(state, fleet).length >= cap` → `CAP_EXCEEDED`.
  The message is either "fleet <f> window capacity is N missions" or "<profile> wall capacity is N missions", with details `{profile, fleet, cap}`. The 16th mission is admitted and the 17th refused. Exit 2.
- Default wall: `cap = rows × columns` from `sighting.layouts`, so 15 on 16:9 (3×5) and 18 on 21:9 (3×6) (`:1212`, `:1780`).
  The profile is chosen by `width/height >= ASPECT_BOUNDARY` (37/18 ≈ 2.0556, `base.mjs:43`), which selects 21:9.
  Two more checks: attach-time `> geometry.cap` (`:2785-2787`) and grid build (`:1257-1258`).
- `windowPaneCeiling` is **never** read for the default wall.
- Launcher twin: `PANE_CEILING_EXCEEDED` (`tower-fleet.mjs:340`, `>` on the spec count). That is a different code for the same key.
- Interaction [INFERENCE from call order, not executed]: on 21:9 the cap is 18, but `maxConcurrentL1` 16 is checked first (`:2351` before `:2352`).
  So the 17th live mission refuses with `L1_CEILING_EXCEEDED` and 18 panes cannot be reached. The 21:9 test pins `maxConcurrentL1` 64 to dodge this.

Drift:
- `fleet-dispatcher.mjs:3738-3744` defaults an absent `windowPaneCeiling` to **16** (re-read by the L1). The wall (`base.mjs:159-161`) and `sync-ufo-contracts.mjs:1151` require it.
- The dispatcher accessor honours `UFO_CONFIG_PATH`. The wall reads a fixed ROOT config.
- `ufo-sighting-lib/surface.mjs:246` advertises `windowPaneCeiling` as the cap. For the default wall, the layout is the cap.
- `.omp/skills/tower/SKILL.md` calls the pane ceilings "display capacity". They are enforced refusals for fleet windows.
