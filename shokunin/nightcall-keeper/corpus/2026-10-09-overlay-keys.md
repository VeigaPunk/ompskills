# overlay-keys — what `config/mission-nightcall.yml` sets and what changes

Asked: every key the canonical L1 overlay sets, its OMP meaning, and its net
effect over the live global config. Lanes `NightcallOverlayKeys`,
`NightcallVsGlobalDiff` (scouts); L1 re-read the file.

Source: `config/mission-nightcall.yml` (566 bytes, sha256 `64ae2a83…`), lines 6-15.
It sets no route keys (`modelRoles`, `task.agentModelOverrides`, `retry.fallbackChains`).

| key | overlay | global `~/.omp/agent/config.yml` | schema default | effective change |
| --- | --- | --- | --- | --- |
| `extendedContext` | `true` | `true` (:2) | `false` | none |
| `advisor.enabled` | `true` | absent | `false` | **false → true** |
| `task.maxConcurrency` | `0` | `32` (:24) | `32` | **32 → 0 (unlimited)** |
| `retry.modelFallback` | `true` | `true` | `true` | none |
| `retry.waitForUsageReset` | `false` | absent | `false` | none |
| `retry.usageAwareFallback` | `false` | absent | `false` | none |
| `retry.fallbackRevertPolicy` | `never` | absent | `cooldown-expiry` | **→ never** |

- `task.maxConcurrency: 0` = unlimited, not disabled: `omp://tools/task.md:158`
  ("`0` means unlimited"); the binary's schema option labels `0` "Unlimited".
- Observed with `PI_CONFIG_FILES=<overlay> omp config get <key> --json`: values
  flip as in the table. `omp --config X config get` does NOT apply the overlay
  (`--config` is launch-only), so probe through `PI_CONFIG_FILES`.
- `extendedContext: true`, `retry.usageAwareFallback: false`, and
  `retry.fallbackRevertPolicy: never` mirror build-time gates on
  `nativeProfiles.omp-native-v1` (`crates/ufo-core-runtime/build.rs:521-548`).
  The overlay is not what build.rs reads; the values just agree.
- `sync-ufo-contracts.mjs:1443-1446` claims "the global OMP config and every
  mission overlay carry task.maxConcurrency: 0". That is false for the live
  global (32). Only the overlay makes it 0.

## Unknowns
- The effective advisor model: there is no `modelRoles.advisor` in the global
  table. The binary falls back to a role default, and which model that is was not
  resolved.
- The Semaphore's `0` branch was taken from docs, not OMP source.
