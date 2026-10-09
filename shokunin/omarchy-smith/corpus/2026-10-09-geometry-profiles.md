# 2026-10-09 — --geometry, profiles, and what it does NOT do (GeometryFlags)

**Asked:** `classifyGeometry`, `selectedGeometry`, the `--geometry` parser,
`layouts` config, and the flag's verbs.

## Observed

- `--geometry WIDTHxHEIGHT` is accepted by `open`, `launch`,
  `respawn-terminal`, `resume`, `register`, `twin`; `inquiry` rejects it.
  Usage text omits it for launch/register/twin/resume (drift).
- `parseGeometry` (`ufo-sighting.mjs:1191`): `WIDTHxHEIGHT` →
  `INVALID_GEOMETRY` on bad shape or non-positive dims.
- `classifyGeometry` (`:1202-1206`): `w/h >= ASPECT_BOUNDARY` (`37/18`,
  `base.mjs:43`, inclusive) → profile `21:9` else `16:9`. Pinned boundaries:
  1920x1080 → 16:9; 2560x1080 and 3700x1800 → 21:9.
- `selectedGeometry` (`:2021`) source precedence: override →
  `hyprland-client` pixel size (open/respawn only, from
  `hyprctl clients -j` `size`) → tmux-client cells (`width*cellWidth`, needs
  exactly one client) → cached `state.geometry.profile` → `default`.
- Caps: `layouts` (`config/ufo.json:60-69`) 16:9 → 3×5 = **15**; 21:9 → 3×6 =
  **18** — per-profile pane caps for the DEFAULT window. The fleet window
  cap is `windowPaneCeiling` 16 (maxColumns 6, `base.mjs:295-298`). The
  terminal-side check (`:2786`) is strict `>` live default-window missions.
- **What `--geometry` does NOT do:** no resize/move/float/windowrule calls;
  nothing passed to the launcher chain; `physicalWidth/Height` only
  persisted. It selects the profile → tmux `select-layout` grid + cap.
- Ordering hazard: `open`/`respawn-terminal` parse `--geometry` AFTER
  launching/detaching the terminal (`:2807/2814`, `:2848/2861`); `launch`
  parses before manifest mutation but after `ensureOwnedSession`.
- Drift: empty `--geometry=` silently falls through to auto-detect
  (`if(override)` at `:2022`); docs say "physical geometry" but the value
  only picks a profile.

## Unknowns

- `geometry.source` string values are not test-asserted.

Confidence: high for parser/classifier/caps/precedence; medium for
validation-after-mutation ordering (code-read).
