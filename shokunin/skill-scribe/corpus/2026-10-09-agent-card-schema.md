# agent-card frontmatter: the enforced key set vs the shokunin prose

**Asked:** the agent-card frontmatter contract and what of it is actually enforced.
**Sources:** `/home/vgpnk/Projects/ufo-fsd-alpha/scripts/check-hand-authored-sets.mjs`,
`host/omp-agent.config.yml`, `host/apply.mjs`, `agents/*.md` (13 cards).

## Observed

- The only validator of card frontmatter is `scripts/check-hand-authored-sets.mjs`:
  `CARD_KEYS = new Set(["name","description","ufo","spawns","tools"])` (:37). Any other key ->
  `card_unknown_key` (:158); a planted `model: …` is refused as "cards declare no seat model"
  (test :119). Required: `name` == file basename (:160), non-empty `description` (:161),
  `ufo: true` (:162). Body must carry negated-judgment language (`NEVER_JUDGE` regex :39 or
  "canonical Rust alone judges" :40, enforced :175-177). `lintCards` scans `<root>/agents/*.md`
  only (:183).
- `tools` is optional; when declared it may never name `jobs` (:172) and a leaf card (no `spawns`)
  must never list `task` (:173). No card in the 13-card roster declares `tools:`.
- `spawns: []` -> "spawns: [] is not the leaf spelling; omit the key" (:165); `SPAWN_GRANTS =
  {executor: "labrat"}` (:38, :166-167) — only `executor.md:5` carries `spawns: labrat`.
- Routing is not on the card: `host/omp-agent.config.yml:222-236` `task.agentModelOverrides` names
  exactly the 14 ufo seats (`main` MUST stay `@m_strong`, :219-221); `apply.mjs` runs the resolver/
  mirror/compile gates (`MIRROR_SEATS` 14, `WAVE_ROLES` 10, :79-88). 13 cards vs 14 seats: `main`
  is a seat with no card.
- Gap between `shokunin/SKILL.md:40-65` and the gate: the shokunin key list (name/description/tools)
  omits the gate-required `ufo: true` and never-judge body rule; the gate never scans
  `.omp/agents/`, so **no host gate lints a shokunin card** — its contract is self-discipline.
  Nothing enforces the shokunin card's "no model pin", "no spawns", card<->corpus-name agreement,
  the `tools` requirement, or the three-section body order.

## Decision recorded for this mission

`skill-scribe`'s card keeps the shokunin contract's frontmatter (`name`, `description`, `tools`)
and adds **no** `ufo: true` marker: `ufo: true` marks a UFO taxonomy seat (the gate's scan scope is
`<root>/agents/*.md`), and a shokunin is explicitly not a swarm lane role. The divergence between
the shokunin contract and the substrate gate is recorded here rather than silently reconciled.

## Remaining unknown

Whether OMP itself validates any card key, and how OMP resolves routing for a non-seat agent name.
