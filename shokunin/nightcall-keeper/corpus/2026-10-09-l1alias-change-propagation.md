# l1alias-change-propagation — what an edit to canonical `l1Alias` reaches, and when

Verification dispatch (`NightcallVerify`). Supersedes nothing; extends
`2026-10-09-l1-alias-consumers.md` and `2026-10-09-parity-rule.md`.
Hashes re-checked and equal to the index anchors (`0e416f0a…`, `1f6b2115…`,
`d4364b67…`). Substrate HEAD `5ace2559`. Also hashed: `fleet-dispatcher.mjs`
`ba5e02be…`, `run-omp-native-trial.mjs` `848502bf…`, `sync-global-routing.mjs`
`3ccf357a…`, `sync-ufo-contracts.mjs` `fb9d3137…`, `build.rs` `ae8a7d6d…`,
`src/lib.rs` `2ae7ec55…`.

Question asked: if an operator edits `config/ufo.json`
`sighting.dispatch.missionFormat.l1Alias`, which consumers see the change right
away, which wait for a mirror regeneration, and does the crate build fail before
or after that regeneration? Does `sighting/tower-fleet.mjs` read `configPath`?

## Current values (jq, 2026-10-09)

- `config/ufo.json` → `m_strong`
- `crates/ufo-core-runtime/bundled/config.json` → `m_daybreak`
- `bundled/omp-seat-routing.json` `.seats.main.alias` → `m_daybreak`

## Consumers that see the change immediately (they read the live file)

- Dispatcher: `CONFIG_PATH` defaults to `config/ufo.json` (`fleet-dispatcher.mjs:81`,
  `UFO_CONFIG_PATH` can override it). `dispatchPolicy()` (:3773) re-keys its cache
  on lstat `mtimeNs/size/ino/ctimeNs` (:3779-3811), so the next call reloads.
  `loadDispatchPolicy` (:3719) → `validateMissionFormat` (:3753) →
  `resolveFleetAliasRouting` (:3754). An alias missing from the global table
  makes policy load throw.
  - Enqueue default: `selectedAlias = requestedAlias ?? policy.missionFormat.l1Alias`
    (:5725). The alias is frozen onto the row (`l1Alias: aliasRouting.alias`
    :5862, :5904), and launch resolves `task.l1Alias` (:8474-8476). [INFERENCE]
    Rows already queued keep the old alias.
- Native trial Main: `snapshot.parsed…l1Alias` (`run-omp-native-trial.mjs:702`),
  where the snapshot is the live `config/ufo.json` (:172-175). It resolves via
  `resolveAliasRouting` (:714). A resumed run refuses with `resume-drift`
  (:1623, :1634) when the config digest has changed since dispatch.
- Tower launcher (this worktree): `loadBandAuthority` reads
  `<ufoRoot>/config/ufo.json` on each invocation (`sighting/tower-fleet.mjs:130-165`).
  It reads `l1Alias` at :156 and gates it with `/^[A-Za-z0-9_.:-]+$/` (:161).
  The argv is `--model @<alias>` (:475).
- Runtime crate: `validate_omp_route_config` reads the live root
  `config/ufo.json` (`native_contract.rs:428-436`), which feeds
  `expected_omp_route_yaml` (`lib.rs:1018-1026`). That check is shape-only
  (required, non-empty, no leading `@`) and has no parity check.
- Seat-mirror generator: `configuredL1Alias()` reads the live config
  (`sync-global-routing.mjs:221-230`), so `--check` sees the new alias
  immediately and reports drift.

## Consumers that wait for regeneration

- `bundled/config.json`: whole-file byte copy (`sync-ufo-contracts.mjs:1921-1925`,
  `target: "bundled-config"`). It changes only with `contracts:sync` in write mode.
- `bundled/omp-seat-routing.json`: rendered by `sync-global-routing.mjs`
  (`buildSeatRoutingMirror` :239, `resolveAliasFromMaps` :249). The routes
  repair in `sync-ufo-contracts` write mode can also regenerate it
  (`checkRoutesEquivalence`, :594ff, import :22).
- `build.rs`: reads only these two mirrors (:155-156). It registers
  `rerun-if-changed` only for those two paths (:157-158), so a
  `config/ufo.json` edit does not even rerun the build script.

## Build timing

- Before regeneration: the build passes. The parity check (`build.rs:574-581`)
  compares the two mirrors, and both still say `m_daybreak`.
- After regenerating **both** mirrors to the same new alias: the build passes.
- After regenerating **only one** mirror: the build fails with
  `seats.main.alias must resolve the global missionFormat.l1Alias {l1_alias:?}, got {main_alias:?}; re-run scripts/sync-global-routing.mjs`.
  The usual trap is running `sync-global-routing.mjs` alone. It rewrites only
  the seat mirror, while `bundled/config.json` stays `m_daybreak`. That already
  holds today (canonical `m_strong`) with no edit at all. [INFERENCE: not
  executed, because write mode is forbidden.]
- [INFERENCE] If the new alias is missing from the global table,
  `resolveAliasFromMaps` cannot render the seat mirror. The dispatcher and the
  native trial refuse at runtime, while the build keeps passing on the stale pair.

## --check results observed this dispatch

- `node scripts/sync-global-routing.mjs --check` → exit 1:
  `crates/ufo-core-runtime/bundled/omp-seat-routing.json drifts from the live global OMP config; re-run node scripts/sync-global-routing.mjs`
- `node scripts/sync-ufo-contracts.mjs --check` → exit 1,
  `{"ok":false,"drifted":["…/omp-seat-routing.json","…/bundled/config.json"],"validationErrors":[]}`

## tower-fleet.mjs and configPath

It does not read `missionFormat.configPath`. Its local `configPath` (:131, :150,
:639) is the path of `config/ufo.json` itself. The pane argv hardcodes
`--config <ufoRoot>/config/mission-nightcall.yml` (:476). Its only
`missionFormat` read is `l1Alias` (:140, :156).

## Unknown

- Whether `contracts:sync` write mode applies the bundled-config copy and the
  routes repair in one run, or aborts partway on an earlier error, leaving a
  single mirror changed. Not executed.
- Whether a long-lived dispatcher process holds other alias-derived state that
  outlives the cache invalidation. Not traced.
