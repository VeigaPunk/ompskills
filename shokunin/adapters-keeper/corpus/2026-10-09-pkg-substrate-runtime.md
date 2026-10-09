# pkg-substrate-runtime — packages/substrate-runtime (@ufo/substrate-runtime)

Asked: inventory + role of packages/substrate-runtime.
Source: lane SubstrateRuntimePkg (`reports/adapters-keeper/SubstrateRuntimePkg.md`).

## Observed

- Workspace member 4/4. `@ufo/substrate-runtime` 0.1.0, private; single dep
  `@ufo/substrate-lib 0.1.0`; 6 exports, no bin; untranspiled ESM.
- src/: 10 modules + 6 `.d.mts`. `src/lane-cli.mjs:27 runLaneCli` is the shared entry
  all 7 `substrates/<id>/bin/cli.mjs` delegate to — the seat CLI contract
  (doctor/capabilities/selfcheck/version/self-iter) lives here once.
- test/: 6 files, 24 test() blocks (none cover primeagent-refinement.mjs — that's
  root tests/' job).
- Importers: the 7 seat CLIs, root tests (primeagent-substrate-cli-delegation,
  route-probes, host-probe, recovery, refinement-digest),
  scripts/primeagent-recovery-assess.mjs, .omp/hooks/pre/primeagent-assimilation.js.
- Judge authority is **declared+enforced** here (capabilities.mjs:95-117,
  mayJudge:false in substrate-lib :23) but **lives** in crates/ufo-core-runtime —
  this package enforces the boundary, it doesn't judge.
- Never reads automaticSubstrate/runnerUpSubstrate.

## Contract

The load-bearing workspace: the seat executables are 3-line shims over it. A substrate
question that ends "what does the seat do" resolves here, not in packages/<seat>.

## Unknowns

- npm test pass/fail at anchor (docs cite 19/20/22 different counts — stale);
  node_modules link unmaterialized; docs/GOAL-STATUS.md:249 stale host-probe ref.
