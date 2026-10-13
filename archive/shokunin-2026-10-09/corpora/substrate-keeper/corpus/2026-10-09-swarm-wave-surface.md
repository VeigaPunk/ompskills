# swarm-wave-surface — scripts/ufo-swarm-wave.mjs as a layout surface

Asked: what the wave validator *is* — its files, verbs, exports, writes, and dependency edges.
Refusal and band semantics belong to the `wave-smith` shokunin. Source: lane SwarmWaveScript report.
Anchor: ufo-fsd-alpha@5ace2559, `config/ufo.json` sha256 `0e416f0abc559e9a…`.

## Observed

- `scripts/ufo-swarm-wave.mjs` **1907 lines**; suite `scripts/ufo-swarm-wave.test.mjs` **1942 lines**
  (in-file `test(name, fn)` harness at `:94`, 100 `test(` occurrences, spawns the CLI via `SCRIPT`).
- Header opens `/**` at `:2`; first line `:3` "ufo-swarm-wave — plan one swarm wave for OMP-native
  dispatch."; sub-headings CLI `:40`, Spec shape `:64`, Route preflight `:92`, Prior refinement
  `:102`, Exit codes `:112`.
- Exports (7): `SWARM_ROLES` (Set of 10 roles, `:258`), `SwarmWaveError` `:305`, `planSwarmWave`
  `:768`, `planToDispatchPayload` `:1307`, `withPriorRefinement` `:1362`, `waveRoutePreflight`
  `:1384`, `persistWaveRegistry` `:1464`.
- Schema id **strings** (JSON fields, not JS exports — comment `:138-140`): `ufo-swarm-wave-v1`
  `:143`, `ufo-swarm-wave-error-v1` `:144`, `ufo-swarm-wave-dispatch-v1` `:145`,
  `ufo-swarm-registry-v1` `:146`.
- Verbs (USAGE `:1354`): `plan` (pure — `planSwarmWave` body 768-1306 has no write call),
  `run` (persists the registry `:1877` via `withRegistryLock` `:1466` → `writeRegistry` `:628` =
  `mkdirSync` + atomic write, then emits the dispatch payload `:1882`), `record` (`mainRecord`
  `:1628`: under the lock, load → set `agentId` `:1782` → write `:1791`).
- Registry path rule `registryRelPath :420-426`: `dir = reportDir ?? ".ufo/scopes/<wave|wave>"`,
  file `swarm-registry.json`; resolved under ROOT via `beneath` unless `UFO_FLEET_ALLOW_EXTERNAL_TOOLS`.
- Sibling imports: `./ufo-refinement-context.mjs` `:115`, `./ufo-route-preflight.mjs` `:116`,
  `./ufo-mission-result.mjs` `:120` (24 shared symbols).

## Contract

| file | verb/export | writes? |
| --- | --- | --- |
| `ufo-swarm-wave.mjs` | `plan` | no (pure; lock-free *reads* of prior/own registry only) |
| | `run` | yes — `<reportDir>/swarm-registry.json`, then payload on stdout |
| | `record` | yes — fills `agentId` on registry members |
| | 7 exports | — |
| `ufo-swarm-wave.test.mjs` | 100 tests, own harness | spawns the CLI |

Exit codes (header `:112`; code `:1349-1352`): 0 ok · 1 invalid spec/plan (JSON error on stderr) ·
64 usage. `--emit-tasks` is refused together with `run` (`:1831`).

## Not carried by the source

- `plan` creates no filesystem artifact — the `.ufo/scopes/<wave>/` path is computed and recorded in
  the plan, materialized only by `run`/`record` via `writeRegistry` `:629`.
- The schema ids are not importable JS symbols.
- `main` takes no `--help`/version argv; unknown argv → usage error (exit 64).

## Unknowns

- Other importers of the 7 exports beyond the co-located suite (not traced; needs a tree-wide grep
  or an LSP references pass).

## Overlap (explicit)

The refusal taxonomy, band arithmetic, registry/resume ownership, and prompt-composition rules are
the **wave-smith** shokunin's subject and are *not* derived here. The two cards overlap on this file
by *question* (surface vs. contract), not by file.