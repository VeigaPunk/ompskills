# fleet-launcher-ceilings — the launcher's numbers

Asked: what `sighting/tower-fleet.mjs` reads, which gates it enforces, and what it never reads.
Source: `sighting/tower-fleet.mjs` (sha `80f0814e…`). Lane `FleetLauncherCeilings`. Gates probed by the L1.

Reads (`loadBandAuthority` `:149-162`, required ints via `need`/`intOf`, else `CONFIG_UNREADABLE`):
`dispatch.maxConcurrentL1` (`:151`), `windowPaneCeiling` (`:152`), `swarm.waveMinLanes` (`:153`), `swarm.waveMaxLanes` (`:154`),
`swarm.maxLanes` as `roundLaneCeiling` (`:155`). Band inversion → `CONFIG_UNREADABLE` (`:158-159`).

Gates in `loadSpec`:
- `:337-338` `missions.length > maxConcurrentL1` → `L1_CEILING_EXCEEDED` "fleet declares N L1 missions; sighting.dispatch.maxConcurrentL1 is M"
- `:340-341` `missions.length > windowPaneCeiling` → `PANE_CEILING_EXCEEDED`
- L1 is checked first. Both use strict `>`. Exit 2 with `{ok:false,code,message}` on stderr.

**Observed by the L1** (scratch ufoRoot holding a real config copy):
- 16 missions → exit 0. 17 → `L1_CEILING_EXCEEDED`, exit 2.
- With `maxConcurrentL1` patched to 64, 17 → `PANE_CEILING_EXCEEDED`. On live config (16/16) the pane gate cannot be reached.

Never read: `globalRunnerCeiling`, `swarm.minLanes`, `rampBatchSize`, `rampIntervalMs`, `defaultIterateRounds`, `nativeProfiles.*`.

Launcher-owned literals (not config): `roundCeiling` default 1 (`:388`, `<1` → `INVALID_SPEC`), `maxTime` default `3h` (`:390`), `--runner-reservation 1` (`:500`).

Defects (lane-probed, plan-only):
- **Raw echo.** No check that waveMin ≤ maxLanes, waveMax ≤ maxLanes, or values ≤ 100. With `maxLanes:10` the prompt says "round ceiling 10, wave band 16–32" and exits 0, while the hub's effective band is 10/10.
  `waveMaxLanes:500` echoes 16–500 while the effective ceiling is 100.
- `maxTime` is coerced with `String()` (`:390`), so `null`/`true` pass as `"null"`/`"true"`.

Name collision: spec `roundCeiling` counts **rounds**; config `roundLaneCeiling` (= `swarm.maxLanes`) counts **lanes**. Cite fleet-warden for verbs and lifecycle.
