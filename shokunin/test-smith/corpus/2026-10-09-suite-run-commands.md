# 2026-10-09 — how to run the suites

**Asked.** What is the exact command, flags, environment, exit codes, expected
output, and preconditions for each suite? (Lane `SuiteRunCommands`, scout.)

**Observed.** Sources: header doc comments of `test/tower-fleet.test.mjs` and
`test/run-wave-test.mjs`; `test/sighting-wave-smoke.md:162-202`.

- `test/tower-fleet.test.mjs`: `cd $REPO && node test/tower-fleet.test.mjs`.
  No flags (no `process.argv` handling; the header's `--help`/exit-64 mentions
  describe the launcher under test, not the script). Env: `UFO_FSD_ROOT`
  (default `/home/vgpnk/Projects/ufo-fsd-alpha`); only `<root>/config/ufo.json`
  is read, copied into a temp fixture. Exit codes: 0 all passed; 1 a check
  failed or the fixture gate fired. Success output: per-check
  `  ok   <id> — <detail>` lines, final line `ALL CHECKS PASS`. Preconditions:
  node + readable substrate `config/ufo.json`; no tmux/wall/apply/network.
  CI-safe (hermetic temp fixtures; never opens the wall or writes into either
  checkout).
- `test/run-wave-test.mjs`: `node test/run-wave-test.mjs` (defaults), plus
  `--band live`, `--live-wall`, `--lanes N`, `--help`. Flags: `--ufo-root PATH`;
  `--band fixture|live` (default fixture); `--lanes N` (default 16);
  `--report-dir REL`; `--out DIR` (default `test/evidence/wave-<stamp>`);
  `--live-wall`; `--verify` (wording alias); `--help`/`-h`. Env: does NOT read
  `UFO_FSD_ROOT` (hardcoded `DEFAULT_UFO_ROOT` plus `--ufo-root`); sets
  `UFO_PROJECT_ROOT=<scratch evidence root>` and
  `UFO_FLEET_ALLOW_EXTERNAL_TOOLS=1` per CLI call; `--band live` passes
  `UFO_CONFIG_PATH`. Exit codes: 0 all gates passed and nothing dispatched; 1 a
  gate failed (also `apply_not_landed` under `--band live`, and uncaught
  errors); 64 usage (bad arg/band/lanes, or lanes outside the band). Success
  output: banner + `1/8`..`8/8` step rules + ok lines; `8/8 DISPATCH BOUNDARY —
  this script stops here` printing the manual step; verdict
  `ok   <N> checks passed; nothing dispatched.` + `evidence: <dir>`.
  Preconditions: node; runnable `tmux` (`tmux -V` exit 0, else gate → exit 1);
  the substrate checkout with `scripts/ufo-swarm-wave.mjs`,
  `scripts/ufo-sighting`, `config/ufo.json`, `host/apply.mjs`,
  `host/omp-agent.config.yml`, `host/ufo-sighting-dispatch.json`; the hard gate
  `node host/apply.mjs --ufo-root <root>` exiting 0 (logged to
  `apply-dry-run.log`); a read-only `tmux has-session` probe of session
  `ufo_sighting`; `--band live` additionally needs the live swarm band already
  at the merged delta, else `apply_not_landed` exit 1.
- `run-wave-test.mjs` must not run unattended with `--live-wall`: it opens and
  attaches the operator wall (GUI terminal, starts the `ufo_sighting` tmux
  session, writes `.ufo/sighting/manifest.json` in the substrate). Even its dry
  form is non-hermetic (tmux + the full apply dry run), and the 8/8 boundary
  hands off one batched OMP `task` call (~`<lanes>` completions) that is
  human-only.

**Changed.** Nothing — read-only research.

**Unknown.** Neither suite was executed (read-only lane); exit-code and output
claims are read from the scripts' own plumbing. `sighting/tower-fleet.mjs` and
`host/apply.mjs` internals were not inspected beyond what these scripts assert.
