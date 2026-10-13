# corpus protocol: no committed precedent exists

**Asked:** reverse-engineer any pre-existing shokunin corpus convention before inventing one.
**Sources:** `git -C /home/vgpnk/Projects/ompskills log --all`, `ls-tree` over branches, sibling
worktrees under `.tower/worktrees/shokunin/`, `.omp/skills/shokunin/SKILL.md`.

## Observed

- **No committed shokunin precedent**: zero committed `shokunin/` directories, `.omp/agents/`
  cards, or `corpus/index.md` files anywhere in the repo's branches, worktree set, fleet dirs, or
  the substrate. The only pre-existing protocol is `.omp/skills/shokunin/SKILL.md` itself
  (b251c5a, 115 lines).
- Corroboration that `.omp/agents/` is a real card location: `sync-ufo-contracts.mjs:170-171` maps
  `project-omp` -> `.omp/agents`; operator anchors are `~/.omp/agent/config.yml:3` (`modelRoles`)
  and `:26` (`agentModelOverrides`).
- Live siblings are mid-flight in their own worktrees and uncommitted at 2026-10-09T05:25Z:
  `test-smith` has a card and 20 corpus entries (entry layout `# YYYY-MM-DD — slug` plus
  **Asked./Observed./Changed./Unknown.**) but no `index.md` yet; `host-smith` has a card and its
  corpus dir. `.tower/fleets/shokunin/spec.json` scopes all 8 missions to exactly
  `[card path, corpus dir]`.
- Must NOT be invented (no source carries it): index columns beyond `| entry | topic | added |`,
  sort order, summary rows, entry title/bold-field styling rules, slug vocabulary, same-day
  collision rules, the `added` date convention (local vs UTC), card `metadata:`/`ufo:`/`model:`/
  `spawns:` keys, corpus subdirs/README/templates/gitignore rules.

## Remaining unknown

Whether `task` discovery resolves `agent: <name>` from a mission worktree's `.omp/agents/`
(this mission's own verification step, not prior art).
