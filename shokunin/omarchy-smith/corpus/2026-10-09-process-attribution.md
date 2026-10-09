# 2026-10-09 — "process counting" is two /proc consumers (ProcessCounting)

**Asked:** process counting in `ufo-sighting.mjs` — what is actually counted.

## Observed

- Two separate /proc consumers share only `parentPid`/`procStatField`:
  1. **Terminal-PID attribution** — `terminalPidFromAncestor` (`:2677-2689`):
     walks UP from the one attached tmux client pid, at most 16 pids,
     returns the first pid whose `/proc/<pid>/exe` basename equals
     `basename(terminal.command[0])` (`alacritty` here). Empty expected name
     → null (guard `:2682`; the comment overclaims — `command[0]==="/"`
     validates but basenames to `""`). Feeds `focusTerminalPid`, the
     hyprland-client geometry match, and `state.terminal.pid` (`:2821,:2869`).
  2. **Runner census** — `listNumericPids`, `childrenByParent`,
     `descendantPids` (`:2537-2574`) feed `observedBoundProcesses`
     (`:2589-2619`) → `processDescendants` telemetry that
     `runnerAccounting` explicitly never counts (`:2663-2671`;
     `docs/BEHAVIOR-MATRIX.md:232`).
- Status (`:3044-3102`): `terminalPid` = `clients.length===1 ? overridePid ||
  walk : null` — recomputed live; `processCount` = `terminalPid ? 1 : 0`
  (`:3086`) — a **presence flag under a count name**, test-pinned at
  `ufo-sighting.test.js:1202`; `matchingClassProcessCount` = hyprctl
  class-filtered window count (0 under `--lite`); `attachedClientCount` =
  tmux clients; `@ufo_terminal_pid` option (`:1793`) uses the persisted
  `state.terminal.pid`, which can diverge from the live walk.
- `executableName` reads `/proc/<pid>/exe` basename, `""` on failure;
  `listNumericPids` failure reads as zero descendants.
- Non-numeric `UFO_SIGHTING_TEST_TERMINAL_PID` silently falls back via
  `Number()` in status and launchOrFocusAttach.

## Unknowns

- Whether the ancestor walk can miss the terminal for uwsm-reparented
  processes (daemonized ancestry — the live wall window's walk works:
  pid 8519 is the alacritty).
- `attachedTerminalPid` is not a symbol — the output field is `terminalPid`.

Confidence: high on code contract; medium on daemonized ancestry; no
runtime execution.
