# band-authority-config — the live band authority and its fail-closed arms

Asked: which config keys the launcher reads, which it deliberately does not, and every
`CONFIG_UNREADABLE` arm.
Source: `sighting/tower-fleet.mjs` @ b251c5a. Lanes: `BandAuthority`, `CeilingRelations`.

`loadBandAuthority(ufoRoot)` (:130), sole caller `main()` (:1286), reads exactly:
- `sighting.dispatch.maxConcurrentL1` (:151) — live 16
- `sighting.windowPaneCeiling` (:152) — live 16
- `sighting.dispatch.swarm.waveMinLanes` (:153) — live 16
- `sighting.dispatch.swarm.waveMaxLanes` (:154) — live 32
- `sighting.dispatch.swarm.maxLanes` (:155) — live 100
- `sighting.dispatch.missionFormat.l1Alias` (:156) — live `m_strong`

Deliberately NOT read (grep returns no match): `sighting.dispatch.globalRunnerCeiling` (live
1056), `sighting.dispatch.swarm.minLanes` (live 16 — case-sensitive grep for `minLanes` misses
`waveMinLanes`), `mode`, `queuePath`, `autoDispatchMissions`, `missionFormat.id`/`configPath`/
`defaultIterateRounds`, `swarm.rampBatchSize`/`rampIntervalMs`.

`CONFIG_UNREADABLE` arms (all exit 2):
1. file missing/unreadable/unparseable (:135-137);
2. a required key undefined/null via `need` (:141-144) — the six keys above;
3. a numeric key not a safe integer or `< 1` via `intOf` (:145-148);
4. `waveMin > waveMax` (:158-160, "swarm band is impossible");
5. `l1Alias` failing `/^[A-Za-z0-9_.:-]+$/` after `String()` coercion (:161-163).

Order: `loadBandAuthority` (:1286) precedes `loadSpec` (:1287) and all verb bodies — it gates every
verb, including read-only `status`.

Evidence: `BandAuthority` (real refusal transcript), `CeilingRelations` (limit table).
