# test-name-resolution — do the named tests exist?

Asked: for every wired cargo-test and node-test drill, does `test.name` name a real test that is unambiguous under the runner filter?
Anchor: `ufo-fsd-alpha@5ace2559` (read-only); `config/ufo.json` cited from the working copy (sha256 `0e416f0a…`, uncommitted swarm-band edit only). Lane: `TestNameResolution` (reviewer; grep only, cargo not run).

## Observed
- 25 cargo-test drills: all 25 names are `#[test] fn` in compiled modules (none `#[ignore]`d), under the default `-p ufo-core-runtime` lib, `--test loop_driver` (3), or `-p ufo-cli --test cli_contract` (1).
- 7 node-test drills: each name is a substring of exactly one `test(...)` title in its `test.file` (`tests/collect-omp-native-handoff.test.js` or `tests/run-omp-native-trial.test.js`).
- **0 filter collisions** under cargo's substring filter or node's `--test-name-pattern` regex.

## Caveat
Existence is not passing: neither cargo nor node was run. The harness's own guard (`namedTestRan`, see `test-executors`) catches a zero-match filter at run time, except the file-name false-green.
