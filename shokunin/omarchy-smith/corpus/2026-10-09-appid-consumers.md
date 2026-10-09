# 2026-10-09 — APP_ID consumers and the class invariant (WallAppId)

**Asked:** every consumer of `APP_ID = "org.omarchy.ufo-sighting"`
(`ufo-sighting-lib/base.mjs:39`) and the matching invariant.

## Observed

- `ufo-sighting.mjs:2499` — `resolveTerminalOnce` writes `appId` into the
  manifest terminal record (write-only; `validateManifest :279-316` never
  reads it back).
- `:2517` — `hyprlandTerminalObservations` filter:
  `String(client.class||'').toLowerCase() === APP_ID` — **exact equality**
  (APP_ID already lowercase).
- `:2753` — fallback spawn `xdg-terminal-exec --app-id APP_ID -e SHIM`
  (space form; see `2026-10-09-fallback-appid-defect.md`).
- `:3085` — status payload `terminal.appId` is the constant, not
  `state.terminal.appId`.
- Invariant: a wall terminal window is recognized iff its lowercased
  Hyprland `class` === `APP_ID`. On the omarchy path, `omarchy-launch-tui:6`
  emits `--app-id=org.omarchy.$(basename $1)` where `$1` is the shim path and
  basename is `ufo-sighting` — that is what satisfies the equality.
- The two matchers disagree: the wall filters exact lowercase class
  equality; `omarchy-launch-or-focus` matches case-insensitive `\b` regex
  over class **or title** — a title-only hit on a non-wall window is a
  false-focus surface.
- `classCollision` (`:2743-2745`) routes to the fallback whenever a
  same-class window exists — and the fallback is where the appId argv defect
  lives.

## Unknowns

- Whether other xdg-terminal-exec builds accept the space form.
- Whether the fallback has ever run on this host.

Confidence: high for consumers/derivation/defect; medium for reachability.
