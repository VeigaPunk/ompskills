# 2026-10-09 — run-wave-test.mjs anatomy

**Asked.** What is the anatomy of `test/run-wave-test.mjs` — its 8 steps, hard
stop, flags, exit codes, run command, and observed state? (Lane `RwtAnatomy`,
scout.)

**Observed.** Source: `test/run-wave-test.mjs` (1422 lines; header doc `:1-72`;
`main()` `:1378`; `finish()` `:1337`); run executed by the lane.

- Steps: 1 preflight (`preflight()` `:407-455` + `loadAuthorities()` `:123-143`)
  — node, tmux, six required files, a read-only `tmux has-session` probe, and
  the hard apply gate `node host/apply.mjs --ufo-root <root>` exit 0; then the
  seat→`@alias` table from `host/omp-agent.config.yml` (14 seats) and the real
  planner module. 2 band (`resolveBand()` `:457-523`) — live config is
  authority only if `waveMinLanes`+`waveMaxLanes`+`maxLanes` all equal the
  delta, else `die(1) apply_not_landed`; fixture mode synthesizes
  `<EVIDENCE>/ufo-root/config/ufo.json` merging the delta's six values. 3 spec
  (`:526-566`, `buildSpec()` `:364-397`) — pairwise-distinct prompts, explicit
  roles from real `SWARM_ROLES`, ≥2 route families, reportDir shape. 4 plan
  (`:572-597`) — schema `ufo-swarm-wave-v1`, counts, policy band == authority,
  `policy.source == "config"`, hardCeiling 100. 5 run (`:599-628`) — schema
  `ufo-swarm-wave-dispatch-v1`, one taskCall with exactly N lanes, task keys
  exactly `[agent,name,task]` (no model param), godspeed leading + exactly one
  invocation, distinct texts/names, report instruction, registry
  `ufo-swarm-registry-v1` with `kind spawn`/`agentId null`. 6 negatives
  (`negatives()` `:708-996`; `routeFamilies()` `:998-1095`; `bandCrossCheck()`
  `:1097-1183`) — 6a size matrix with codes derived by `bandVerdict()`
  `:631-636`; 6b per-spec cap; 6d resume exemption at both ends; 6e the 8-code
  refusal vocabulary; 6f route concentration recomputed from the candidate seat
  table; 6g in-process planner judging the delta via injected policy. 7 wall
  (`wall()` `:1185-1263`) — dry prints the four verbs and the L2-opaque caveat,
  executes nothing; `--live-wall` runs `open`/`status --lite`/`overview --width
  200`/`surface --json`. 8 boundary (`dispatchBoundary()` `:1265-1335`) — prints
  payload/registry/report paths plus the six manual steps and writes
  `dispatch-boundary.txt`.
- Hard stop: no flag dispatches. `parseArgs` `:227-266` is a closed whitelist
  (anything else → `die(64)`); no OMP client exists; all `spawnSync` targets are
  `tmux`/`which`/`node host/apply.mjs`/`node <WAVE_CLI> plan|run|record`/`node
  <SIGHTING_CLI>` (live-wall only); the substrate `ufo-swarm-wave.mjs` contains
  no spawn/exec (grep) and its `run` arm only persists the registry and emits
  the payload (`planToDispatchPayload` `:1307-1344`); the manifest stamps
  `dispatched:false`.
- Flags: `--ufo-root PATH` (default the substrate path); `--band fixture|live`
  (default fixture; invalid → 64; live refuses `apply_not_landed` if any of the
  3 swarm numbers drifts); `--lanes N` (default 16; positive safe integer else
  64; outside the delta band → 64); `--report-dir REL` (default
  `test/evidence/<basename(EVIDENCE)>/lane-reports`; relative, no empty/`.`/`..`
  segment); `--out DIR` (default `test/evidence/wave-<stamp>`); `--live-wall`
  (off; without it no `ufo-sighting` verb runs); `--verify` (no-op alias, the
  apply gate is unconditional `:253-255`); `--help`/`-h` (prints USAGE, exit 0).
- Exit codes: 0 all checks passed and stopped at the dispatch boundary (also
  `--help`); 1 a gate failed (also `apply_not_landed`, uncaught errors); 64
  usage.
- Observed run (default fixture band, `--out /tmp/…`): **94 checks, 0 failures,
  exit 0**; counts per section: preflight 10, authority 4, band 3, spec 4,
  plan 5, run 13, negative 46, crosscheck 8, wall 1 (band-dependent — the 6a
  matrix is deduped/sorted from the resolved band). Representative values:
  `authority.seats: 14 seats … (sha256 15b401854c344687…)`;
  `band.live: waveMinLanes 16, waveMaxLanes 32, maxLanes 100, minLanes 16`;
  `plan.counts {"spawn":16,"resume":0,"total":16}`; `run.noModelParam … task
  keys ["agent","name","task"]`; `negative.routeFamiliesMixed … families 2,
  largest 16, pinned 32, aliases ["m_mid:16","m_fast:16"]`;
  `negative.routeUnprobed … status "unprobed", 0 pings`; `wall.dryRun:
  --live-wall not passed: no ufo-sighting verb was executed (session
  ufo_sighting is live and was left untouched)`. `--help` prints the 12-line
  USAGE block and exits 0. Evidence: 60 files under `--out`, including
  `manifest.json` observed with `schema ufo-sighting-wave-smoke-manifest-v1`,
  `passed true`, `exitCode 0`, `dispatched false`, `checks.length 94`,
  `wall {executed:false, commands:[…]}`.
- Shell-out vs pure: shells out to the real substrate scripts in steps 4-5,
  6a-6e plus the two `--route-families` CLI cells of 6f, and step 7 only under
  `--live-wall`; runs real substrate code in-process (no subprocess) in step 1
  (`loadAuthorities`), 6f (`planSwarmWave`, `waveRoutePreflight`), 6g
  (`planSwarmWave` with injected policy); pure in step 2 (band synthesis), 3
  (spec build), 7's dry variant, 8 (boundary render).
- Grounded discrepancies: the band has already landed here, so the
  `apply_not_landed` refusal is not currently reachable (it fires only against a
  checkout still carrying the pre-apply band); the smoke doc's evidence table
  names stale spec files (`spec-15.json`, `spec-ceiling-32.json`, …) while the
  script actually writes `spec-band-<n>.json`, `spec-cap-<max>x<lanes>.json`,
  `spec-route-mixed-32.json`, `spec-resume-only*.json`, `refusals/<id>.json`.

**Changed.** Nothing — read-only research.

**Unknown.** The lane never ran `--band live`, `--live-wall`, `--lanes N≠16`,
`--report-dir`, or any refusal path at the process level (only `--help` and
`--out /tmp/…` were executed); the `apply_not_landed` refusal and the `gate()`
hard-stop paths were read, not triggered; no timing measured; the
`--live-wall` shape of `runMeta.wall` was not observed.
