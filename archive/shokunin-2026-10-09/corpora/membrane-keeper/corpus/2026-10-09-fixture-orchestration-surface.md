# fixture-orchestration-surface — where membrane{paths,action} is actually read

Asked: find the file the fixture loop reads for `membrane{paths,action}`; decide
what `bundled/config.json` is; who checks the mirror.

Observed (wave r1-w1 lane FixtureOrchSurface):

- Fixture read site: `crates/ufo-core-runtime/src/loop_driver.rs:506-516`
  `load_config` reads `<root>/config/orchestration.json`; `is_file` gate at
  :508 — **absent file silently returns `OrchestrationConfig::default()`**
  (membrane `None`, zero enforcement). `root` = `LoopDriver::open` arg; CLI
  self-iter passes `current_dir()` (ufo-cli main.rs:440-441, 482).
- `config/orchestration.json` is absent on the substrate: `test -e` fails, not
  git-tracked; it existed at commits 0c190b66/b2696a13 but no `--diff-filter=D`
  commit found. So the substrate's fixture loop enforces no membrane today —
  the native path (`config/ufo.json` via lib.rs:979) is the only live reader.
- `crates/ufo-core-runtime/bundled/config.json` is a whole-file copy of
  `config/ufo.json` (same 14 top-level keys), **not** an OrchestrationConfig
  (lacks required task/max_rounds/concurrency/axes). Membrane block is
  JSON-identical to live; whole file is NOT byte-identical (drift in
  `sighting.dispatch` only).
- Mirror checker: `sync-ufo-contracts.mjs` bundled-config copy pair (:1921-1925),
  compare loop (:1950-1995). Observed `node scripts/sync-ufo-contracts.mjs
  --check` → exit 1, `ok:false`, drifted includes `bundled/config.json`.
  `NATIVE_CONTRACT_FILES` and `validate_project_mirrors` do NOT cover it;
  `build.rs:155` reads it, compares no bytes.
- "Same names, separate surface" = same `membrane.{paths,action}` key names in
  two files with different shapes and different readers; the fixture surface
  cannot carry `note`/`screening` (deny_unknown_fields).
- Tests writing `config/orchestration.json` into a fixture root:
  loop_driver_tests.rs:3726,3782,4297; tests/loop_driver.rs:604,947,1368;
  drills d-herd and d-i1-second-l1 (scripts/ufo-drills.mjs:518-534).
  `run_orchestration_case` (conformance.rs:1552-1579) builds from `default()`
  — cannot express membrane.

Confidence: high for read path/hashes/gate; medium for "bundled can't
deserialize as OrchestrationConfig" (shape inference). Unknown: why/when
orchestration.json was removed.
