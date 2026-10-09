# r2-verify-card-shape — r2-verify-card-shape — card conforms; H3 subsections are precedented

Asked: does `.omp/agents/safety-warden.md` conform to the shokunin card contract and the first-tranche convention?
Source: `skill://shokunin`; the 8 cards in `.omp/agents/`; card `:1-239`. Lane: `VerifyCardShape`.

- PASS on every gate: exactly three frontmatter keys (`:2-4`); no model pin; no `spawns`; `# safety-warden — write safety` H1 (`:7`); exactly three H2 in order (`:16`, `:214`, `:226`); the corpus-protocol five clauses (`:216-224`); the bounds paragraph (`:228-239`); `tools` set identical to all 8 first-tranche cards.
- **Correction to the round-1 `card-convention` entry**: its "32 heading matches across 8 cards" reconciles only as 8 H1 + 24 H2 under a `^#{1,2}` scan; read as "32 H2" it would be wrong (24). Also, the premise "first-tranche cards use only H2" is false — 3 of 8 cards use H3s (22 total), so this card's 6 H3s under `## The specialization` are consistent, not a deviation.

## Unknowns
- OMP's own card parser and `task` discovery were not exercised (the L1 verification dispatch resolves it).
