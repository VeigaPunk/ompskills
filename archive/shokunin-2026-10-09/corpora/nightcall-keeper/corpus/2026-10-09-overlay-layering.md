# overlay-layering — precedence and merge, and what stacks on nightcall

Lanes `OverlayLayeringSemantics`, `FleetSpecOverlayPattern` (scouts).

- Precedence (low → high), `omp://settings.md` "Precedence" and
  `omp://config-usage.md` §4: built-in defaults < global
  `~/.omp/agent/config.yml` < project `.omp/config.yml` < CLI overlays
  (`PI_CONFIG_FILES` first, then repeated `--config`, later wins) < runtime
  overrides < env var. Overlays are read-only and never persisted.
- Merge rule (docs + minified loader `#be` in `~/.local/bin/omp`): objects
  deep-merge, while scalars and arrays replace wholesale. Observed: a fleet
  overlay that adds `modelRoles.m_opus` keeps all 19 global roles (19 → 21), and
  `retry.fallbackChains.m_strong` is replaced 9 → 2 entries.
- Tower launcher, HEAD (`sighting/tower-fleet.mjs:470-480` in this worktree):
  one `--config <ufoRoot>/config/mission-nightcall.yml`, `--model
  @<authority.l1Alias>`.
- Main checkout, uncommitted as of 2026-10-09: per-mission `l1Alias` and
  `overlays[]`. Overlays are appended after nightcall (`:486-490`, "overlays must
  follow the nightcall config so they win"). shokunin3 uses
  `.tower/fleets/shokunin3/lanes-haiku.yml`.
- Overlap between nightcall and lanes-haiku: only `retry.modelFallback` (both
  `true`). Nightcall's `task.maxConcurrency: 0` survives the stack.
- Consequence: nightcall's "no project route pins" is true of the file, not of
  the stack. A fleet overlay re-routes `default` and every chain it names.
  `check-routing-free-config.mjs` scans `config/**` and `.omp/*`, never `.tower/`.

## Unknowns
- No live L1 settings dump was taken under `--config`, so the runtime
  application of the overlay was inferred from docs + `PI_CONFIG_FILES` probes.
