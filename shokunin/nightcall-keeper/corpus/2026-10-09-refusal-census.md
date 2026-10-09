# refusal-census — every refusal on the mission-format layer

Lane `RefusalCensus` (sentinel). Dispatcher rows were re-read by the L1 (see
`mission-format-validator`).

| refusal | file:line | trigger |
| --- | --- | --- |
| `config/ufo.json is missing sighting.dispatch.missionFormat` | fleet-dispatcher.mjs:3564 | block absent / not object |
| `…missionFormat.id must be nightcall` | :3567 | id ≠ nightcall |
| `…missionFormat.defaultIterateRounds is invalid` | :3573 | not 1..1024 |
| `…missionFormat.l1Alias is invalid` | :3577 | pattern |
| `…configPath escapes ${ROOT}` / `traverses a symlink` | :4419-4429 | containment |
| `global OMP config could not be read for l1Alias ${alias}` | :3636 | global unreadable |
| `l1Alias ${alias} did not resolve in the global OMP config` | :3669 | alias not in `modelRoles` |
| `l1Alias ${alias} resolves to an invalid route chain` | :3674 | chain >16 / bad route / dup |
| `queue task l1Alias is invalid (expected a bare alias token like m_kcode)` | :5723 | spec alias pattern |
| `fleet queue config path must be ${configPath}` | :5767 | non-canonical fleet configPath |
| `queue config path is required` | :5756-5759 | non-fleet spec without configPath |
| `config_drift` / `config_unavailable` | :8567-8582 | overlay bytes changed / unreadable at dispatch |
| `…missionFormat.id must be "nightcall"` / `…defaultIterateRounds must be an integer 1..1024` | sync-ufo-contracts.mjs:1210,1216 | only when present |
| `…l1Alias must be a non-empty alias without a leading @` | sync-ufo-contracts.mjs:1469; lib.rs:1024; build.rs:566 | shape |
| `seats.main.alias must resolve the global missionFormat.l1Alias …` | build.rs:579 | parity |
| `CONFIG_UNREADABLE` (`is missing sighting.dispatch.missionFormat.l1Alias`, `is not a safe alias token`) | tower-fleet.mjs:142,162 | launcher authority |
| `sighting.dispatch.missionFormat.l1Alias is required: Main resolves …` (code `missing`), `global-alias-<code>` | run-omp-native-trial.mjs:704-722 | native Main |
| `config/l1-max-context.yml must contain exactly \`extendedContext: true\`` | sync-ufo-contracts.mjs:1773 | overlay gate |
| `config/ephemeral-l1.machine.json is invalid` | ufo-sighting-lib/base.mjs:225 | subset check |
| `fleet policy schema is not ufo-ephemeral-fleet-policy-v1` and siblings | prepare-ephemeral-fleet.mjs:86-103 | fleet policy |
| `unsupported config schema`, `tick_config_unreadable`, `tick_root_mismatch` | the-tick-config.mjs:185; gates.sh:507,512,537 | tick |

Unvalidated passthrough: unknown `missionFormat` keys are dropped; the tower
launcher never validates `configPath`/`id`/`defaultIterateRounds`; the
ephemeral-fleet `manifest` is joined into a path untyped.
