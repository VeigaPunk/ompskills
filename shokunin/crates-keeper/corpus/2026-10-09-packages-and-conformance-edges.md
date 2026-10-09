# Crates ↔ packages/conformance edges

Asked: npm-side coupling and which conformance vectors the crates satisfy.
Substrate `5ace2559` (lanes PackageRelationship, ConformanceDocs).

## npm edge

- No npm package ships or installs the `ufo` binary; no postinstall/copy
  hook. Published bins are 7 Node shims (`substrates/omp/bin/cli.mjs` →
  `@ufo/substrate-runtime/lane-cli.mjs`).
- `packages/substrate-runtime` delegates to a PRE-BUILT binary
  (`self-iter-delegate.mjs:34-42` candidates, `:111-126` resolve,
  `:251,:302` spawn). `UFO_RUNTIME_CLI` is read only in its tests, not in
  the delegate source.
- Judge authority claims in npm land are parity comments only:
  `substrate-capabilities.json:20-24` native surface `mayJudge:false`;
  `src/README.md` declares the TS fixture "never the judge";
  `packages/ufo-core/src/pareto.ts` carries Rust-parity comments.
- `ports/ufo-core-runtime/SRC-PARTIAL.json`: provenance JSON only (tip,
  six upstream .rs names, no bytes); one Rust unit test reads it.

## Conformance

- `crates/ufo-core-runtime/tests/conformance.rs` walks
  `conformance/vectors/` (37 JSON files; 674 cases counted across
  cases/membrane/exit/policy groups); shape-based dispatch, uncovered
  shapes counted skipped. Fixtures: `conformance/fixtures/native-handoff`
  (11 artifacts; `handoff.json` feeds `judge_handoff`).
- Crate-naming vectors: `native/execution-profile.json` (ep-01..ep-07,
  canonical chains via execution_profile.rs:548 include!),
  `native/omp-route-yaml.json`, `handoff/{agent-gates,proposals-topology,
  dispatch-pairing}.json`, `misc/pure-validators.json:83`.
- NO vector mentions ufo-cli, route-plan, omp_role_chains, build.rs, or the
  seats.main.alias refusal — the compile gate is unpinned by vectors.
- The TS runner `packages/ufo-core/src/conformance-vectors.test.ts`
  consumes only `cases/membrane`.

## Doc contradictions found (do not copy into claims)

- KNOWN-GAPS.md:163-166 cites cargo gates at scripts/gates.sh:260-277 —
  gates.sh has zero cargo lines.
- CONFORMANCE-FINDINGS.md:26-27 cites `conformance/vectors/misc/
  swarm-wave.json`, `tests/ufo-swarm-wave.test.js`, `vectors/swarm-parity/`
  — all absent.
- `native/execution-profile.json:4` cites canonical at
  execution_profile.rs:247 — that's PlannerPolicy; canonical is :285.
