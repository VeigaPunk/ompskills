# contracts-and-lints — the non-dispatch checks on the format layer

Lanes `SyncContractsBinding`, `HandAuthoredSets`. L1 re-read
`sync-ufo-contracts.mjs:1204-1218,1467-1469,1766-1775` and
`check-hand-authored-sets.mjs:89-99`.

`scripts/sync-ufo-contracts.mjs` (check-only gates; the copy loop is separate):
- `assertSightingContract` :1204-1218. Block optional (`!== undefined`); `id`
  optional but must be `"nightcall"` if present; `defaultIterateRounds`
  optional 1..1024. **No `configPath` check.** This is weaker than the
  dispatcher, so a config passing contracts can still be refused at dispatch.
- `renderOmpProjection` :1467-1469. `l1Alias` is required (non-empty, no `@`)
  but **not projected** into `.omp/config.yml`. The projection emits only
  `extendedContext`, `task.maxConcurrency: 0`, and `task.maxRecursionDepth`.
- :1766-1775 is the l1-max-context gate; :1777-1860 is the the-tick gate (see
  `the-tick-machine`).
- `mission-nightcall.yml` itself: zero references in this script.

`scripts/check-hand-authored-sets.mjs:89-99`: there must be exactly one
`config/mission-*.yml` on disk, and it must equal `missionFormat.configPath`.
Violation `authority_invalid` / `missionFormat.configPath must name one
config/mission-*.yml`. It checks the filename only, not the contents.

`scripts/check-routing-free-config.mjs`: forbids `modelRoles`,
`agentModelOverrides`, `fallbackChains`, `modelRoutes`, and `modelFallbacks` at
any depth in `config/**`. The overlay passes (live CLI exit 0). Gap: `YAML_KEY`
anchors at line start (:23), so flow-style `task: {agentModelOverrides: …}`
slips through (probed). `.tower/` overlays are never scanned.
