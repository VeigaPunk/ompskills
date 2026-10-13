# swarm band / cap / round budget: resolution and observed refusals

**Asked:** how the wave band, the per-L1 cap and the round budget resolve, and which config keys are live.
**Sources:** `/home/vgpnk/Projects/ufo-fsd-alpha/scripts/ufo-mission-result.mjs` (`loadSwarmPolicy`
~2431-2519), `scripts/ufo-swarm-wave.mjs` (796-800, 979-996), plus two live `plan` runs.

## Observed

- Wave band: floor = `sighting.dispatch.swarm.waveMinLanes` ?? `swarm.minLanes` ?? `MIN_SWARM_LANES`(2),
  clamped <= `maxLanes` (hub 2503-2508); ceiling = `waveMaxLanes` ?? `maxLanes`, clamped to
  `maxLanes` and `MAX_SWARM_LANES` (2510-2516); an inversion -> `invalid_policy` (2517-2519).
  Live band: **16-32**.
- Per-L1 cap: `swarm.maxLanes` tightens only (`Math.min` with `MAX_SWARM_LANES`=100, 2464-2469);
  a per-spec `maxLanes` tightens further and is recorded as `declaredMaxLanes`; enforced per wave
  (`total > cap` -> `too_many_lanes`, 995-996). Live: 100 == the hard ceiling.
- Round budget: `swarm.maxLanes` IS the round budget per prose (`swarm/SKILL.md:66-67`;
  `tower/SKILL.md:159-160`) and is named `roundLaneCeiling` by `sighting/tower-fleet.mjs:155`,
  but **no code accumulates lanes across waves** — enforcement is strictly per-wave; round-wide
  sharing is coordinator discipline.
- Live keys: `waveMinLanes`/`waveMaxLanes` (16/32) are consumed by the wave validator, the
  tower-fleet launcher, the stale watchdog and sync-ufo-contracts; `swarm.minLanes` (16) is the
  planner floor only when `waveMinLanes` is absent (masked today) and is never read by the
  tower-fleet launcher; `MIN_SWARM_LANES`/`MAX_SWARM_LANES` are built-in 2/100.
- Observed refusals (read-only `plan`, nothing persisted), stdout verbatim:
  `{"schema":"ufo-swarm-wave-error-v1","code":"too_few_lanes","message":"a wave with spawn lanes needs at least 16 lanes (got 1); split the round's scope into waves of 16-32 same-shape lanes"}`
  (exit 1, stderr empty); a 33-lane probe -> `wave_too_wide` "at most 32 lanes (got 33)". The band
  values in both messages prove the live config was read (built-ins would print 2-100).
- Gate order confirmed: `empty_wave` -> `impossible_band` -> `too_many_lanes` -> `too_few_lanes`
  -> `wave_too_wide`; resume-only waves are exempt from the band but not the cap.

## Findings

- MEDIUM: `/home/vgpnk/Projects/ufo-fsd-alpha/scripts/fleet-dispatcher.mjs:5387-5397` hardcodes
  the wave band as "16-100" in the L1 briefing prompt while citing `waveMinLanes`/`waveMaxLanes`;
  the live validator refuses >32 — it misbriefs every fleet L1 and contradicts
  `tower/SKILL.md:160` "never hardcoded".
- LOW: `.omp/skills/swarm/SKILL.md:68-71` flattens the floor chain (absent `waveMinLanes`,
  `minLanes` IS the floor; 2 applies only when both are absent).

## Remaining unknown

The band-less fallback proven by code reading, not exercised at runtime.
