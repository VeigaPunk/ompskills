# pkg-substrate-lib — packages/substrate-lib (@ufo/substrate-lib)

Asked: inventory + role of packages/substrate-lib.
Source: lane SubstrateLibPkg (`reports/adapters-keeper/SubstrateLibPkg.md`).

## Observed

- Workspace member (root package.json:7-12). `@ufo/substrate-lib` 0.1.0, private.
  **Contains no code**: 2 schema data files + README + package.json; export map
  `./schemas/*` only.
- `schemas/substrate-capabilities.json` (v3, plain data — not JSON Schema):
  universalVerbs, exitContract, supportedSubstrates (7 hosts), native-surface role.
  Consumer: `@ufo/substrate-runtime/src/capabilities.mjs` — resolves it and
  shape-checks only.
- `schemas/titanium-cli-machine-map.schema.json` — real draft-2020-12 JSON Schema.
  Consumer: `crates/ufo-cli` titanium.rs — `include_bytes!` + jsonschema validation
  of docs/titanium-cli-machine-map.json.
- No `substrates/<id>/package.json` depends on it directly — they depend on
  @ufo/substrate-runtime (which depends on @ufo/substrate-lib).
- No test or script imports it; both JSON files parse; no gate stage byte-checks the
  schemas themselves.

## Contract

Data/schema authority consumed **through** substrate-runtime and Rust — adapters never
validate against it directly. "Shared contract" for the adapter matrix means the
capability vocabulary it declares, not a schema each adapter passes.

## Unknowns

- Current Rust validate_schema pass state; jsonschema crate Draft 2020-12 feature
  support; node_modules/@ufo/substrate-lib link unobserved (none in checkout).
