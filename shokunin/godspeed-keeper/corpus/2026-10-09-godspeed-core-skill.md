# skills/godspeed-core/ — always-on doctrine and the godspeed-core family

**Asked:** what the `godspeed-core` skill directory is, and how it differs from `godspeed`.
**Source:** `/home/vgpnk/Projects/ufo-fsd-alpha/skills/godspeed-core/` — `README.md` (7346 B,
`908daa4d…`), `always-on.md` (1586 B, `1cb040cb…`), `directive.md` (`db88963c…`), `filter.md`
(`09957d08…`), `velocity.md` (`349243f6…`); no `SHA256SUMS` in the dir.

## Observed

- Purpose: the authored Godspeed posture family — velocity (cheap stubs / parallel / catalog bootstrap)
  + filter (symmetric Pareto constraint) = directed motion without a pre-specified direction. Four rules
  as the directive. Binding: `directive.md` = every seat; `filter.md`+`velocity.md` = judge-only
  (`skills/ufo/SKILL.md:65-70`; README "Architect tier vs worker tier").
- **No YAML frontmatter** on any of the five files (`grep -c '^---$'` = 0).
- `always-on.md` = host always-on install doctrine: Godspeed is inherited on every prompt (no keyword
  wait); read canonical `directive.md` verbatim before acting; every delegated prompt MUST prepend the
  exact directive bytes, strip any existing terminal marker, append exactly one `GODSPEED_MARKER`;
  "Do not load filter.md or velocity.md (judge-only)". **Fleet-scope correction:** a leading
  `GODSPEED_INVOCATION` is the loader (the trailing marker loads nothing); the swarm renderer and
  `.omp/hooks/pre/ufo-godspeed-inject.js` inject it; eval-kernel `agent()`/`workpool()` callers must
  self-prepend; a resume `hub send` gets no invocation. It **restricts**, never expands, a lane's loads.
- Distribution: `always-on.md` exists only here (not vendored, not in ssot), pinned only by
  `skills/SHA256SUMS:2`; documented at its `CHANGELOG.md:1816-1834`.
- Its `filter.md`/`velocity.md` are the **bare vendored** lineage, not the annotated ssot lineage.

## Unknown

None within scope.