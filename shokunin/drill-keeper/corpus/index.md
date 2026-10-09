# drill-keeper corpus — index

Append-only. Read the rows relevant to an assignment before starting; append one row per new entry after finishing. Never rewrite, reorder, or delete a row or an entry file.

Seed anchor: `ufo-fsd-alpha@5ace2559` (read-only). `config/ufo.json` was read from the working copy (sha256 `0e416f0a…`); its uncommitted diff touches only `sighting.dispatch.swarm` band keys, so every drill/fixture key matches HEAD. File anchors at seed: `scripts/ufo-drills.mjs` sha256 `4572d182…` (1726 lines), `drills/` 67 files, `drills/fixtures/loop_specialist.py` `92564755…`, `fixtures/loop_specialist.py` `2c547b45…`, `scripts/fleet-dispatcher.mjs` `ba5e02be…` (9829), `scripts/fleet-dispatcher.test.mjs` HEAD blob (3268; working copy carries an uncommitted diff, see `dispatcher-test-suite`), `scripts/gates.sh` `aa5fcad6…` (1001), `scripts/fleet-selfheal-verify.mjs` `6ead53cb…` (1103). Re-hash before trusting a line number. Source wins over every note, spec, and prior corpus entry.

| entry | topic | added |
| --- | --- | --- |
| 2026-10-09-drills-block.md | the `drills` block of config/ufo.json: shape, validator, dead `enabled`, stale note | 2026-10-09 |
| 2026-10-09-fixture-budget-keys.md | fixtureRoundBudget / proposalsPerLane: readers, validation, TS-only consumers | 2026-10-09 |
| 2026-10-09-fixture-profile.md | portable fixture profile keys: orchestrator, lanes[], fixtureAxes, substrates | 2026-10-09 |
| 2026-10-09-orchestration-config-struct.md | config/orchestration.json as the OrchestrationConfig Rust contract; absent by design | 2026-10-09 |
| 2026-10-09-budgets-mirror.md | budgets: same wire names, different validators, absent-is-invalid only on ufo.json | 2026-10-09 |
| 2026-10-09-membrane-mirror.md | fixture-loop membrane: MembraneConfig, inert here, 'single-sourced' false for fixtures | 2026-10-09 |
| 2026-10-09-recovery-mirror.md | recovery: same names/defaults, required-vs-defaulted split, d-herd the only writer | 2026-10-09 |
| 2026-10-09-spec09-doctrine.md | Spec 09 + A-09 intent vs what landed | 2026-10-09 |
| 2026-10-09-drill-schema.md | ufo-drill-v1 load contract: key sets, per-status rules, refusals, exit 2 | 2026-10-09 |
| 2026-10-09-shadow-executors.md | self-iter and sync-check: shadow tree, setup order, argv, env, d-herd trace | 2026-10-09 |
| 2026-10-09-test-executors.md | cargo-test, node-test, judge-handoff, shell: argv, env, guards, d-double break | 2026-10-09 |
| 2026-10-09-assertion-engine.md | the 17 expect keys, verdict rule, report location, latent gaps | 2026-10-09 |
| 2026-10-09-evidence-layout.md | .ufo/drills/<id>/ files, result.json keys, summary.json, no atomicity | 2026-10-09 |
| 2026-10-09-coverage-ratchet.md | the coverage invariant is a 1:1 per-class ceiling, not a ratchet | 2026-10-09 |
| 2026-10-09-drills-cli.md | ufo-drills.mjs flags, refusals, exit codes, --list format, build side effect | 2026-10-09 |
| 2026-10-09-self-test-probes.md | --self-test: probe catalog, observed 58/12/16/4 pass, mutation survivors | 2026-10-09 |
| 2026-10-09-drill-census.md | the 67-drill matrix: status/executor/invariant aggregates and invariant gaps | 2026-10-09 |
| 2026-10-09-pending-drills.md | the 11 pending-mechanism rows: what each waits on and which are stale | 2026-10-09 |
| 2026-10-09-referenced-drills.md | the 5 referenced rows: existence-only resolution, every :line anchor misses its test | 2026-10-09 |
| 2026-10-09-test-name-resolution.md | all 32 cargo/node drill test targets exist and are filter-unique | 2026-10-09 |
| 2026-10-09-loop-specialist-fixture.md | the fixture route: two forked loop_specialist.py copies, scenario grammar, route names | 2026-10-09 |
| 2026-10-09-charter-phase0-runner.md | the real drill runner: ufo charter sign Phase 0 stage 3 | 2026-10-09 |
| 2026-10-09-gates-drills-history.md | the gates.sh drills stage: added 4f10fbff, gated faf466b2, stripped 91cc18fe; residue | 2026-10-09 |
| 2026-10-09-gates-fixture-stages.md | gates.sh vocabulary, census, fast/full tiers, fleet fixture stages and their env | 2026-10-09 |
| 2026-10-09-dispatcher-test-suite.md | fleet-dispatcher.test.mjs as a fixture harness: makeCase tree, env pins, leaks, checks | 2026-10-09 |
| 2026-10-09-selfheal-verify.md | fleet-selfheal-verify.mjs: exits, report schema, confinement preflight, defaults that write substrate | 2026-10-09 |
| 2026-10-09-selfheal-scratch-run.md | observed: selfheal 27 pass/0 fail/9 skip; dispatcher suite 236/246; substrate cache leaks | 2026-10-09 |
| 2026-10-09-dispatcher-fixture-hooks.md | fleet-dispatcher.mjs env hooks, gatedExecPath, classifier fixture, verb side effects | 2026-10-09 |
| 2026-10-09-fixture-route-rule.md | 'fixture routes only, never live providers': prose vs enforcement, gaps | 2026-10-09 |
| 2026-10-09-drill-docs-drift.md | cross-surface drift table for drill/fixture claims | 2026-10-09 |
