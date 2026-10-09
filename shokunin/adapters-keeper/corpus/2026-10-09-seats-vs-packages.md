# seats-vs-packages — substrates/<seat>/ vs packages/<seat>/

Asked: the relationship between the seat executables and the adapter packages.
Source: lane SubstratesCli (`reports/adapters-keeper/SubstratesCli.md`).

## Observed

- `substrates/<seat>/` (7 seats): `bin/cli.mjs` + `package.json` + `substrate.json` —
  the **executable launcher**. All seven cli.mjs are byte-identical
  (sha256 ba6e9985…) and delegate to `runLaneCli` in
  `packages/substrate-runtime/src/lane-cli.mjs`; all verb logic lives in
  substrate-runtime. Seat id = `substrate.json.name`.
- `packages/<seat>/` is **content** (skills/agents/ssot/generated native mirrors) —
  never executed, no bin.
- Shared seat contract: doctor/capabilities/selfcheck/version/self-iter — implemented
  once in substrate-runtime, exercised through every shim.
- The only adapter package with a package.json is substrate-omp
  (@ufo/substrate-omp-content); the six seats' content dirs have none — but every
  `substrates/<seat>/` has its own package.json (the launcher package, e.g.
  @ufo/substrate-omp — **naming hazard**: substrate-omp exists twice, content vs seat).
- Probe at anchor: `node substrates/<seat>/bin/cli.mjs version` exits 1 for all 7 —
  ERR_MODULE_NOT_FOUND @ufo/substrate-runtime (no node_modules in checkout). Expected;
  not a defect.

## Contract

Answer "is X the adapter or the seat": adapter = `packages/<name>` content projection;
seat = `substrates/<name>` executable. omp's pair is the asymmetric one:
`substrates/omp` ↔ `packages/substrate-omp` (not `packages/omp` — doesn't exist).

## Unknowns

- doctor/selfcheck/capabilities/self-iter behavior unobserved (needs install).
- `packages/devin/.devin/skills/ufo` declared in substrates/devin/substrate.json but
  absent on fresh clone (gitignored, contracts:sync creates it).
