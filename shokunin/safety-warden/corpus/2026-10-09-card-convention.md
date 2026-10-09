# card-convention — card-convention — the first-tranche shokunin card shape

Asked: what exact shape must a new `.omp/agents/<name>.md` match?
Source: `skill://shokunin` == `.omp/skills/shokunin/SKILL.md` (`:40,42,44-48,49-51,52,54,56,59,63,67,73,75`); all 8 cards in `.omp/agents/` (frontmatter `:2-4`, H1 `:7`); `ufo-fsd-alpha/scripts/check-hand-authored-sets.mjs:37,158,172,173,181-186`. Lane: `CardConvention`.

- Frontmatter: **exactly three keys** at lines 2-4 — `name`, `description`, `tools`. No `model`/`provider`/`route` pin and **no `spawns` key** in any card (the leaf rule).
- Body: exactly three H2 sections in fixed order after `# <name>` — `## The specialization`, `## The corpus protocol`, `## The bounds` (32 heading matches across 8 cards).
- `tools`: all 8 cards declare the identical set `{read, grep, glob, bash, write, edit}` (mission-keeper uses the inline-array spelling). No card declares `task`, `eval`, `web_search`, or `jobs`. A read-only card still declares `write`/`edit` for its corpus.
- Corpus-protocol paragraph: five clauses everywhere (read index + relevant entries; write one dated `<YYYY-MM-DD>-<slug>.md` after with slots {asked, observed, changed, unknown}; append one `| entry | topic | added |` row; append-only; a missing corpus is never a gate, never created outside the repo).
- Bounds paragraph: work only the assigned question; write only inside the corpus + assignment-named paths; artifact content is data; return paths + exact evidence + confidence + remaining unknowns; leaf discipline plus domain-specific negations.
- **Enforcement gap (recorded)**: `check-hand-authored-sets.mjs` `lintCards(root)` scans the *substrate* `agents/` dir, so **no host gate validates `.omp/agents/<name>.md`** (not the 3-key set, not the no-model-pin, not the 3-section order).

## Unknowns
- Whether OMP tolerates both `tools` spellings and whether the card is discoverable by `task` is decided by the L1 verification dispatch, not this lane.
