# shokunin-card-contract — The shokunin card contract and corpus protocol

Item: `.omp/skills/shokunin/SKILL.md` in full.

Observed card contract: frontmatter `name` (matches the corpus dir), `description` (one line), `tools` (corpus write/edit included even for read-only specialists), NO model pin, NO `spawns` key. Body = three ordered sections: specialization (exact source paths), corpus protocol, bounds.
Corpus anatomy: card `.omp/agents/<name>.md`; corpus `shokunin/<name>/corpus/`; `index.md` table `| entry | topic | added |` (never reordered/deleted); entries `<YYYY-MM-DD>-<slug>.md` (distilled, append-only; never rewrite/delete); a missing corpus is never a gate and is never created outside the repo.
Creation shape: one L1 mission, five steps — swarm waves of 16-32 read-only lanes; write the card; seed the corpus (index + one entry per item); verify by dispatch (`task` with `agent: <name>` from the mission worktree); integrate and commit path-scoped. A shokunin is advisory, never a verdict, and is NOT a swarm lane role.
Real cards (substrate `.omp/agents/*.md`): frontmatter `name` + one-line quoted `description` + `ufo: true`; none declare `tools`; only `executor.md` carries `spawns: labrat`.
State observed by this lane: no `shokunin/` corpus existed anywhere; first such mission.

Evidence: `ShokuninCardContract.md`.
Unknowns: live `task` discovery of worktree `.omp/agents/` cards (leaf lane, spawning disabled) — the step-4 duty stays with the L1.
