# l1-alias-consumers — who reads `missionFormat.l1Alias` and how

Lanes `DispatcherL1Alias`, `NativeTrialL1Alias`, `TowerFleetFormatRead`. L1
re-read the dispatcher and native-trial lines.

| consumer | file:line | behavior |
| --- | --- | --- |
| dispatcher policy | `fleet-dispatcher.mjs:3575`, :3754 | pattern gate, then must resolve in the global table: `l1Alias ${alias} did not resolve in the global OMP config` (:3669) |
| dispatcher enqueue | :5725 | `selectedAlias = requestedAlias ?? policy.missionFormat.l1Alias`; a spec alias wins |
| route agreement | :5737-5738, :1422, :8477 | `queue route must be the resolved ${alias} route ${route}`, `queue L1 route differs from its global OMP alias`, `queue task route differs from its global OMP alias` |
| dispatcher argv | :8489-8491 | hop 0 with alias → `--model @<alias>`; later hops get the concrete route |
| native trial Main | `run-omp-native-trial.mjs:702-722` | reads the **live** `config/ufo.json`; missing → code `missing`; resolve failure → `global-alias-<code>` |
| tower launcher | `sighting/tower-fleet.mjs:156,161` | `CONFIG_UNREADABLE` if missing or not `/^[A-Za-z0-9_.:-]+$/`; argv `--model @<alias>` |
| mirror generator | `sync-global-routing.mjs:228,249` | `seats.main` = `resolveAliasFromMaps(…, l1Alias)` |

Grammar drift (four different rules):
- dispatcher: `/^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/u`
- tower launcher: `/^[A-Za-z0-9_.:-]+$/` (allows `.` and `:`)
- Rust (`build.rs:564`, `lib.rs:1022`) and `sync-ufo-contracts.mjs:1468`:
  non-empty, no leading `@`

So `m.x` passes Rust, sync, and the launcher, then fails the dispatcher.

Resolution goes through `omp-global-config.mjs` `resolveAliasRouting` (:489):
`modelRoles` lookup, then `retry.fallbackChains` keyed by alias. The live global
has `m_strong` and no `m_daybreak`.
