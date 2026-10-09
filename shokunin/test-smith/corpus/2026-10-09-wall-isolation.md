# 2026-10-09 — wall isolation in the suites

**Asked.** How do the suites guarantee they never touch the real tmux wall, and
what is the residual risk? (Lane `WallIsolation`, sentinel.)

**Observed.** Sources: `test/tower-fleet.test.mjs:36-60,199-208,1099-1169,1383-1404,1559-1628`;
`test/run-wave-test.mjs:234,252,433-436,1189-1257`; `sighting/tower-fleet.mjs:519-521,646-650`.

- Stub mechanism: wall shell-outs resolve to `bash <spec.ufoRoot>/scripts/ufo-sighting`
  (`sighting/tower-fleet.mjs:519-521`) — an absolute spec-derived path.
  Redirection is by swapping the spec's `ufoRoot` to a `mkdtemp` fixture, not
  PATH manipulation (the launcher inherits env unscrubbed,
  `test/tower-fleet.test.mjs:166-168`). Three stub loggers: `stubWall` records
  `"$*"` and prints `{"status":"present","missions":[]}` (`:199-208`); the
  section-28 stub is the same (`:1109-1114`); the section-36 ISO stub logs
  per-spawn blocks `SCRIPT=$0` / `ARG=<token>` / `END` plus a full status JSON
  with an escaped pane id, needing no exec bit (`:1569-1580`).
- Assertions (section 36, `:1559-1628`): `plan` spawns the wall zero times;
  `launchArgv = [bash, isoCli]`; stdout never names the substrate; `status`
  spawns exactly once via `SCRIPT=isoCli` with argv exactly `status --lite`;
  `close --apply --force` yields 3 blocks ending `complete --mission tf-alpha`
  with retired `phase=completed`/`paneLive=false`; a sweep asserts every block
  has `SCRIPT=isoCli`, the log never contains the real CLI path, never contains
  `tmux`, and `stateDir`/`worktreeRoot` are absent. Count + identity tripwires
  catch bypasses because a real spawn leaves no log block. Section 28
  (`:1099-1169`) proves `MUTATION_REQUIRES_APPLY` refuses with zero wall calls;
  the tree snapshot (`:1383-1404`) pins byte-identical trees.
- `--live-wall` (default false, `run-wave-test.mjs:234,252`): the dry run
  touches the live tmux server only via the preflight
  `tmux has-session -t ufo_sighting` (`:435-436`) — read-only, neither creates
  nor attaches. With `--live-wall`, verbs run as
  `node <ufoRoot>/scripts/ufo-sighting <args>` (`:1230`): `open` is heavy
  (starts server/session, writes `.ufo/sighting/manifest.json`, spawns a GUI
  terminal, needs `attachedClientCount === 1` or `status === attached`);
  `status --lite` is chosen because plain `status` rewrites tmux options and
  can create the dashboard pane; `overview` never `--watch`; `surface --json`
  is a static contract; exit 0 ok / 2 typed error.
- Printed-not-run: `cd <ufoRoot> && bash scripts/ufo-sighting {open | status
  --lite | overview --width 200 | surface --json}` with per-command notes
  (`:1204-1218`), plus the swarm-lanes-are-not-wall-missions note
  (`:1220-1224`); `tower-fleet plan` prints per-mission
  `launch: <quoted launchArgv>` with "plan writes nothing"
  (`tower-fleet.mjs:646-650`).
- Residual risk (moderate, test-integrity): if a code path resolved the wall
  CLI outside `spec.ufoRoot` (a substrate-style default, a PATH-resolved
  `bash`/`ufo-sighting` shim), the real wall would be mutated (tmux panes,
  manifest, GUI terminal) before the count tripwires fail — detection is
  post-hoc, and the `tmux` argv check cannot catch it since tmux runs inside
  the real CLI. No positive substrate-integrity sentinel exists (snapshot roots
  exclude the substrate). Also: `UFO_FSD_ROOT` silently retargets the copied
  fixture config (`:70`); the printed recipe says `bash …` but the live path
  runs `node …` (`:1216` vs `:1230`). Smallest remediation: a before/after
  substrate sentinel (has-session exit status or config mtime hash) asserted
  unchanged around sections 28/36.

**Changed.** Nothing — read-only research.

**Unknown.** Neither suite was executed; `scripts/ufo-sighting.mjs` on the
substrate was not read (verb semantics are the suite's own comments); the
`run()` helper body was seen only through its cwd default (`:306-310`).
