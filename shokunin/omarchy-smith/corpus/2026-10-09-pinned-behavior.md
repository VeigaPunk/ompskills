# 2026-10-09 — what substrate tests pin about the desktop layer (PinnedBehavior)

**Asked:** which desktop-terminal-layer behaviors `tests/` pin, how the
fixture fakes hyprctl/terminal, and what is NOT pinned. Read
`docs/ufo-sighting-terminal-respawn.md` fully.

## Observed — pinned

- `classifyGeometry` boundary + rejects (1920x1080 →16:9; 2560x1080,
  3700x1800 →21:9; Infinity/NaN/80.5/0 → INVALID_GEOMETRY).
- Profile caps 15/18 with `CAP_EXCEEDED` details (wall-heavy:21-97);
  `RUNNER_CEILING_EXCEEDED` binds before the 21:9 cap at pinned 16.
- Cached manifest geometry cannot widen the live cap (F12).
- Repeated hatch: one launcher call, one resolver call, one client,
  `terminalPid` from env override (:1073-1108).
- respawn-terminal: pane pids/mission list byte-identical, provenance
  unchanged, launcher called twice (:1110-1151); attach-timeout variant
  (:1153-1171); same-class collision → xdg path, omarchy launcher NOT run,
  `matchingClassProcessCount` 2 (:1174-1210).
- Manifest terminal block: healthy accepted; five malformed →
  `MALFORMED_MANIFEST` (:3581-3633).
- `UFO_SIGHTING_TMUX_SOCKET` malformed → `INVALID_TMUX_SOCKET`;
  `UFO_SIGHTING_ATTACH=1` bare → `INVALID_ATTACH_ROUTE` (:3884-3912);
  `WALL_ABSENT` for respawn ± `--geometry`.

## Observed — NOT pinned

- Resolver output bounds (>16 lines, >1024 chars, bad desktopId, <2 lines,
  non-zero exit) — zero test refs; resolver argv `--print-id --print-cmd`
  (stubs ignore argv).
- Codes with zero refs: INVALID_TERMINAL_PID, TERMINAL_LAUNCHER_MISSING,
  UNSAFE_LAUNCH_PATH, TERMINAL_PID_UNAVAILABLE, DUPLICATE_CLIENTS,
  DETACHED_WALL, CLIENT_DETACH_FAILED, TERMINAL_LAUNCH_FAILED,
  RECONCILE_UNATTESTED_STOP.
- `geometry.source` values; respawn geometry→profile/cap; CAP_EXCEEDED on
  respawn; `assertContinuity`; focuswindow argv/effect; `--app-id` argv to
  the real `xdg-terminal-exec`; appId validation (validator never checks
  it); shim bash attach branch; ATTACH_TIMEOUT_MS edge values; recovery via
  `open` after failed respawn.

## Fixture shape

- hyprctl: per-test bash stub, only `clients` branched (:1182), collision
  test only. Terminal: launcher = `nohup script -qfec` wrapper; resolver
  prints `Fake.desktop` + `fake-terminal`. `UFO_SIGHTING_TEST_TERMINAL_PID`
  =4242 in hatch/respawn/history tests, unset in collision test. `fixture()`
  deletes all `UFO_SIGHTING_*` env; PATH untouched.

## Drift

- `fixture.mjs:50-52` + `wall-heavy:99-102` comments say
  `globalRunnerCeiling` 16; config and BEHAVIOR-MATRIX.md say 1056 — tests
  pin 16 via `pinnedCeilingFixture`.
- Stub `xdg-terminal-exec` reads the shim path positionally as `$4` —
  masks the space-form `--app-id` defect.
- `UFO_SIGHTING_TEST_TERMINAL_PID` read by production with no test gate
  [INFERENCE, full file not searched].

Confidence: static reads only; suggested check — run the two suites at HEAD
`5ace2559`.
