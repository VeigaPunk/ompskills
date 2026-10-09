# pkg-contract-support — packages/contract-support (@ufo/contract-support)

Asked: inventory + role of packages/contract-support.
Source: lane ContractSupportPkg (`reports/adapters-keeper/ContractSupportPkg.md`).

## Observed

- Workspace member 2/4. **Sidecar, not the shared contract.** Runtime exports:
  canonical-wire validator (`buildContractWireReport`, `assertContractWire`,
  `writeContractWireArtifact`, src/contract-wire.ts) + paper batteries
  (src/batteries.ts). Holds hand-typed TS copies of `SUPPORTED_SUBSTRATES` (7) and
  `OPERATOR_GUIDANCE_THEMES` (3) mirroring Rust config.rs:7-8 +
  operator_guidance.rs:7-10.
- **Zero live importers**: no package/substrate depends on it; only smoke.sh:33
  (build) and sync:102 ('contract-asset' mirror target) reference it; no reader of
  .ufo/contract-wire.json; no gate compares the TS roster to the Rust roster.
- `assets/ufo/` (9 files): byte-identical mirrors of canonical skills/ufo, wwkd,
  ssot/godspeed-core — sync 'contract-asset' target, drift-checked by contracts:check.
- 7/7 substrates present in TS roster, Rust roster, and sync skillTargets.

## Contract

Despite the name, it is **not** the contract the adapters conform to — that contract
is the byte-mirror invariant enforced by sync+check. contract-support is a dormant
validation library + a mirror shelf.

## Unknowns

- Build/test state; whether the wire validator ever had a live caller;
  git-tracking of adapter dirs rechecked.
