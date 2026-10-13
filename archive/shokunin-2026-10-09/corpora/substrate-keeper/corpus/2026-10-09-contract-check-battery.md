# contract-check-battery — the five verifiers behind `npm run contracts:check`

Asked: what each contract-check script detects, the sets it declares, and which files are generated
vs hand-authored. Source: lane ContractCheckScripts report. Anchor: ufo-fsd-alpha@5ace2559.

## Observed

- `package.json:26` `contracts:check` chains all five: `sync-ufo-contracts.mjs --check &&
  project-devin-subagents.mjs --check && check-routing-free-config.mjs && render-seat-tables.mjs
  --check && check-hand-authored-sets.mjs`; `:27` `contracts:sync` runs only the three generators
  (sync, devin projection, seat tables). `package.json:22` wires `contracts:check` into `doctor`.
- `sync-ufo-contracts.mjs` (2273 lines): 13 `skillTargets` `:89-103`, 5 `agentTargets` `:169-175`,
  `godspeedDirectiveMirrors` `:104-114`, `bundledAssetMirrors` `:122-127`, charterlist validation
  `:311-379`, `cliFamilyScopes` `:178-199` + `unexpectedScopeTags` `:389-402`, `.omp/config.yml`
  projection `:1629-1668`, seat-routing mirror vs live global (`MIRROR_PATH` `:573-703`),
  sighting-surface digest `:52-63`, model-authority keys `assertNoProjectModelAuthority` `:450-462`,
  l1-overlay literal `:1766-1775`, tick-machine `:1780`, `constants:unique`/`docs:dates`,
  `skills/SHA256SUMS` `:1085-1097,2058-2078`, deps lock. `--check`/`--review` never write (all writes
  behind `if (!checkOnly)`); the mutating form rewrites every mirror and sweeps extras.
- `project-devin-subagents.mjs`: renders `.devin/agents/ufo-<role>.md` + `packages/devin/.devin/agents`
  (`:167-170`) from `agents/*.md` + `nativeProfiles.devin-native-v1` pins (no model fields `:172-254`);
  `--check` fails on missing/drifted/extra; sync writes and unlinks stale files.
- `render-seat-tables.mjs`: `TARGETS = ["AGENTS.md","docs/L2-L3-ROUTING.md"]` `:26`, generated markers
  `:27-28`, renders from the bundled mirror only; `--check` exits 1 on drift; missing/doubled markers throw.
- `check-hand-authored-sets.mjs`: pure scanner (no mutating form). `DECLARED_PRE_HOOKS =
  ["primeagent-assimilation.js","ufo-godspeed-inject.js","ufo-l0-monitor.js"]` `:35`;
  `config/mission-*.yml` = `missionFormat.configPath` (`:89-96`); `substrates/*` = config targets +
  README (`:108-113`); `packages/*` = targets (omp→substrate-omp) ∪ workspaces (`:118-122`); card
  lint keys `[name,description,ufo,spawns,tools]`, model refused, `spawns` only executor→labrat,
  no jobs, leaf-no-task, never-judge regex; orphan/missing/untracked_declared fail closed.
- `check-routing-free-config.mjs`: pure scanner; `ROUTING_KEYS = [modelRoles, agentModelOverrides,
  fallbackChains, modelRoutes, modelFallbacks]` `:20-22`; surfaces `config/**.{yml,yaml,json}`
  recursive + `.omp/*.yml` + `packages/*/.omp/*.yml`; 4 MiB bound; exit 0/1/2.
- Tests: sync 35 tests/242 asserts; devin 28/155 (incl. PIN-A…PIN-M); hand-authored-sets 4/22;
  routing-free 5/10; seat-tables 5/20 — 77 tests / 449 asserts. Wiring: `tests/` suites via `npm test`;
  the three co-located suites at `gates.sh:752-754`; `contracts:check` at `gates.sh:734` and `:887`.

