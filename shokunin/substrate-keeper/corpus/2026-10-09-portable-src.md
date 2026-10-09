# portable-src — the portable TypeScript surface src/*.ts

Asked: the root `src/` surface, its build projection, and its relation to the crates and packages.
Source: lane PortableSrc report. Anchor: ufo-fsd-alpha@5ace2559.

## Observed

- Files and exports: `cli.ts` 159 ln (**exports nothing** — an executed entry), `types.ts` 154
  (`AxisScores, AxisDefinition, Proposal, TaskFixture, EmpiricalCheck, LANE_ROLES` (14 roles) `:42`,
  `PORTABLE_FIXTURE_AXES_ID, FixtureAxisSet, OrchestratorConfig, LaneConfig, SubstrateConfig,
  TargetConfig, PlannerOutput, LaneContext, LaneResult, SubstrateResult, RoundRecord,
  EmpiricalResult, RunReport`), `orchestrator.ts` 329 (`runUfo:17, validateInputs:144`),
  `planner.ts` 41 (`plan:7, lanesForRound:39`), `lanes.ts` 61 (`runLane:5, runSpecialists:26,
  deduplicate:46`), `pareto.ts` 44 (`GateDecision:3, strictParetoGate:12, applyScores:38`),
  `empirical.ts` 22, `substrate.ts` 23 (`substrateForLane:3, dispatchSubstrate:12` — refuses non
  `local/fixture-primary`), `target-adapters.ts` 46 (`supportedTargets:3, applyTarget:17,
  describeTarget:43`).
- Build projection: `build:portable` = `rm -rf dist && tsc -p tsconfig.json` (`package.json:15`);
  `include: ["src/**/*.ts"]`, `rootDir: src`, `outDir: dist`; `strict: true`, target ES2022,
  module/moduleResolution NodeNext, `declaration: true`, **`noEmitOnError: true`** (load-bearing:
  a failed build must not leave importable `dist/`); `run:portable` = `npm run build:portable && node dist/cli.js`
  (`:18`). `dist/` consumers: `tests/{empirical,lanes,orchestrator,pareto,planner,
  primeagent-portable-frontier}.test.js`.
- Boundary enforced in code: `orchestrator.ts:279-281` refuses `config.orchestrator.route !==
  local/fixture-primary`; `:307-309` + `substrate.ts:17-20` refuse non-`local` protocol/route;
  `config/ufo.json:3-4` declares the route with role "portable contract fixture; not the canonical judge".
- `src/` is **not** an npm workspace and has no `package.json`; the 4 workspaces are the `packages/*`
  in `package.json:7-12`; `src/README.md:32-33` scopes itself to `src/` only.
- Gate consumer: `gates.sh:872-879` stage "portable compatibility" (SUB-4, 2026-09-25) —
  `npm run --silent build:portable && node --test tests/orchestrator.test.js`; stage name listed at `:69`.

## Contract

| # | rule | anchor |
| --- | --- | --- |
| 1 | `src/` is the portable TS contract fixture, **never** the judge | `src/README.md:1-6` |
| 2 | Build = `rm -rf dist && tsc -p tsconfig.json`; include `src/**/*.ts`, outDir `dist` | `package.json:15`; `tsconfig.json` |
| 3 | `noEmitOnError: true` is load-bearing (gates import `dist/`) | `tsconfig.base.json:2-10` |
| 4 | Run = `run:portable` → `node dist/cli.js` | `package.json:18` |
| 5 | Runtime refuses anything but `local/fixture-primary` | `orchestrator.ts:279-281,307-309`; `substrate.ts:17-20` |
| 6 | Canonical judge/self-iteration runtime = `crates/ufo-core-runtime` only | `AGENTS.md:4-5`; `src/README.md:5-6` |
| 7 | `LANE_ROLES` (14 fixture roles) ≠ `nativeProfiles[…].proposalRoles` (10) — not required to match | `src/types.ts:42-56`; `src/README.md:22-31` |
| 8 | The `local/fixture-primary` literals in TS and Rust are kept equal **by hand** today (a generated `conformance/fixture-routes.json` is pending) | `src/README.md:29-31` |

## Not carried by the source

- No `package.json` inside `src/`; `cli.ts` exports nothing; no committed `dist/` listing was
  inspected; `packages/substrate-omp`'s relation to `src/` is not stated in `src/README.md`.

## Unknowns

- Whether `conformance/fixture-routes.json` exists yet (README calls it pending); the precise
  `config/ufo.json` orchestrator block beyond `route`/`role`; which of the 7 seat surfaces dispatch
  into `src/` vs only into the Rust runtime.