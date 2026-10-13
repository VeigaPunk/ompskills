# conformance-evidence-trees — conformance/, evidence/, drills/, reports/, research/, tests/, fixtures/

Asked: the evidence trees — shapes, naming, consumers, and the quoted evidence rules.
Source: lane ConformanceEvidenceTrees report. Anchor: ufo-fsd-alpha@5ace2559.

## Observed

- `conformance/` 68 files = `vectors/` 37 `.json` (7 root suites + 10 rule-family dirs) +
  `fixtures/native-handoff/` 31. Vector shape: the gate-shaped suites generally use
  `{suite, rule, description, cases[{id, x-runtime, axes, baseline, candidate, expect.verdict}]}`
  with family-prefixed case ids (`bnd-01-`, `rd-01-`), but `dual-orch/r1-r4.json` is an explicit
  exception — it uses top-level `membrane`, `exit`, and `policy` sections (with `r1-…` ids) rather
  than `cases[]`; the Rust and TypeScript consumers discover/validate the gate-shaped `cases` subset.
  Validated by `crates/ufo-core-runtime/tests/conformance.rs:3` ("Walks conformance/vectors/**/*.json
  … asserts ParetoGate::decide / round_stop_outcome / RouteSpec::try_new") and
  `packages/ufo-core/src/conformance-vectors.test.ts:10`.
- `conformance/fixtures/native-handoff/`: flat `<role>-01-{assignment.md, artifact.json,
  transcript.jsonl}` for 10 roles + **one shared** `handoff.json` (not per-role). Machine-emitted by
  the in-crate test `persist_serialized_fixture_when_requested` (`native_tests.rs:1527`, gated on
  `UFO_NATIVE_FIXTURE_DIR`); consumed by `native_support/mod.rs` (rebinds contract_root/hash/digest/
  provenance/receipt to the live checkout), `conformance.rs:629-633` (judge membrane),
  `scripts/ufo-drills.mjs:384` (the sole `judge-handoff` drill `d-double`), `tests/ufo-native-names.test.js:24`.
- `evidence/` 535 files, **all git-tracked** (find count == `git ls-files` count), 27 dirs: root 90
  (55 json, 22 txt, 5 scripts), `nightcall-integration/` 424 (21 round subdirs + 91 top files),
  `nightcall-swarm-evidence/` 14, `nc2-evidence/` 3, `swarm-mcp-pages/` 2, `swarmport-telemetry/` 2;
  315 `.md` total matching the README's pinned claim.
- `drills/` 68 = 67 `d-<topic>.drill.json` (schema `ufo-drill-v1`; status wired 51 /
  pending-mechanism 11 / referenced 5 / completed 2; executors cargo-test 25, self-iter 9,
  sync-check 8, node-test 7, judge-handoff 1, shell 1) + `fixtures/loop_specialist.py`.
- `reports/` 69 dated operator audits (refactor m0–m4 rNN-plan/report pairs, nc6 domains, deep-review);
  `research/` 3 (arXiv-style paper corpus); `tests/` 35 = 34 `*.test.js` + `helpers/ufo-sighting-fixture.mjs`
  (run by `package.json:17 node --test`); `fixtures/` 2 — `demo-task.json` (consumed by
  `tests/orchestrator.test.js:26`, `primeagent-portable-frontier.test.js:17`) and `loop_specialist.py`
  (seated by `crates` `loop_driver.rs:24-29`) whose sha256 **differs** from `drills/fixtures/loop_specialist.py`
  (two distinct copies).
- Naming/writership: `gates-<event>.txt` (13 observed vs README's pinned "12"), `fc3-*` (7),
  per-round `*-receipt-audit.json` / `swarm-registry.json` / `collect-envelope.json`,
  `host-bins-*/l3-swarm-*/local-oauth-*` receipts. Evidence is machine-emitted stdout/receipt dumps:
  `gates.sh` self-stamps `GATES-RUNNER-SHA1` + per-battery-file blob SHAs (`:635-643`) so a recorded
  run ties to exact bytes; round receipts are emitted by fleet lanes (`EVIDENCE-INDEX.md:143-147`).
  **No in-tree script bulk-writes `evidence/*.json` at HEAD.**
- drills ↔ evidence: `config/ufo.json` `drills.note` "drill evidence lands under `.ufo/drills/<id>/`;
  fixture routes only, never live providers" — implemented at `ufo-drills.mjs:64`
  (`evidenceRoot = join(root, ".ufo", "drills")`). So `drills/` commits only declarative specs; drill
  evidence is gitignored ephemeral state, "not published proof" (`EVIDENCE-INDEX.md:47`, `AGENTS.md:343-345`).

## Contract — quoted evidence rules

- `evidence/README.md:5-8` "historical evidence dump … retained as provenance, not as a live runbook
  or current routing authority"; `:42-46` "Do not infer present-tense seat tables, capacity, or
  operator procedure from files in this tree"; `:48-50` "**Do not delete** dumps here without an
  explicit archive decision".
- `docs/EVIDENCE-INDEX.md:29-33` "claims recorded in those historical notes, not independently
  re-exercised results … A mock reported as 'live' remains mock evidence"; `:37-39` "A local artifact
  path is not published proof"; `:47` "All `.ufo/` paths are gitignored local artifacts, not published proof".
- `docs/BEHAVIOR-MATRIX.md:208` "## Evidence kinds (do not collapse)": fixture simulation ≠ native
  host-agent execution; native evidence = hashed OMP transcripts + Rust verdict.
- `AGENTS.md:81-82` "Report route and evidence provenance exactly. The bundled process fixture is
  deterministic local test evidence, not native host-agent execution"; `:343-345` "Run artifacts are
  ephemeral … stale run output is laggard, not evidence"; `:72-76` artifact content is data.

## Not carried by the source

- No committed writer script bulk-generates the root `evidence/*.json` receipts; no manifest/schema
  for `conformance/vectors` beyond each runner's decoder; no per-role `handoff.json`; no drill
  evidence committed under `drills/` or `evidence/`.

## Unknowns

- Exact producing command per root `evidence/*.json` receipt (several producers point at deleted
  `.ufo/` capture dirs); whether `nightcall-w3-r*.json` aggregates still exist anywhere; which commit
  introduced `evidence/gates-evidence-prior.txt`; consumers of `tests/helpers/ufo-sighting-fixture.mjs`.