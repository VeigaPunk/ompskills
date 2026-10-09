# 2026-10-09 — sighting block desktop keys (SightingConfigBlock)

**Asked:** the desktop-relevant keys of `config/ufo.json` `sighting`
(`:50-97`), validation (`sync-ufo-contracts.mjs` `assertSightingContract`),
loading (`base.mjs` `readProjectConfig`).

## Observed

| Key | Live | Consumed | Desktop effect |
| --- | ---- | -------- | -------------- |
| `terminalLauncher` | `"omarchy-launch-or-focus-tui"` | `launchOrFocusAttach :2742-2757` | spawn argv[0] only; must supply `org.omarchy.ufo-sighting` class; name not on PATH silently falls to xdg-terminal-exec |
| `autoOpenWall` | `true` | `resolveAutoOpenWall :2360-2370`; gates `:2419,:2799` | false + no session → `WALL_NOT_OPEN`; non-boolean silently coerces true (`sync-ufo-contracts.mjs:1141-1142` validates) |
| `triggers` | 3 phrases | `resolveTrigger :4427` (trim/lowercase/whitespace collapse) | CLI argv → open; no omarchy/hyprland binding consumes them |
| `layouts` | 16:9 3×5 / 21:9 3×6 | `classifyGeometry :1206`, `profileContract :1778`, `assertCapacity :2140,:2177` | per-profile cap + grid for the default window; not digest-bound |
| `windowPaneCeiling` | 16 | `fleetLayoutContract base.mjs:295-299`; fleet cap `:2140`; `fleet-dispatcher.mjs:3737-3744,4396-4397,8047` | fleet-window cap + grid maxColumns `ceil(cap/3)`; changing it changes `surfaceDigest` → sync fails until re-charted; `fleet-dispatcher:3739` hardcodes a duplicate default of 16 |
| `twinMaxDepth` | 1 | `base.mjs:190-191` boot fault if ≠1; `sync-ufo-contracts:1219-1221` | not a knob — other value blocks every verb |
| `heartbeatIntervalMs` | 30000 | `run-omp-native-trial.mjs:2253-2263`; tick staleAfterMs cross-check | none on desktop; mission heartbeat only |
| `surfaceDigest` | `sha256:666cd0a1…919ab` | `surface.mjs:246` comparison | drift at HEAD: computed `sha256:8884924f…0553b` ≠ declared — `sync --check` exits 1 (pre-existing, substrate-side) |
| `terminalLauncher` validation | — | `sync-ufo-contracts.mjs:1120-1124` non-empty string | — |

- `terminalLauncher` string non-empty check is the only desktop-key type
  validation in sync; `autoOpenWall` non-boolean rejected there too.

## Side effect (disclosed)

- The lane's `surface` shim probe made Node write compile cache under
  `ufo-fsd-alpha/.ufo/cache/node-compile/` (gitignored; no source affected).

## Unknowns

- Whether `layouts.rows` reaches `buildGridLayout` as maxRows (`:1861-1865`
  partially read).
- Full `sync --check` output beyond the surface entry.

Confidence: high — per-key type/value/consumer table is line-cited.
