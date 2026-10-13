# skill frontmatter: consumed contract vs convention

**Asked:** which skill frontmatter keys exist and who actually consumes them.
**Sources:** 10 `SKILL.md` files across both trees, `omp://skills.md`, `evidence/gates-current.txt`,
`docs/PORT-NOTES.md`.

## Observed

- Field table over 10 `SKILL.md` files: `name` 10/10, `description` 10/10,
  `metadata.axis_family` 6/10 (orchestration x5, agents x1), `metadata.language` 6/10 (all
  `match-repo`), `metadata.substrate` 6/10 (`omp` x5, `all` x1). OMP's own optional keys (`globs`,
  `alwaysApply`, `hide`, `disableModelInvocation`, `enabled`) appear 0 times.
- Real contract: OMP consumes **only `name` + `description`** (`omp://skills.md`,
  `extensibility/skills.ts`); `description` is required for native `.omp` discovery, `/skill:`
  strips frontmatter, and "additional keys are preserved as unknown metadata".
- `metadata.{axis_family,language,substrate}` has **zero live consumers** — the only code sites are
  ghosts in `evidence/gates-current.txt:8298` (`crates/ufo-control-plane/src/model.rs`, crate
  deleted) and `docs/PORT-NOTES.md:116-119` (`crates/ufo-orch/src/handoff.rs`, crate absent). So
  the three `metadata` keys are convention, not a consumed contract.
- `skills/godspeed-core/` has **no** `SKILL.md` — invisible to OMP's one-level `*/SKILL.md`
  discovery; it is a digest-gated content store (`skills/SHA256SUMS:1-5`).
- Byte gates cover whole files, not fields: `skills/SHA256SUMS:6,8,15` pin the godspeed/ufo/wwkd
  `SKILL.md`; `sync-ufo-contracts.mjs:70,89-103,122-127` mirror `skills/ufo/**` + wwkd + directive.
- Consistency drift: `godspeed` exists as three divergent copies — `skills/` (28 lines, has the
  "## Envelope marker" section), `.cursor/skills/` (24 lines, missing it, ungated), and host
  `~/.agents/` (17 lines, directive inlined, different description — and this is the copy
  `skill://godspeed` actually resolves from a worktree cwd). `wwkd` is byte-identical everywhere
  (gated); substrate `.omp/skills/{tower,swarm}` are untracked/ungated variants of the omskills
  canonical (tf-audit-band.md:84 F7).

## Remaining unknown

Whether any runtime outside these two trees reads `axis_family` at execution time (none found).
