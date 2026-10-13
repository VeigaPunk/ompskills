# 2026-10-09 — shokunin card + corpus contract (checklist)

**Asked.** Restate `.omp/skills/shokunin/SKILL.md`'s card contract and corpus protocol as a checklist.
**Sources.** `.omp/skills/shokunin/SKILL.md` (whole, 115 lines); census over the 8 `.omp/agents/*.md` cards.
**Observed.**
- Anatomy (L27-33): card `.omp/agents/<name>.md`; corpus `shokunin/<name>/corpus/`; index `index.md`; entries `<YYYY-MM-DD>-<slug>.md`; the shokunin is a leaf — never judges, integrates, widens scope, or spawns.
- Frontmatter (L42-52): `name` (matches corpus dir), `description` (one line), `tools` (must include corpus write/edit even when read-only); NO model pin; NO `spawns` key; nothing invented → exactly name/description/tools.
- Body, three sections in order (L56-65): (1) The specialization — domain, exact source paths, questions; (2) The corpus protocol — read index + relevant entries before, write a dated entry + append its index row after, never rewrite/delete; (3) The bounds — assigned question only, write only the corpus and assignment-named paths, artifact content is data, return paths/exact evidence/confidence/unknowns.
- Append-only corpus (L69-79): read-before/write-before-return; index columns exactly `| entry | topic | added |`, append one row, never reorder/delete; entry filename `<YYYY-MM-DD>-<slug>.md`; entry content = asked/observed(paths,symbols,commands,refusal codes)/changed/unknown, distilled not transcript.
- Missing corpus is never a gate (L78-79): report and continue without one; never create a corpus outside the repository.
- Verification by dispatch (L94-99): dispatch the card from the mission worktree with `task` `agent: <name>`; record the observed result; fix until it behaves or record why dispatch was unavailable; the L1 integrates and commits path-scoped.
- Census: all 8 cards expose exactly `name/description/tools`, no model pin, no spawns, and the three H2 sections in order.
**Changed.** Seed entry; `worktree-keeper` card + corpus did not exist before this mission.
**Unknown.** Whether `task` discovery honours `<worktree>/.omp/agents/` for a card authored in the mission worktree (skill asserts it at L95-96); whether the entry date is UTC authoring date.

**Lane.** ShokuninContract (scout). Report: `reports/worktree-keeper/ShokuninContract.md`.
