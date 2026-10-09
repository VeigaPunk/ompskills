# wwkd skill: the two copies are byte-identical

**Asked:** compare `skills/wwkd/SKILL.md` with `.omp/skills/wwkd/SKILL.md`.
**Sources:** both files (232 lines, 9978 B each), `scripts/sync-ufo-contracts.mjs`, `ufo-deps.lock`.

## Observed

- `diff` exit 0, zero differing hunks; identical sha256
  `4015a0f46b73e03649aee8e29116a6b3f1aa768ad2ad54e8d975665de69081d4`; distinct inodes (real
  copies, not symlinks/hardlinks).
- `skills/wwkd/SKILL.md` is canonical: `sync-ufo-contracts.mjs:82` sources `skills/wwkd`;
  `:126` mirrors it into the bundled crate; `ufo-deps.lock` pins its sha256. `.omp/skills/wwkd`
  is a generated mirror (13 further copies repo-wide, one hash).
- Frontmatter: `name: wwkd` + a folded `description` (triggers "plan this", "break this down",
  "write the plan", "/wwkd", "what would karpathy do", after brainstorming; "Opposite of fast
  and furious.").
- Ten core principles (L32-L75): data first; skeleton before capability; overfit one case;
  regularize by least disruption; tune after correctness; code ephemeral / knowledge permanent;
  follow established patterns; fits one file (~600 lines); structural verification at every
  step; the anti-pattern is "fast and furious".
- Protocol: Phase 0 data walk (L85), Phase 1 skeleton sequencing (L98), Phase 2 overfit one real
  instance (L114), Phase 3 generalization order (L123), Phase 4 polish & squeeze (L134). Plan
  artifact format (L148): `# Plan` / `**Spec:**` / `## Data Walk` / `## Milestones` with per
  milestone `Does` / `Gate` / `Touches` / `Out-of-scope`; M1 skeleton, M2 overfit, M3..Mn
  generalize one axis, M_final polish. Five refusals (L182).
- Relationship to ufo (L218-220): "ufo runs the wwkd planning stance every round (run-logic §5
  is normative); this skill is its self-contained compression".

## Remaining unknown

None material: the pair is proven identical and the canonical source is named.
