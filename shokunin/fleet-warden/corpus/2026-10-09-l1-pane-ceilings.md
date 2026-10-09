# l1-pane-ceilings — the two mission-count ceilings and their gate order

Asked: the two ceiling refusals, their order, and where the numbers come from.
Source: `sighting/tower-fleet.mjs` @ b251c5a. Lane: `Ceilings`.

- L1 gate (`loadSpec` :337-339): `missions.length > authority.maxConcurrentL1` →
  `L1_CEILING_EXCEEDED`; the message names the declared count and the live ceiling.
- Pane gate (:340-342): `missions.length > authority.windowPaneCeiling` →
  `PANE_CEILING_EXCEEDED`.
- L1 is checked FIRST (:337 before :340, no intervening guard); when both would trip the L1 code
  wins (suite `test/tower-fleet.test.mjs:915-920`).
- Both comparisons are strict `>`: a fleet exactly at a ceiling plans clean (suite :337-345,
  :910-913).
- Numbers come from `<ufoRoot>/config/ufo.json` via `loadBandAuthority` (:151-152), never a
  hardcoded literal. Live: `maxConcurrentL1` 16, `windowPaneCeiling` 16 — so the pane gate is
  unreachable on the live config; the suite patches them apart.
- A missing/non-positive ceiling is `CONFIG_UNREADABLE`, not a default.

Evidence: lane `Ceilings`, corroborated by `CeilingRelations` and the suite pins.
