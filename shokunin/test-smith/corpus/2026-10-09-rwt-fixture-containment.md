# 2026-10-09 — run-wave-test fixture and containment discipline

**Asked.** How does `test/run-wave-test.mjs` build its fixture, contain its
writes, and gate on the apply dry run? (Lane `RwtFixture`, scout.)

**Observed.** Sources: `test/run-wave-test.mjs:226-360,406-524,1375-1422`;
`host/apply.mjs:9-11,34,111`; `host/ufo-sighting-dispatch.json`.

- Per-run evidence root: `stamp = new Date().toISOString().replace(/[-:]/gu,
  "").replace(/\.\d{3}/u, "")` (`:269`) → `YYYYMMDDThhmmssZ`;
  `EVIDENCE = opts.out ?? path.join(EVIDENCE_ROOT, \`wave-${stamp}\`)` (`:270`,
  `EVIDENCE_ROOT = test/evidence` at `:91`); `SCRATCH_ROOT =
  <EVIDENCE>/ufo-root` (`:271`); `FIXTURE_CONFIG = <SCRATCH_ROOT>/config/ufo.json`
  (`:276`); `REPORT_DIR` defaults to `test/evidence/<basename EVIDENCE>/lane-reports`
  (`:281`).
- Planner containment: `plannerEnv` (`:321-333`) returns
  `{...process.env, UFO_PROJECT_ROOT: SCRATCH_ROOT, UFO_FLEET_ALLOW_EXTERNAL_TOOLS: "1", ...extra}`;
  `waveCli` (`:341-352`) runs `process.execPath [WAVE_CLI, cmd, "--spec", path]`
  with that env; `band.env` sets `UFO_CONFIG_PATH` to the run's authority file
  (live or fixture), merged last. `main()` also sets
  `process.env.UFO_PROJECT_ROOT = SCRATCH_ROOT` before `loadAuthorities()`
  (`:1392`) so in-process registry paths resolve into the evidence tree.
- Apply gate: `preflight()` (`:445`) runs `node host/apply.mjs --ufo-root <root>`
  with no `--apply` (flagless = dry run; only `--apply` writes the two files),
  cwd `REPO_ROOT`; transcript to `EVIDENCE/apply-dry-run.log` (`:446-447`); hard
  gate at `:448-449` — non-zero exit fails `preflight.apply`.
- Band modes (`resolveBand`, `:457-521`): both read+parse the live config and
  require `sighting.dispatch.swarm`. `--band live` uses the real
  `config/ufo.json` as authority and refuses `apply_not_landed` when any of
  `["waveMinLanes","waveMaxLanes","maxLanes"]` differs from the delta
  (`minLanes` and `maxConcurrentL1` are not in the drift gate). `--band fixture`
  (default) deep-copies the checkout config in memory, overrides the delta's six
  values (`maxConcurrentL1`, `missionFormat.l1Alias`, `swarm.maxLanes`,
  `swarm.minLanes`, `swarm.waveMinLanes`, `swarm.waveMaxLanes`), and writes the
  result inside the evidence tree.
- Delta (`host/ufo-sighting-dispatch.json`): `maxConcurrentL1 16`,
  `missionFormat.l1Alias "m_strong"`, `swarm {maxLanes 100, minLanes 16,
  waveMinLanes 16, waveMaxLanes 32}`.
- Never writes: into the `ufo-fsd-alpha` checkout; into the live tmux session
  unless `--live-wall` (only a read-only `tmux has-session` probe at `:435`);
  never dispatches a wave (stops at the dispatch boundary); the apply dry run
  writes nothing.

**Changed.** Nothing — read-only research.

**Unknown.** The lane did not execute `run-wave-test.mjs` or `host/apply.mjs`;
"dry run writes nothing" is read from source and the header contract, not
observed at runtime. The stamp format is derived from the two regex
replacements, not printed at runtime.
