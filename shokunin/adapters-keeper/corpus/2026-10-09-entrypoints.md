# entrypoints — what each host actually consumes

Asked: host-visible entry points for the 7 adapter packages.
Source: lane AdapterEntrypoints (`reports/adapters-keeper/AdapterEntrypoints.md`).

## Observed

- Host-visible entrypoints are `substrates/<seat>/bin/cli.mjs` (`bin ufo-<seat>`),
  **not** anything under packages/. Only substrate-omp has a package.json; no repo
  script copies or links packages/<seat> into a user-level host path.
- Only writers touching host-visible surfaces: `sync-ufo-contracts.mjs` (root .omp/,
  .cursor/, packages/* mirrors) and `project-devin-subagents.mjs` (.devin/agents).
- All 10 SKILL.md copies byte-identical to canonical `skills/ufo/SKILL.md`
  (sha256 4708d14d…, 36375 B).
- Host consumption per seat (per README/docs + seat substrate.json):
  - omp → `.omp/` projection (skills, agents, ssot, config) + hooks (authored, .omp only).
  - cursor → `packages/cursor/.cursor/skills/ufo` is the seated runtime skill
    (substrate.json skills[0]); the flat `packages/cursor/skills/ufo` has no runtime
    consumer (parity mirror).
  - devin → `packages/devin/.devin/skills/ufo` + `.devin/agents/ufo-*.md` — **gitignored,
    absent until contracts:sync**; devin doctor fails before then (inferred from code).
  - codex/grok/kimi/opencode → packaged `skills/ufo` tree is the artifact the host's
    skill loader picks up (per-seat install path documented in
    docs/SUPPORTED-SUBSTRATES.md; e.g. ~/.grok/skills/ufo).
- codex/grok/opencode have no agents/ target; cursor/devin have no scope tag.

## Contract

"Adapter package entrypoint" is a content path the host reads — the executable contract
lives in substrates/<seat>/, shared through substrate-runtime's lane-cli.

## Unknowns

- node_modules absent at anchor — bin shims' @ufo/substrate-runtime resolution
  unverified (all 7 `version` probes fail ERR_MODULE_NOT_FOUND without install).
- opencode runtime reads canonical skills via config/ephemeral-l1.machine.json +
  prepare-ephemeral-l1.mjs:467-535, **not** the packaged tree (OpencodePkg lane).
