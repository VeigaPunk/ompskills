# 2026-10-09 — resolveTerminalOnce and the manifest terminal block (TerminalResolution)

**Asked:** `resolveTerminalOnce` (`ufo-sighting.mjs:2481-2504`) + manifest
terminal validation (`:304-320`).

## Observed

- Skip: `state.terminal?.desktopId && state.terminal?.command` truthy →
  returns the stored block without running the resolver. No code path clears
  `state.terminal` (only `newManifest` sets it null, `:334`) — **resolved
  once, cached forever**; an xdg-terminals.list or env change is ignored
  afterward, including by `respawn-terminal`.
- Resolver: `env.UFO_SIGHTING_TERMINAL_RESOLVER || "xdg-terminal-exec"`
  spawned `[ "--print-id", "--print-cmd" ]`, no shell, 8 MiB buffer, 30 s.
- Parsing: stdout split on `\n`, trimmed, blanks dropped; `lines[0]` =
  desktopId; `lines.slice(1)` = command argv (one element per line).
- Bounds: <2 lines → `TERMINAL_RESOLUTION_FAILED` "no configured command";
  >16 lines or any line >1024 chars → "oversized output"; desktopId must
  match `/^[A-Za-z0-9._-]{1,256}$/u` → else "invalid desktop id". Spawn
  error/non-zero → `TERMINAL_RESOLUTION_FAILED` (4 refusal sites total).
  A missing resolver binary is `TERMINAL_RESOLUTION_FAILED`, not
  `TERMINAL_LAUNCHER_MISSING`. Command elements unchecked at resolve; NUL is
  caught later by `validateManifest` (`MALFORMED_MANIFEST`).
- Persisted block: `{desktopId, command, appId:"org.omarchy.ufo-sighting",
  pid:null, resolvedAt}`; overwritten at attach with `{...terminal, pid,
  observedAt}`.
- Ordering: `openWall` persists before launch (`:2805-2806`);
  `respawnTerminal` persists only after launch+continuity (`:2845,:2875`).
- Tests: resolve-once pinned (`ufo-sighting.test.js:1073-1108`); manifest
  terminal rejection pinned (`:3616-3633`); the `TERMINAL_RESOLUTION_FAILED`
  paths and size bounds are NOT tested.
- Host output: `xdg-terminal-exec --print-id --print-cmd` →
  `Alacritty.desktop\nalacritty\n` exit 0.

## Unknowns

- `desktopId` is validated/persisted but never consumed as a match key —
  the real key is `class === APP_ID`.
- NUL / single-line command / missing-terminal-key behaviors are
  code-path inference, not executed.

Confidence: high for the contract; medium for edge behaviors.
