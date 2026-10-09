# watchdog-surface — the watchdog, L0 monitor, and THE TICK surface

Asked: cadence, triggers, reads/writes, and typed exits of the watchdog + ground-handler scripts.
Source: lane WatchdogScripts report. Anchor: ufo-fsd-alpha@5ace2559.

## Observed

- `ufo-l0-watch.mjs:490-491` **execs** `ufo-l0-monitor.mjs` as a child each tick with
  `MONITOR "--fleet <fleets>" --rebind --repair --repend --settle --json` (`MONITOR` `:89`); the
  monitor is also a standalone CLI (report-only by default; heal with those flags, `:21-26`).
- The hook variant `ufo-l0-monitor-hook.test.mjs` points at `.omp/hooks/pre/ufo-l0-monitor.js`, which
  spawns `scripts/ufo-l0-monitor.mjs --fleet <fleets> --repair --repend` (`:28`), throttled by
  `.ufo/l0-monitor-state.json` freshness (interval `120_000`) with an O_EXCL claim
  `.ufo/l0-monitor-claim.json` (`:30,44`).
- `config/the-tick.machine.json` is the single THE TICK declaration (schema `the-tick-machine-v1`,
  2 runners `tick-0`/`tick-1` sockets under `${XDG_RUNTIME_DIR}/ufo/the-tick`, `allowedPathRoots`,
  heartbeat root `.ufo/sighting/heartbeat`), loaded by `the-tick-config.mjs` (`loadTickMachineConfig`,
  `validateTickMachineConfig`). `ufo-ground-handler.mjs` verbs: `--runner <id>` (required) +
  `--config <path>`; serves `health`/`chat`/`freshness_ping`/`path_ping`; one process per runner,
  exclusive bind, exit 1 on EADDRINUSE. `the-tick-ping.mjs` targets the configured runner sockets in
  three modes (`path_ping`/`freshness_ping`/`health`), one JSON envelope per run.
- Invocation: `package.json` `the-tick:handler`/`the-tick:ping` exist, but the operational shape
  (`.cursor/skills/ufo/SKILL.md:581-600`) is host-supervised handler processes + an on-demand
  one-shot ping per completion wakeup.
- Test counts: night watchdog 7 (tests the lib), stale 27, repend 26, l0-watch 51, l0-monitor 38,
  l0-monitor hook 6; the tick trio shares `tests/the-tick.test.js` (88) with no dedicated files.

## Contract

| script | trigger | reads | writes | tests |
| --- | --- | --- | --- | --- |
| `ufo-night-watchdog.sh` | bash daemon 60s (`sleep 60` `:194`) | `sighting/operation.lock/owner.json`, `/proc/net/unix`, `ps`, queue, `l0-monitor-state.json` mtime | `.ufo/night-watchdog.{log,lock}`, `night-watchdog-repends.json`, respawns → `.ufo/dispatcher-daemon.out`, `.ufo/l0-watch.out` | 7 |
| `ufo-night-watchdog-lib.sh` | sourced only | `/proc/net/unix`, owner.json, stdin `ps` | none | 7 (shared) |
| `ufo-stale-watchdog.mjs` | node daemon `POLL_MS 300_000` | session `.jsonl` mtimes, `ufo-sighting status`, manifest | `.ufo/stale-watchdog.{jsonl,state.json,lock}`; mutates queue only via `fleet-dispatcher repend` | 27 |
| `ufo-watchdog-repend.mjs` | on demand (night-watchdog duty 5) | queue, manifest, state file | `.ufo/night-watchdog-repends.json` (atomic); repend via dispatcher | 26 |
| `ufo-l0-watch.mjs` | node daemon default 90s (`--once` for one tick) | `l0-watch-state.json`, queue, receipts, transcript mtimes | `l0-watch-state.json` (atomic), `l0-watch.log`, lock, respawns via `enqueue`, retention via `ufo-state-retention` | 51 |
| `ufo-l0-monitor.mjs` | on demand (hook, watch tick, or hand) | queue, parent receipts, prompts/configs digests, transcript mtimes, journal | queue (under `QUEUE.lock`), receipts (atomic), `l0-monitor-state.json`, `.log`, repend via dispatcher | 38 |
| `.omp/hooks/pre/ufo-l0-monitor.js` | OMP pre-hook on idle | state mtime, claim file | claim file; spawns the monitor; status segment `l0mon` | 6 |
| `ufo-ground-handler.mjs` | supervised socket server per runner | config, request lines, target paths/heartbeats | heartbeat root dir; runner socket (umask 0077, chmod 0600) | 88 (shared) |
| `the-tick-ping.mjs` | on demand one-shot | config, sockets, heartbeat files | none (stdout envelope) | 88 (shared) |

Typed exits: night 2 source-unresolved / 0 flock-held; stale 64 usage / 0 `watchdog_instance_refused`
/ 1 `watchdog_start_error`; repend 64 / 0; l0-watch 2 bad `UFO_L0_WATCH_STATE` / 64 usage /
0 `instance_refused` under `--once` / 1 `watch_start_error`; l0-monitor 2 bad path / 64 usage / 1
typed runtime fault; ground-handler 64 usage / 1 operational; ping `TICK_PING_EXIT_CODES` 0–7 + 64.

Cadence doctrine: night watchdog is the fastest tick (60s) and the only supervisor that respawns
daemons detached (`setsid`) and kills wedged ones (`AGENTS.md:255-256` names hub row
`night-watchdog restart=always`); the monitor's heal runs before the watch's respawn/whip/retain
duties (`ufo-l0-watch.mjs:18-27`), and the night watchdog's staleness probe keys on the monitor's
state mtime (>6 min, `ufo-night-watchdog.sh:184-190`).

## Not carried by the source

- No systemd unit files for any watchdog; the supervised-start claim is prose (hub row) with no
  manifest in-tree. No `ufo-ground-handler.test.mjs`/`the-tick-ping.test.mjs` (shared suite only).
  `ufo-night-watchdog.sh` declares no `--help`/argv surface. No consumer was found for the watch's
  `--once` JSON shape.

## Unknowns

- Whether the hub supervisions are enforced by a manifest outside this repo; runtime behavior of
  every exit arm (daemons and batteries were out of scope, so exits are read from branches);
  the concrete `waveMinLanes` the stale watchdog reads live.