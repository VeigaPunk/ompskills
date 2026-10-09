# self-test-probes — `node scripts/ufo-drills.mjs --self-test`

Asked: the probe catalog, whether it is write-safe, and which load rules lack probes.
Anchor: `ufo-fsd-alpha@5ace2559` (read-only); `config/ufo.json` cited from the working copy (sha256 `0e416f0a…`, uncommitted swarm-band edit only). Lane: `SelfTestProbes` (mutation-tester). Mutants ran only in a scratch copy; the substrate file hash `4572d182…` was unchanged before and after (L1-verified).

## Observed run (substrate, cwd root)
Exit 0. Tail: `self-test: 58/58 drill probes rejected, 12/12 argv probes rejected, 16/16 predicate probes correct, 4/4 finalize probes correct, 3/3 drill controls + 5/5 argv controls accepted`.

## Write behaviour
- `runSelfTest` (`:1216-1498`) writes only into `mkdtemp()` = `mkdtempSync(join(UFO_DRILL_TMP || tmpdir(), "ufo-drill-"))` and removes it. It never touches `summary.json`, evidence, or cargo.
- Caveat: a **relative** `UFO_DRILL_TMP` resolves against the repo root (`:580-583`), so the header claim "writes nothing under the repo" is false in that case.
- Ambient `NODE_COMPILE_CACHE` on this host points into `<substrate>/.ufo/cache/node-compile`. Any node run writes there. Set `NODE_COMPILE_CACHE=` (empty) for a truly read-only run.

## Catalog
58 negative drill probes, each mapping a probe id to an expected refusal substring: path escapes (`repo-relative path`), status/executor, `id must equal its filename stem`, unknown keys, vacuous/empty expect, duration bounds, pending/referenced discipline, `cannot target handoff.json`, retain collision, malformed JSON, schema mismatch, per-executor required keys, needle rules. Also 12 argv probes, 16 predicate (`resultLineRan`) probes, 4 finalize probes, and 3 drill + 5 argv positive controls. Census floors live at `:1475-1490` (drill 58 exact; argv floor 11 against 12 probes, so one argv probe can be deleted silently).

## Mutation result
42 mutants: 32 killed, 20 survived, 1 equivalent, 2 tooling artifacts. Load rules that break silently (no probe): `expect.exit < 0`, `realRepo` must be `true`, setup bans for shell/cargo/node/judge, cargo `test.name`, node-test `namedTestRan` append, shell argv element type, `reportAll` object shape, referenced isFile/containment, `pendingReason` trim, pending retain ban, finite `reportGte`.
