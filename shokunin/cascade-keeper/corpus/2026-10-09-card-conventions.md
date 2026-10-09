# Card conventions and corpus boundaries

Asked (lanes CardDraftReview, HostSmithCorpusRead, RouteAuditorCorpusRead):
the shokunin card contract and the boundary vs neighboring specialists.

## Card contract (from .omp/skills/shokunin/SKILL.md + 16 existing cards)

- Frontmatter: `name`, `description`, `tools` only — no model pin, no `spawns`
  (leaf). All 16 existing cards conform; dominant form is scalar tools list.
- Body: exactly three sections in order — Specialization (with exact-path
  sources) → Corpus protocol → Bounds.
- Pitfall for this domain: quota numbers date within hours, so the card and
  entries teach COMMANDS and STATE CLASSES (●/○/✗, absent-provider,
  exhausted-bucket, invisible-quota) and date every numeric claim. Provider
  names are domain vocabulary inside the card — the no-pin rule governs
  dispatch prompts and frontmatter, not the chain-keeper's own prose.
- "Do not claim" precedent: `wall-watcher.md:75-89` style block for asserting
  what is verified vs inferred.

## Boundary (established by corpus reads)

- route-auditor owns WHO resolves to WHAT and purity (seat -> @alias -> route
  precedence, no-pin, mirror drift, route preflight). cascade-keeper cites
  resolution only to determine which chain a seat or active model follows.
- host-smith owns the candidate file's GATES and apply mechanics (8-gate dry
  run, two-file apply, deferred artifacts). Its corpus establishes chain
  STRUCTURE rules (bare-distinct, dead-weight, dialect) but contains zero
  liveness/quota evidence — that gap is exactly cascade-keeper's domain.
- Adjacent entries read: host-smith `config-fallback-chains`,
  `config-model-roles`, `substrate-resolver`, `resolver-gate`,
  `compile-gate-rule`, `substrate-compile-gate`, `config-agent-overrides`,
  `live-config-drift`; route-auditor `alias-table-taxonomy`,
  `resolution-precedence`, `seat-table-and-chain-audit`, `live-global-config`,
  `route-preflight`, `main-seat-bucket-binding`, `dialect-strictness`.

## Evidence

- Reports `CardDraftReview.md`, `HostSmithCorpusRead.md`,
  `RouteAuditorCorpusRead.md`; skill `shokunin/SKILL.md:42-103`.

## Unknowns

- None material; card conventions are fully pinned by the skill file.
