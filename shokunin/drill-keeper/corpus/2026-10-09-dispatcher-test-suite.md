# dispatcher-test-suite — `scripts/fleet-dispatcher.test.mjs`

Asked: the suite's fixture contract: case tree, env, scratch, check count, exit semantics. (test-smith owns the ompskills suites; this is the substrate suite.)
Anchor: `ufo-fsd-alpha@5ace2559` (read-only); `config/ufo.json` cited from the working copy (sha256 `0e416f0a…`, uncommitted swarm-band edit only). Lane: `DispatcherTestSuite`.

## Fixture contract
- Scratch: `UFO_TEST_SCRATCH || "/scratch/tmp/vgpnk"`; a failed mkdir falls back **silently** to `tmpdir()` (`:39-50`); `FIXTURES = mkdtempSync(…/fleet-dispatcher-test-)`; `--keep` skips cleanup at `:3266`.
- `makeCase` (`:182-217`) writes: `config/ufo.json` with **only** `sighting.windowPaneCeiling 4` and `sighting.dispatch` (a fixture subset, not the live config); `config/mission-nightcall.yml`; `.ufo/omp-global-config.yml` (a case-local alias table); `status.json`; `.ufo/sighting/manifest.json`; `sighting-stub.mjs`, which echoes `UFO_STUB_STATUS_PATH`.
- `runDispatcher` (`:227-249`): `cwd: ROOT` (the real substrate) and `{...process.env, UFO_PROJECT_ROOT, UFO_STATE_DIR, UFO_CONFIG_PATH, UFO_OMP_GLOBAL_CONFIG_PATH, UFO_FLEET_LEDGER_PATH, UFO_PENDING_WORK_PATH, UFO_SIGHTING_PATH, UFO_FLEET_ALLOW_EXTERNAL_TOOLS=1, UFO_STUB_STATUS_PATH, UFO_XBRD_SPARK_ROOT, UFO_FLEET_POLL_SEC=1}`. The ambient env spreads first, so operator values for unpinned keys leak in.
- **Non-uniform env:** `runLocal` (`:464-475`, the copied-dispatcher "throwing siblings" cases) and the `rependTask` child env (`:1722-1733`) omit `UFO_OMP_GLOBAL_CONFIG_PATH` (and `runLocal` also omits `UFO_FLEET_ALLOW_EXTERNAL_TOOLS`). Those children resolve `l1Alias` against the operator's real `$HOME` OMP config.
- Checks: 238 `check()` call sites (~246 at runtime because of loops). Header declares 5 areas; the body has 34 sections with colliding numbers. Exit 0 only with zero failures; an uncaught exception skips the verdict.

## Observed run (see `selfheal-scratch-run`)
At HEAD bytes, under fleet scratch: **exit 1, 236/246 passed**. Failing: 8 `throwsib_*` (runLocal) + `watchdog_big_repend_parsed`/`_landed` (rependTask) — exactly the two env sites above. An uncommitted working-copy diff appeared in the substrate at 15:49 local during this mission (not written by any drill-keeper lane; attribution open). It adds `UFO_OMP_GLOBAL_CONFIG_PATH` (+ `ALLOW_EXTERNAL_TOOLS`) to both sites, with comments naming this leak as the cause. [INFERENCE until the fixed bytes are run: that diff is the fix for the 10 failures.]
