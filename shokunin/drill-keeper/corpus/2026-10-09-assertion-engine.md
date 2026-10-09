# assertion-engine — `expect` semantics

Asked: every expect key, the vacuous-pass rule, where reports come from, and how one assertion decides a verdict.
Anchor: `ufo-fsd-alpha@5ace2559` (read-only); `config/ufo.json` cited from the working copy (sha256 `0e416f0a…`, uncommitted swarm-band edit only). Lane: `AssertionEngine` (source-only).

## Observed
- `EXPECT_KEYS` (17, `scripts/ufo-drills.mjs:104-109`): exit, outcome, report, reportGte, reportContains, reportContainsAll, reportAll, stdoutContains, stderrContains, artifacts, artifactsAbsent, durationGte, syncReport, syncMissing, syncDrifted, depsUnsatisfied, syncOk.
- `countAssertions` (`:137`) counts effective assertions; a wired drill with zero is refused at load ("zero assertions is a vacuous pass"); empty nested objects/arrays "assert nothing" and are refused too.
- Verdict: any failed assertion → `fail` (`:1642`). An `observed.exit = -1` (executor threw) always fails `childExit`. `retainedAbsent` is recorded but never fails a drill.
- Report source: self-iter → `<shadow>/.ufo/rs-self-iter-report.json` (parse error → sentinel); sync-check → `JSON.parse(stdout)` else `{ok:false, parseError:true}`. `getPath`/`deepEqual` walk dotted paths.
- `artifacts`/`artifactsAbsent` resolve against `observed.shadow`.

## Latent gaps
1. `syncOk:false` passes when sync stdout is not JSON (the parse sentinel has `ok:false`); `d-constants`/`d-docs-dates` narrow it with `stdoutContains`.
2. `getPath` has no prototype-key guard (`__proto__` walks into `Object.prototype`); setup.mutate does guard.
3. Cross-executor expect keys (sync keys on self-iter, report keys on sync-check) are not load-gated; they fail at run time.
4. On cargo-test/node-test/judge-handoff, `shadow = root`, so `artifacts*` would read the real tree; the corpus only uses them on self-iter.
5. `runSelfIter`'s `loop-state.json` parse (`:682`) is unguarded; a throw leaves the mkdtemp shadow behind because the catch sets `shadow: root`.
