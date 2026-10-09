# fixture-profile — the portable fixture profile in `config/ufo.json`

Asked: what `orchestrator`, `lanes[]`, `fixtureAxes`, `automaticSubstrate`, `runnerUpSubstrate` mean, who reads them, and why lanes[] and proposalRoles differ.
Anchor: `ufo-fsd-alpha@5ace2559` (read-only); `config/ufo.json` cited from the working copy (sha256 `0e416f0a…`, uncommitted swarm-band edit only). Lane: `FixtureProfile`.

## Observed
- `orchestrator` = `{route: "local/fixture-primary", role: "portable contract fixture; not the canonical judge"}`.
- `lanes[]` = 10 `{id, role, substrate:"omp"}` rows: scout, reviewer, **labrat**, critic, connector, executor, mutation-tester, revenger, simplifier, scribe — no sentinel.
- `fixtureAxes` = `{identity:{id:"portableFixtureAxes"}, axes:[correctness, safety, legibility, coverage]}`.
- Readers: the TS fixture (`src/`), the sync gate (`assertFixtureContract`), and `build.rs` `validate_local_omp`. **No Rust fixture-loop code reads `lanes`/`fixtureAxes`/`orchestrator` from `config/ufo.json`.** The native launcher/collector read only `automaticSubstrate`; `runnerUpSubstrate` is validation-only (must differ from `automaticSubstrate` and name a declared substrate — `sync-ufo-contracts.mjs:1363-1369`).
- labrat vs sentinel: labrat is the fixture's empirical lane (`src/README.md` vocabulary-divergence note; Rust `default_lanes()` includes labrat too); sentinel is a native mandatory proposal seat. No validator ties `lanes[]` to `nativeProfiles.*.proposalRoles`.
- `ufo self-iter` uses `default_lanes()` (`loop_driver_open.rs:26,71`); `OrchestrationConfig` has no `lanes` field — so `docs/L2-L3-ROUTING.md:394`'s "self-iter takes config lanes[]" is wrong (DrillDocsDrift).

## Drift
- Bundled mirror differs from config/ufo.json in the `sighting.dispatch` block (see `drills-block`); fixture keys match.
- Two hand-maintained role lists; route-literal parity is manual (`conformance/fixture-routes.json` absent).
