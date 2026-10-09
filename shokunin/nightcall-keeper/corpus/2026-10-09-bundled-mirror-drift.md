# bundled-mirror-drift — four keys apart, two regenerators

Lanes `BundledMirrorDrift` (critic), `SyncContractsBinding`. L1 confirmed with
both `--check`s.

`jq -S` diff of `config/ufo.json` (sha `0e416f0a…`) vs
`crates/ufo-core-runtime/bundled/config.json` (sha `1f6b2115…`):

| key | canonical | bundled |
| --- | --- | --- |
| `sighting.dispatch.maxConcurrentL1` | 16 | 32 |
| `sighting.dispatch.missionFormat.l1Alias` | m_strong | m_daybreak |
| `sighting.dispatch.swarm.minLanes` | 16 | 64 |
| `sighting.dispatch.swarm.waveMaxLanes` | 32 | 100 |

Everything else in `sighting.dispatch` is identical, including `id`,
`configPath`, `defaultIterateRounds`, and `globalRunnerCeiling`.

- The bundled config is a whole-file **byte copy**:
  `sync-ufo-contracts.mjs:1921-1925` (`target: "bundled-config"`). It is
  rewritten by `npm run contracts:sync` (write mode) and reported by `--check`.
- The seat mirror is rendered by `scripts/sync-global-routing.mjs`, or repaired
  inside `sync-ufo-contracts` routes-equivalence in write mode.
  `contracts:sync` does not call `sync-global-routing.mjs` directly.
- The bundled config is byte-identical to the pre-image of 2026-10-08
  (`ufo.json.2026-10-08T19-15-32-811Z.bak`). It was never re-synced after the
  operator's applies. `host/apply.mjs` documents this as deliberate staleness:
  it never runs `contracts:sync` (host-smith).
- `native_contract.rs:87` puts `omp-seat-routing.json` in
  `NATIVE_CONTRACT_FILES`; `bundled/config.json` is not.
- Downstream pins on the stale value: `conformance/vectors/native/execution-profile.json`
  (judge = daybreak), `AGENTS.md:123` generated main row `@m_daybreak`.
