# 2026-10-09 — omarchy-launch-or-focus match semantics (FocusMatchSemantics)

**Asked:** reverse-engineer `~/.local/share/omarchy/bin/omarchy-launch-or-focus`
(19 lines): the match, ordering, focus branch, eval fallback, zero-arg path.

## Observed

- `:6-9` zero args → usage on **stdout**, exit 1 (unreachable via the
  -tui wrapper which always passes two args).
- `:11` `WINDOW_PATTERN=$1`; `:12`
  `LAUNCH_COMMAND="${2:-"uwsm-app -- $WINDOW_PATTERN"}"` — default only when
  `$2` unset or empty; pattern used as a program name.
- `:13` match: `hyprctl clients -j | jq '.[]|select((.class|test("\\b"+$p+"\\b";
  "i")) or (.title|test(...)))|.address' | head -n1` →
  `hyprctl dispatch focuswindow address:$ADDR`; else `:18`
  `eval exec setsid $LAUNCH_COMMAND`. No `set -e`/`pipefail`.
- Match precisely (stub-verified against jq 1.8.2): pattern spliced
  **unescaped** into `\b<p>\b`, flag `i` — dots are wildcards
  (`org.omarchy.ufo-sighting` also matches `orgXomarchy-ufo-sighting`);
  class OR title (title-only hit focuses); first match in `clients -j` array
  order (`head -n1`, no sort, ordering = Hyprland's).
- Silent fallthrough to launch (duplicate-instance risk): hyprctl missing or
  erroring; jq failure; a `null` `.class` **before** the match aborts jq
  (a null after the match is fine); invalid regex → launch with the bad
  pattern as program. jq's exit status is discarded by `head`.
- Shell re-parse: the pattern (default path) and `$2` both reach `eval`;
  `$(…)` in either executes (marker-file verified). The wall path is safe
  only because `ufo-sighting.mjs:2746` restricts `SHIM_PATH` to
  `[A-Za-z0-9_./-]`. The -tui wrapper's unquoted `$@` protects nothing.
- Live side effect disclosed: one probe hit real `hyprctl` and dispatched a
  `focuswindow` to the live wall window (focus change only).

## Unknowns

- Hyprland `clients -j` array ordering with multiple matches.
- Whether Hyprland emits `null` class/title in practice.
- Whether `focuswindow` failure propagates exit status.

Confidence: high for match/branch/eval semantics; medium for edge cases.
