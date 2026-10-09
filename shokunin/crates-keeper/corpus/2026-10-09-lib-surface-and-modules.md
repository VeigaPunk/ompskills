# ufo-core-runtime public surface and module map

Asked: lib.rs's public API and the grouped module inventory. Substrate
`5ace2559` (lanes LibSurface + ModuleMap; full reads/header scans).

## lib.rs (1186 lines)

- 20 `pub mod`, 28 `pub(crate) mod`, 4 private mod, 22 `pub use`,
  1 `pub(crate) use`; no root-level `pub fn`.
- `AgentRole` (execution_profile.rs:66-81): 14 variants; wire spelling
  differences — `Judge` is the mirror's `main`, `MutationTester` is
  `mutation-tester`/`mutation_tester`. `AgentRole::ALL` is hand-listed
  (execution_profile.rs:66-122), `canonical()` :285-298, `validate()`
  :357-392, `role_family`/`omp_chain` :554-563.
- `SUPPORTED_SUBSTRATES` (config.rs:7-8): omp kimi codex cursor opencode
  grok devin.
- CLI-imported constants: `SELF_ITER_WORKER_CONCURRENCY_DEFAULT = 64`
  (config.rs:20), `SELF_ITER_ROUND_BUDGET_DEFAULT = 6` (config.rs:15).
- Authority claim (lib.rs:6-7, :99 `pub use judge_handoff`): the crate is
  the sole L1 judge; `AGENTS.md:4-5` names it the only runtime and only
  judge.
- Test wiring: 24 `*_tests.rs` via `#[cfg(test)] #[path] mod tests`; 2 wired
  from lib.rs; 12 more inline `mod tests` blocks.

## Module groups (88 .rs files; 64 non-test)

- Judge core (23): `native.rs` + 21 `native_*` (agents, continuity,
  contract, digests, dispatch_topology, evidence, header, launch, ledger,
  plan_digest, profile, route, schema, scores, seat_coverage, seats,
  telemetry, text, transcript), `gate.rs` (:39 "admit iff ≥1 axis improves
  and none regress"), `axes.rs`, `axis_checks.rs`.
- Admission (2): `native_admission_rules.rs` (profile-admission grammar),
  `native_admission_text.rs` (sensitive-shape text + JS-parity coercions).
- Loop driver (11): `loop_driver.rs` ("canonical resumable UFO-FSD judge
  loop") + `_candidate/_digest/_dispatch/_dry/_judge/_open/_publish/_resume`
  + `report.rs`/`state.rs` as `#[path]` children (loop_driver.rs:45-48).
- Infrastructure (17): bounded_fs, bounded_fixture, fixture_spawn,
  cost_ledger, lease, lane_overlay, lanes, live, local_ship, distill,
  godspeed, l3_swarm, execution_profile, config, build_json, mutation,
  fs_durability.
- Ungrouped (11): lib, operator_guidance, probe, process_group, proposal,
  provenance, round, round_digest, rules, specialist, test_env.

## Flags from the scan

- `distill.rs`/`live.rs` read as judge-pipeline phases (dedupe before the
  gate; local Qwen distiller) though filed under infrastructure.
- `native_contract.rs:23` claims native.rs is 260344 bytes; current is
  ~29K — stale comment, unverified against git.
- Dead imports flagged: `native.rs:20-21` rayon under
  `allow(unused_imports)`; `native.rs:22-23` serde import claiming a
  native_tests consumer with 0 greps.
