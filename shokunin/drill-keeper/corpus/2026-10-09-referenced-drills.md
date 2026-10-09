# referenced-drills — the 5 `referenced` rows

Asked: whether each reference resolves to a real file and test, and what the loader checks.
Anchor: `ufo-fsd-alpha@5ace2559` (read-only); `config/ufo.json` cited from the working copy (sha256 `0e416f0a…`, uncommitted swarm-band edit only). Lane: `ReferencedDrills` (static reading only).

## Observed
- All five (`d-t03-strict-hop`, `d-t04-resilient-hop`, `d-t05-undeclared-hop`, `d-t06-empty-pin`, `d-t07-effort`; spec 10) cite only `tests/collect-omp-native-handoff.test.js` with bare `path:line` anchors (10 in total). The file exists (4631 lines, the same at `72ab84a8` and HEAD).
- **None of the 10 lines lies inside the test the drill describes.** The cited lines are helper bodies or comments (`declareMainFallback`, `addHop`, `addMainHop`, `patchLaunchJson`, a section banner) or unrelated P2 tests. The anchors were already wrong at landing (no drift since).
- The real tests (one each, found by exact title): T04 `:2536`, T03 `:2701`, T05 `:2771` + `:2787`, T07 `:2815`, T06 `:2832`. No drill points at them.
- Loader rule (`scripts/ufo-drills.mjs:1097-1121`): non-empty string array; each entry's `:line` suffix is stripped (`:1108`); the path must `realpath` inside root and be a regular file. **No line-range or test-name check.** Referenced rows never execute (`:1620-1626`); `namedTestRan` applies only to the cargo-test and node-test executors.

## Drift
- `d-t06-empty-pin`'s summary matches test `:2832`, while Spec 10 T06 and the drill id describe the empty-chain pin test at `:2851`, which no drill references.
- Spec 10 T07 names `effort_unsupported`; the test and drill use `effort_unverifiable`.
- The strict-side T05 test (`:2723`) is unreferenced.

## Implication
A referenced row proves only that a file exists. To use one as coverage evidence, grep its title and read the test.
