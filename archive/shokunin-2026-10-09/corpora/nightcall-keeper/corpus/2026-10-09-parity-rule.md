# parity-rule — `seats.main.alias == missionFormat.l1Alias`

Lanes `BuildRsParity`, `LibRsRouteYaml`, `SyncGlobalRoutingAlias`,
`HostDispatchDelta`. L1 re-read `build.rs:1-40,155-156,549-581` and
`lib.rs:1013-1026`, and ran both `--check`s.

- `crates/ufo-core-runtime/build.rs` `validate_generated_graph`:
  - Reads `l1Alias` from **`bundled/config.json`** (:155) and `seats.main.alias`
    from **`bundled/omp-seat-routing.json`** (:156, `SEAT_ROUTING_MIRROR` :110).
    It never reads `config/ufo.json`; the crate must stay self-contained for
    `cargo package`.
  - Refusals:
    - `sighting.dispatch.missionFormat.l1Alias is required`
    - `… must be a non-empty alias without a leading @, got {l1_alias:?}`
    - `seats.main.alias must resolve the global missionFormat.l1Alias {l1_alias:?}, got {main_alias:?}; re-run scripts/sync-global-routing.mjs`
- Runtime twin `src/lib.rs` `expected_omp_route_yaml` (:1018-1026): shape only
  (required, non-empty, no `@`), with **no equality check**. Its comment says
  drift "fails the build", which is true only for the bundled pair. Tests:
  `native_tests.rs:8052` `omp_route_yaml_l1_alias_arms_die` (missing and `@`
  arms), `profile_shape_refusal_tests.rs:219-228` (empty). No test pins the
  equality literal.
- Live state 2026-10-09: `config/ufo.json:85` is `m_strong`;
  `bundled/config.json:85` is `m_daybreak`; `omp-seat-routing.json` `seats.main.alias`
  is `m_daybreak`. The build gate passes because the stale pair agrees.
- Observed (L1):
  - `node scripts/sync-global-routing.mjs --check` → exit 1: "bundled/omp-seat-routing.json drifts from the live global OMP config".
  - `node scripts/sync-ufo-contracts.mjs --check` → exit 1, `drifted:
    [bundled/omp-seat-routing.json, bundled/config.json]`, `validationErrors: []`.
- The host side keeps `host/omp-agent.config.yml:228` `main: "@m_strong"`, and its
  comment at :219-221 names this rule. Note that build.rs compares the mirror's
  `seats.main.alias` (derived from `l1Alias`), **not**
  `task.agentModelOverrides.main`. Only `host/apply.mjs:977-980` compares the
  override with `l1Alias` (host-smith owns that gate).
- [INFERENCE] Regenerating only one mirror (e.g. a `UFO_PROJECTION_ROOT` path that
  skips the routes repair) would make the build fail with the third refusal.
