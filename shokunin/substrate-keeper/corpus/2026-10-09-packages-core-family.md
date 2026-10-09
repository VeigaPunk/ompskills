# packages-core-family — the four npm workspaces

Asked: `packages/{ufo-core,contract-support,substrate-lib,substrate-runtime}` — name, owns, exports,
tests, dist, and the dependency graph. Source: lane PackagesCoreFamily report.
Anchor: ufo-fsd-alpha@5ace2559.

## Observed

| package | name | lang | owns | exports | tests | dist |
| --- | --- | --- | --- | --- | --- | --- |
| `packages/ufo-core` | `@ufo/core` | TypeScript | TS Pareto/paper contract checks (pareto, policy R1–R4, planner WWKD token, orchestrator, saturation, memory, table5, wave); canonical runtime is Rust | `exports["."]` → `dist/index.{js,d.ts}` | 7 `src/*.test.ts` compiled → `node --test dist/**/*.test.js` | `dist/` (tsc, gitignored) |
| `packages/contract-support` | `@ufo/contract-support` | TypeScript | guidance/mirror validation wire + paper evidence batteries; no execution runtime; ships generated skill-mirror `assets/ufo` | `exports["."]` → `dist/index.{js,d.ts}` | 2 `src/*.test.ts` | `dist/` |
| `packages/substrate-lib` | `@ufo/substrate-lib` | JSON/data only | packed schema SSoT: `schemas/substrate-capabilities.json` (v3) + `titanium-cli-machine-map.schema.json` (consumed by `crates/ufo-cli/src/titanium.rs`); no CLI | `{"./schemas/*": "./schemas/*"}` | **none** (absent from root chain) | none |
| `packages/substrate-runtime` | `@ufo/substrate-runtime` | JS ESM (`.mjs` + hand-written `.d.mts`) | shared JS CLI runtime for the 7 substrates: lane-cli, capability loader, host probe/status, package verbs, seat skills, repo-root resolution, self-iter delegation, primeagent digest | 6 explicit `.mjs` subpaths → `./src/*.mjs` | 6 `test/*.test.mjs` (no build) | none (`src/` is the artifact) |

- Dependency edges (observed): `@ufo/contract-support → @ufo/core` (`batteries.ts:22`);
  `@ufo/substrate-runtime → @ufo/substrate-lib` (`capabilities.mjs:17,41`);
  `substrates/<7 ids> → @ufo/substrate-runtime` (`substrates/*/package.json`; `bin/cli.mjs:2`);
  `@ufo/core` and `@ufo/substrate-lib` have no family deps.
- Root `npm test` order: `build:portable` → `@ufo/core` → `@ufo/contract-support` →
  `@ufo/substrate-runtime` → `node --test tests/*.test.js`; `@ufo/substrate-lib` is never directly tested.
- `tsconfig.base.json` `$comment` (quoted): "noEmitOnError is load-bearing, not tidiness. tsc emits by
  default even when type checking fails, and several gates import package dist/ output. A failed build
  therefore used to leave importable JavaScript behind… That is the paper's fabricated-evidence
  failure in the Node half of the repo". Applies to `@ufo/core` and `@ufo/contract-support` only.
- No `dist/` exists in the checkout; `.gitignore` has `**/dist/`; none of the four ships tracked build
  output. No `ufo-skill-scope.json` in any of the four (only the CLI-family package roots carry it);
  `contract-support/assets/ufo/**` **is** a generated mirror target of `sync-ufo-contracts.mjs:102`
  ("contract-asset"), drift-checked by `contracts:check`.

## Contract

| rule | anchor |
| --- | --- |
| The four workspaces are exactly those declared in `package.json:6-11` | `package.json` |
| No `bin` in any of the four — executables live in `substrates/*/bin/cli.mjs` | report |
| `@ufo/substrate-runtime` does not export `host-status.mjs`, `repo-root.mjs`, `seat-skills.mjs` (internal despite tests) | report |
| `noEmitOnError` is a contract, not tidiness | `tsconfig.base.json` `$comment` |
| `@ufo/substrate-lib` schemas are hand-authored packed SSoT (no generator found) | report |

## Not carried by the source

- No `bin` field in any of the four; no scope tags; no `.d.mts` for the three internal runtime
  modules; no `dist/` present; whether `packages/*/dist` is ever published is not observable
  (all four are `private: true`).

## Unknowns

- Whether `@ufo/substrate-lib`'s schemas are checked against a generator (none found referencing
  `substrate-capabilities.json` outside docs/evidence). `package-lock.json` workspace entries /
  `node_modules` link layout were not inspected.