## Contract

| script | detects | mutating form writes | tests |
| --- | --- | --- | --- |
| `sync-ufo-contracts.mjs` | mirror drift (skill/agent/bundled/directive/dep-closure), charterlist drift, scope-tag drift + strays, `.omp/config.yml` projection drift, seat-routing mirror vs live global, sighting-surface digest, model-authority keys, l1-overlay literal, tick-machine policy, `constants:unique`, `docs:dates`, `skills/SHA256SUMS`, deps lock | every mirror + scope tags + `.omp/config.yml` + `skills/SHA256SUMS` + seat-routing mirror | 35 / 242 |
| `project-devin-subagents.mjs` | missing/drifted/extra devin seat files; profile pins | the seat files at both targets; unlinks stale extras | 28 / 155 |
| `render-seat-tables.mjs` | drift of the marked seat-routing section; absent/doubled markers | the one marked section in the two docs (idempotent) | 5 / 20 |
| `check-hand-authored-sets.mjs` | set drift of hand-authored roots + card frontmatter lint | nothing (pure scanner) | 4 / 22 |
| `check-routing-free-config.mjs` | route tables in project config surfaces | nothing (pure scanner) | 5 / 10 |

**Authority map as the battery declares it.** GENERATED: the declared `skillTargets` skill mirrors
(`packages/substrate-omp/skills/ufo`, `.omp/skills/ufo`, `packages/{kimi,codex,cursor,opencode,grok,devin}/skills/ufo`,
`.cursor/skills/ufo`, `packages/cursor/.cursor/skills/ufo`, `.devin/skills/ufo`,
`packages/devin/.devin/skills/ufo`, `packages/contract-support/assets/ufo/skills/ufo`); the declared
`agentTargets` mirrors (`packages/substrate-omp/agents`, `.omp/agents`,
`packages/{kimi,cursor,devin}/agents`); the six literal directive mirrors plus each skill target's
`references/godspeed-core/directive.md`; the four bundled asset destinations under
`crates/ufo-core-runtime/bundled`; the five `packages/{substrate-omp,opencode,codex,grok,kimi}/ufo-skill-scope.json`
files; `skills/SHA256SUMS`; the `contractRevision` stamp **inside** `ufo-deps.lock` (the lock's
authored pins are not rewritten by ordinary sync); `.omp/config.yml`; the devin seat files
(`.devin/agents/ufo-<role>.md`, `packages/devin/.devin/agents/**`); and the marked seat-routing
sections of `AGENTS.md` + `docs/L2-L3-ROUTING.md`. HAND-AUTHORED: `skills/ufo/**`, `skills/wwkd/**`,
`agents/*.md`, `config/ufo.json`, `ssot/godspeed-core/**`, `ufo-deps.lock` authored pins,
`docs/ufo-fsd-charterlist.json`, `config/{l1-max-context.yml,the-tick.machine.json,mission-nightcall.yml}`,
`.omp/hooks/**` (3 pre hooks + statusline), `substrates/*`, `packages/*`, `.omp/ufo-l1.yml`.

## Not carried by the source

- No test count is gate-asserted (counts are `grep -c` metrics). `--check` does not verify the
  seat-routing table's live global equivalence on projection roots (it validates the checked-in
  mirror structurally, `:587-590`). The battery carries no self-heal — repair only in `contracts:sync`.
  `check-hand-authored-sets.mjs` enumerates only `^mission-.*\.yml$` under `config/`, so
  `config/ufo.json.*.bak` residue matches no set filter (and `.bak` does not match the routing
  scanner's `CONFIG_EXT`).

## Unknowns

- `docs/L2-L3-ROUTING.md` marker contents, `ufo-deps.lock` pin values, and the charterlist JSON body
  were not opened (only the validators' expectations are anchored). Whether the two live-tree green
  tests currently pass was not probed (running suites is forbidden for a read-only lane).