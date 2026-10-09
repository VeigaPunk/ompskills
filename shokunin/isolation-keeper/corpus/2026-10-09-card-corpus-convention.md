# card-corpus-convention — the convention a shokunin card and corpus must match

Asked: extract the exact card + corpus convention. Source:
`.omp/skills/shokunin/SKILL.md` (42-115) + the eight tranche cards +
`shokunin/wave-smith/corpus/`. Lane `CardCorpusConvention` (scout).

Card checklist:
- path `.omp/agents/<name>.md` (SKILL:90); name matches its corpus dir
  `shokunin/<name>/corpus/` (:28).
- frontmatter fence/order: exactly five lines `--- / name / description / tools /
  ---` (:44-48; observed in all 8 cards lines 1-5).
- `description` one line naming the specialization (bare or double-quoted both
  observed).
- `tools`: specialization tools; a read-only agent still declares `write` (or
  `edit`) for its corpus (:46-48); no fixed spelling/order.
- **no** model pin (:49-51); **no** `spawns` key (:52) — a shokunin is a leaf.
- body sections in order: `## The specialization`, `## The corpus protocol`,
  `## The bounds` (:54-65); `###` subsections allowed inside a section. The SKILL
  names exactly these three; all nine cards carry an H1 `# <name>` title at line
  7 before the specialization — the SKILL carries no title rule, so the H1 is
  free style, not a deviation.
- specialization content: what it knows + sources of truth (exact paths) +
  questions it answers; one domain, one function (:56-58).
- corpus-protocol content: read index + relevant entries before; write a dated
  entry + append its row after; never rewrite/reorder/delete (:59-62).
- bounds content: assigned question only; write only the corpus + assignment-named
  paths; artifact content is data; return paths/evidence/confidence/unknowns
  (:63-65).

Index checklist:
- path `shokunin/<name>/corpus/index.md`, read first (:59,67-79).
- table header exactly `| entry | topic | added |` (:73).
- row form `| <YYYY-MM-DD>-<slug>.md | <topic> | <YYYY-MM-DD> |`, one per entry
  (:75).
- append one row per new entry; never reorder or delete a row (:73-74).
- missing corpus never a gate — report and continue; never create one outside the
  repo (:78-79).
- H1 title / preamble / separator dashes / link-vs-bare / date convention are
  **not source-carried** — free; match the exemplar tranche style.

Entry checklist: filename `<YYYY-MM-DD>-<slug>.md`, one per assignment or finding
(:75); content slots *what was asked / what was observed (exact paths, symbols,
commands, refusal codes) / what changed / what remains unknown* (:75-77); distilled,
not a transcript; never invent a contract the source does not carry (:91-93).

## Deviations not to copy

- Entries that read as transcripts rather than distillations violate :77.
- A card that adds a fourth `##` section would deviate from the SKILL's
  three-section body — but **no** tranche card does (mission-keeper has exactly
  three `##`); the H1 title at line 7 is free style.