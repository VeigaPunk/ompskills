# omp-host-scripts — the OMP-host-facing scripts

Asked: the seven OMP-host-facing scripts — purpose, config touch, read/write class, importers.
Source: lane OmpHostScripts report. Anchor: ufo-fsd-alpha@5ace2559.

## Observed

- `omp-global-config.mjs` (627 ln): hand-rolled YAML-dialect parser + seat/alias route resolver over
  the operator's global config; **pure library, no CLI**. `DEFAULT_CANDIDATES` are HOME-relative
  (`.omp/agent/config.yml|yaml`, `.config/omp/config.yml|yaml`, `.omp/config.yml|yaml`). Keys read:
  `modelRoles`, `task.agentModelOverrides`, `retry.fallbackChains`. Exports 12 symbols
  (`globalOmpConfigPath`, `parseModelRoles`, `parseAgentModelOverrides`, `parseFallbackChains`,
  `resolveAliasFromMaps`, `resolveAliasRouting`, `resolveSeatRouting`, `readGlobalSeatRouting`,
  `readGlobalProviderAliasRoutes`, …). Importers: `fleet-dispatcher.mjs:31`,
  `run-omp-native-trial.mjs:24`, `sync-global-routing.mjs:33`, `ufo-route-preflight.mjs:30`,
  `probe-token-plan-kimi.mjs:17`, `probe-token-plan-models.mjs:24`.
- `omp-native-shutdown.mjs` (268 ln): `omp --extension` shutdown gate (session_stop/agent_end),
  writes forensic gate JSON to `UFO_NATIVE_GATE_FILE` only; loaded via `omp --extension`
  (path named at `run-omp-native-trial.mjs:948`).
- `omp-role-work.mjs` (294 ln): per-seat duty text for the frozen 16-scope wave; pure template;
  unknown role/scope fail closed; sole importer `run-omp-native-trial.mjs:15,3511`.
- `omp-wave-context.mjs` (570 ln): hoists byte-identical wave sections into shared context
  (`planWaveAssignments`); **zero production importers** (only `tests/omp-wave-context.test.js`;
  `ufo-swarm-wave.mjs` mentions it in a comment).
- `fake-omp.mjs` (392 ln): deterministic no-network OMP fixture emitting NDJSON
  (`FAKE_OMP_MODE`/`FAKE_OMP_DELAY_MS`); CLI `fake-omp models <provider> [--json]` /
  `fake-omp -p <prompt> [--model] [--thinking] [--session-dir]`; exports nothing; spawned as `omp`
  by `tests/route-probes.test.js:12,87`, `tests/fleet-dispatcher.test.js:1295-1326`,
  `scripts/fleet-dispatcher.test.mjs:739`.
- `ufo-native-names.mjs` (81 ln): canonical seat-id/label/dispatch-name/digest derivations
  (`seatKey`, `seatId`, `seatLabel`, `canonicalDispatchName`, `correlationGroup`,
  `unavailabilityGroup`); a `NATIVE_CONTRACT_FILES` member (`native_contract.rs:81`) — drift changes
  the contract hash. Importers: launcher, collector, `collect-omp-native-handoff-lib/{base,evidence}.mjs`.
- `ufo-credential-screen.mjs` (68 ln): two-tier credential/sensitive-shape screen
  (`containsCredentialShape`, `containsSensitiveShape`); single source; explicitly **not** a
  contract-hash member (run-logic `:697-701`).

## Contract

| script | purpose | global-config touch | read/write | importers |
| --- | --- | --- | --- | --- |
| `omp-global-config.mjs` | global-config parser + route resolver | **YES — read-only** | read-only | 6 production + tests |
| `omp-native-shutdown.mjs` | shutdown gate | no | mutating (`UFO_NATIVE_GATE_FILE` only) | loaded via `omp --extension` |
| `omp-role-work.mjs` | seat duty text | no | read-only | 1 |
| `omp-wave-context.mjs` | wave-context hoister | no | read-only | **0 production** |
| `fake-omp.mjs` | deterministic OMP fixture | no | read-only unless `--session-dir` | spawned by tests |
| `ufo-native-names.mjs` | seat-name derivations | no | read-only | 4 |
| `ufo-credential-screen.mjs` | credential/sensitive screen | no | read-only | 6 |

**No script in this set writes the operator's global OMP config.** The only writer of a routing
artifact in the tree is `sync-global-routing.mjs` (writes the *derived* mirror
`crates/ufo-core-runtime/bundled/omp-seat-routing.json`, `MIRROR_PATH` `:64`).

## Not carried by the source

- No CLI for the global config anywhere in these seven files ("NO CLI for this —
  `omp-global-config.mjs` is a pure library", `reports/nc6/final/ONESHOT.md:106`).
- `ufo-native-names.mjs` does **not** declare or validate substrate names — the seven names live in
  `substrates/README.md:5-11`.
- `fake-omp.mjs` exports nothing and is never `import`ed (subprocess only).
- `omp-wave-context.mjs` has no production consumer at this revision.

## Unknowns

- The item phrase "seven-substrate naming contract" is not a named symbol in the tree; the closest
  referents are the seven skill mirrors of `run-logic.md` and the `NATIVE_CONTRACT_FILES` /
  `PROJECT_OMP_MIRRORS` mechanism (`native_contract.rs:118`). `PROJECT_OMP_MIRRORS`' 19 pairs were
  not enumerated pair-by-pair. Real-omp parsing of the fake-omp argv dialect was not executed.