# 2026-10-09 — terminal-layer refusal surface (RefusalSurface)

**Asked:** the typed-refusal table for the DESKTOP TERMINAL layer only;
which failures are silent instead.

## Observed

- Emit contract: `fail()` (`base.mjs:247-249`) → `SightingError` →
  `emitFatal` (`base.mjs:116-137`) writes `{ok:false,code,message,details?}`
  to stderr, exit 2; `main().catch(emitFatal)` (`ufo-sighting.mjs:4704-4705`).
  `details` is an optional 4th field — terminal-layer codes carry none.
- Table (code | sites | trigger):

| Code | Sites | Trigger |
| ---- | ----- | ------- |
| TERMINAL_RESOLUTION_FAILED | :2485,:2487,:2491,:2494 (4, not 3) | resolver spawn error/non-zero; <2 lines; oversized; bad desktopId |
| TERMINAL_LAUNCHER_MISSING | :2752 | neither configured launcher nor xdg-terminal-exec on PATH |
| TERMINAL_LAUNCH_FAILED | :2727 | spawn error (EACCES non-executable counts) |
| UNSAFE_LAUNCH_PATH | :2747 | SHIM_PATH outside `^[A-Za-z0-9_./-]+$` — omarchy branch only |
| DUPLICATE_CLIENTS | :2027,:2740,:2768,:2843 (4) | >1 tmux client attached |
| ATTACH_TIMEOUT | :2771 | poll elapsed ≥ timeout; hardcodes `ufo_sighting:1` not `TMUX_TARGET` |
| INVALID_TERMINAL_PID | :2510 | `UFO_SIGHTING_TEST_TERMINAL_PID` non-integer — the ONE validated reader |
| TERMINAL_PID_UNAVAILABLE | :2775 | no terminal pid for attached geometry — precedes any geometry check |
| INVALID_GEOMETRY | :1193,:1197,:1204 (terminal layer); :1249,:1254 are buildGridLayout | bad shape/dims/non-integer |
| CAP_EXCEEDED | :2787 | live missions > profile cap — **post-mutation** on respawn, carries no `details` (unlike launch sibling :2180 with `{profile,fleet,cap}`) |
| INVALID_ARGUMENT | :4513,:3834,:3846,:3849,:3856 | stray positional/unknown flag on respawn-terminal |

- Silent-by-design failures: hyprctl error → `hyprlandTerminalObservations`
  `[]` (reads as "no windows"); `focusTerminalPid` false → discarded
  (`:2737`); `status` reports the >1-clients condition as `status:"invalid"`
  exit 0 — not a refusal; `hatchAttachment` reports `closed` on read
  failure.
- Adversarial notes: guard predicate is exact class equality while the
  omarchy matcher is class-OR-title regex — a `org.omarchy.ufo-sighting-dev`
  window or title match is focused by the launcher but not counted by the
  guard; a typo'd `UFO_SIGHTING_LAUNCHER` silently falls back to
  xdg-terminal-exec instead of failing typed.

## Unknowns

- Reachability of each code under a real (non-fixture) wall run.

Confidence: high — every site line-cited; counts corrected against source.
