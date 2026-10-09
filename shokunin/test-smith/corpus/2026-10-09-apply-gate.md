# 2026-10-09 — host/apply.mjs as the tests' hard gate

**Asked.** What does `host/apply.mjs` do (dry run vs `--apply`, delta merge,
backups), why does `run-wave-test.mjs` treat the dry run as a hard gate, and
what is the candidate global config for? (Lane `ApplyGate`, scout.)

**Observed.** Sources: `host/apply.mjs` (1041 lines);
`test/run-wave-test.mjs:406-456`; `host/ufo-sighting-dispatch.json`.

- CLI surface (`host/apply.mjs:155-183`, usage `:107-117`): `--apply`,
  `--ufo-root PATH` (default `/home/vgpnk/Projects/ufo-fsd-alpha`), `--ufo-json
  PATH`, `--install-target PATH` (default `~/.omp/agent/config.yml`),
  `--help`/`-h`. Exit codes 0 ok / 1 validation or apply failure / 64 usage.
  There is no `--verify` flag: the flagless invocation IS the verification pass.
- Dry-run path (`main` `:944-1011`): eight read-only gates — candidate
  preflight; the real resolver `omp-global-config.mjs` `readGlobalSeatRouting`;
  dispatch-delta bounds; the real `sync-global-routing.mjs`
  `renderSeatRoutingMirror` + `wholeTableAudit`/`splitRoute`; a replicated
  `build.rs` `validate_chain`; the real `ufo-swarm-wave.mjs plan` plus an
  injected post-apply band; `sync-global-routing.mjs --check` reported, never
  enforced; then the apply plan. Verdict: "DRY RUN PASSED … Nothing was
  written.", exit 0.
- `--apply` (`main` `:1013-1041`) writes exactly two files: the install target
  (copy of `host/omp-agent.config.yml`) and `<ufo-root>/config/ufo.json` (delta
  merged). Each target gets a sibling timestamped backup first — `backupFile`
  (`:842-849`) writes `<target>.<tag>.bak` with
  `tag = new Date().toISOString().replace(/[:.]/g, "-")` (`:141-143`), refuses
  to clobber an existing backup, and preserves the target's mode. The install
  writes via `writeAtomic` (temp + `renameSync`) and read-back-verifies the
  installed bytes equal the candidate.
- Delta merge (`planDispatchEdits` `:287-321`, `planNoteRewrite` `:336-349`,
  `mergeDispatch` `:894-942`): a surgical per-line value rewrite — for each
  changed key, exactly one line must match
  `^(\s*)"<key>"\s*:\s*([^,\n]*?)(,?)\s*$` or it fails closed ("refusing to
  guess"); unchanged keys are recorded and never touched; the prose band in
  `sighting.dispatch.swarm.note` is rewritten only if the old floor is spelled
  there. `mergeDispatch` re-parses and refuses to write unless the result
  equals an expected clone with only the delta applied — nothing outside
  `sighting.dispatch` may differ.
- Deliberately untouched (`DEFERRED_ARTIFACTS` `:88-93`): the bundled mirrors
  (`crates/ufo-core-runtime/bundled/omp-seat-routing.json`, `bundled/config.json`)
  and the AGENTS.md band/seat-table mentions; `contracts:sync`,
  `render-seat-tables.mjs`, and AGENTS.md are never invoked. The post-apply
  mirror check therefore emits an expected WARNING, not a failure.
- Wave gate (`:560-705`), two legs on the real planner: a real CLI leg writes a
  generated 32-lane spec to a temp dir and spawns `node
  scripts/ufo-swarm-wave.mjs plan --spec <tmp>` with `cwd: opts.ufoRoot` and
  `UFO_OMP_GLOBAL_CONFIG_PATH` = the candidate, requiring exit 0 and
  `counts.total === counts.spawn === 32` (32 sits inside both the live 32-100
  band and the post-apply 16-32 band); an injected leg calls
  `planSwarmWave(spec, {policy: postPolicy})` with the delta's 16-32/100 — 16
  admitted, 15 `too_few_lanes`, 32 admitted, 33 `wave_too_wide`, 101
  `too_many_lanes`.
- Hard gate in `test/run-wave-test.mjs` (`:406-456`): preflight spawns
  `node host/apply.mjs --ufo-root <root>` (no `--apply`) with cwd `REPO_ROOT`;
  transcript to `EVIDENCE/apply-dry-run.log`; nonzero exit calls
  `gate("preflight.apply", …)` — `gate()` (`:217-224`) stops the run via
  `finish(1)`, unlike `check()`. Rationale comment `:437-443`: "no verified
  candidate config, no test … its flagless invocation IS the verification pass,
  and it writes nothing." The gate is unconditional; `--verify` is accepted
  only as a wording alias (`:251-254`). It is doubly load-bearing: the runner's
  `loadAuthorities` (`:126-132`) reads the same candidate file as the routing
  authority for every role/family claim.
- Candidate config purpose: `host/omp-agent.config.yml` is installed to
  `~/.omp/agent/config.yml`, "the routing authority for ufo seat delegation"
  (`apply.mjs:22-24`). Its header documents the strict hand-rolled dialect the
  resolver enforces beyond plain YAML (one column-0 section each, two-space
  indent, no tabs/dupes, scalar map values, strictly-deeper `- item` chains,
  all 14 seats in `task.agentModelOverrides`, aliases naming concrete routes,
  every `retry.fallbackChains` key resolving). Two further gates read the
  derived table (`sync-global-routing.mjs` `splitRoute`, `build.rs`
  `validate_chain`); apply runs the first two for real and replicates the
  third.

**Changed.** Nothing — read-only research.

**Unknown.** The lane did not execute `apply.mjs`; the dry-run/apply behaviour
is read from source and the header contract. `build.rs` itself was not read
(the rule is reported via apply's replicated gate).
