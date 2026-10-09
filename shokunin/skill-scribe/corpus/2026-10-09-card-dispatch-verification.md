# card dispatch verification: live band, carrying keys, and the validator's source file

**Asked:** the live swarm wave band and the `config/ufo.json` key carrying each edge; which
corpus entry records that fact; the single source file the validator reads at runtime; and the
observed-vs-committed band difference. Bounded verification of the `skill-scribe` card dispatch.
**Sources:** `.omp/agents/skill-scribe.md` (the card under test), `shokunin/skill-scribe/corpus/index.md`
and the prior entries (band-authority, mission-format-config, docs-audit-priors), plus read-only
`/home/vgpnk/Projects/ufo-fsd-alpha/{config/ufo.json,scripts/ufo-swarm-wave.mjs,scripts/ufo-mission-result.mjs}`.

## Observed

- Card resolution: this dispatch loaded the `skill-scribe` card from `.omp/agents/skill-scribe.md`
  (3769 bytes, frontmatter `name: skill-scribe`); the worktree `shokunin/skill-scribe/corpus/`
  holds 24 prior entries + `index.md` (25 files).
- Live swarm wave band: **floor 16, ceiling 32** (`16-32`).
  - Floor edge: `sighting.dispatch.swarm.waveMinLanes` = **16** (`config/ufo.json:93`).
  - Ceiling edge: `sighting.dispatch.swarm.waveMaxLanes` = **32** (`config/ufo.json:94`).
  - (Sibling key `sighting.dispatch.swarm.minLanes` = 16 at `config/ufo.json:89` is the planner
    floor only when `waveMinLanes` is absent; it is NOT the wave edge.)
- Corpus entry recording the fact: `shokunin/skill-scribe/corpus/2026-10-09-swarm-band-authority.md`
  (live band 16-32; floor chain `waveMinLanes` ?? `minLanes` ?? `MIN_SWARM_LANES`(2); ceiling
  `waveMaxLanes` ?? `maxLanes` clamped to `maxLanes`/`MAX_SWARM_LANES`). The live value table is
  mirrored in `2026-10-09-mission-format-config.md` (`waveMinLanes`/`waveMaxLanes` = 16 / 32).
- Single source file the validator reads at runtime: `/home/vgpnk/Projects/ufo-fsd-alpha/config/ufo.json`
  (the **working-tree** file). Chain: `scripts/ufo-swarm-wave.mjs:136` `defaultConfigPath()` ->
  `gatedConfigPath(ROOT, process.env.UFO_CONFIG_PATH, join(ROOT,"config","ufo.json"), "UFO_CONFIG_PATH")`
  (`ufo-mission-result.mjs:2143`) -> `loadSwarmPolicy(configPath)` (`ufo-swarm-wave.mjs:381-383`
  delegating to `ufo-mission-result.mjs:2431`), which reads it with `readBoundedJson` (`:2438`) and
  derives `waveMinLanes`/`waveMaxLanes` at `:2503-2517`. It is a plain file read — never a git
  object — so the uncommitted working-tree edits are live.
- Observed vs committed band difference: working tree 16/16/32 (`waveMinLanes` 16, `minLanes` 16,
  `waveMaxLanes` 32) vs committed HEAD `5ace2559` (`git show HEAD:config/ufo.json:89,93,94`)
  **64/32/100**. `git status --short config/ufo.json` = ` M config/ufo.json` (uncommitted-modified).
  This confirms `2026-10-09-docs-audit-priors.md` exactly: "working tree 16/16/32 vs HEAD `5ace2559`
  commits 64/32/100"; the validator reads the working tree, so live observed band is 16-32. HEAD
  subject `5ace2559` says "wave band 32-100" but the file is the authority.

## Changed

- Added this entry; appended exactly one row to `corpus/index.md` (no rows reordered or deleted).

## Remaining unknown

- Runtime invocation of the `skill-scribe` card by the live dispatcher (vs this bounded dispatch
  resolving it from `.omp/agents/`) was not observed; resolution was confirmed by file presence +
  frontmatter, not by a dispatcher trace.
- Whether the substrate checkout is the exact `<ufoRoot>` the OMP skills resolve against at
  runtime (inferred yes — the only ufo root present).