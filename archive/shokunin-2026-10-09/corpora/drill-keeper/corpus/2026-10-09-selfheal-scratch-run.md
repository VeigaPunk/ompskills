# selfheal-scratch-run — observed fixture-harness runs

Asked: run the fleet fixture harnesses with every write redirected to scratch, and prove the substrate is untouched.
Anchor: `ufo-fsd-alpha@5ace2559` (read-only); `config/ufo.json` cited from the working copy (sha256 `0e416f0a…`, uncommitted swarm-band edit only). Lane: `SelfhealScratchRun` (executor). Scratch: `.tower/fleets/shokunin3/scratch/drill-keeper/SelfhealScratchRun/`.

## Observed
- `TMPDIR=<scratch>/tmp node scripts/fleet-selfheal-verify.mjs --fixtures-dir <scratch>/selfheal/fixtures --report …` → **exit 2**, refused at preflight: `--fixtures-dir must be beneath TMPDIR or .ufo/scopes/selfheal-prove`. The confinement gate works, and the paths must sit **under** `$TMPDIR` itself.
- Confined form (`--fixtures-dir <scratch>/tmp/selfheal/fixtures --report <scratch>/tmp/selfheal/report.json`, cwd substrate) → **exit 0, 4.39 s, passed 27 / failed 0 / skipped 9, verdict PASS**. Skips: `preswap_evidence_present, preswap_view_ok, preswap_segment_coverage, preswap_event_count, preswap_malformed_zero, preswap_once_ok, preswap_once_no_truncation, preswap_once_no_drift, preswap_once_no_appended` (preswap dir retired).
- `UFO_TEST_SCRATCH=<scratch>/dispatcher TMPDIR=<scratch>/tmp node scripts/fleet-dispatcher.test.mjs` → **exit 1, 5.32 s, 236/246**. Failing: `throwsib_status_ok, throwsib_read_module_error, throwsib_reader_inline, throwsib_modules_typed, throwsib_coverage_degraded, throwsib_once_ok, throwsib_rotate_module_error, throwsib_unshrunk_fired, watchdog_big_repend_parsed, watchdog_big_repend_landed`. Reproduced with `--keep`. Children reported `dispatcher_usage_error`; root cause analysed in `dispatcher-test-suite`.
- Tracked substrate state was identical before and after (13 `git status` lines; same `.ufo/scopes`).
- **Gitignored state is not clean:** ~580 entries in `<substrate>/.ufo/cache/node-compile/`, because this host exports `NODE_COMPILE_CACHE=<substrate>/.ufo/cache/node-compile` (L1-verified), and 11 files in `.ufo/cache/transcript-scan/` (`scripts/ufo-sighting-lib/observe.mjs:149`; concurrent sibling daemons write here too, so attribution is shared).

## Rule learned
For a substrate-clean fixture run on this host: set `NODE_COMPILE_CACHE=` (empty) or point it at scratch, put every path flag beneath `$TMPDIR`, and diff `git status` before and after. Gitignored `.ufo/` writes are still writes into the read-only substrate.
