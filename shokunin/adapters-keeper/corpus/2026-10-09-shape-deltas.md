# shape-deltas — why adapter packages differ

Asked: the intent behind per-substrate shape differences.
Source: lane SeatDifference (`reports/adapters-keeper/SeatDifference.md`).

## Observed (premise corrections first)

- kimi **does** carry ufo-skill-scope.json (71 B) + agents/ — the naive grouping
  "kimi has README+agents, no scope" is wrong (kimi has no README).
- substrate-omp carries both agents/ and a scope file.

## Classification

- **Contract-driven**: scope-tag presence = charterlist membership exactly
  (cliFamilyScopes :178-199 ↔ docs/ufo-fsd-charterlist.json slots
  {omp, opencode, codex, grok, kimi-code}; stray tags refused :1755).
- **Host-convention-driven**: kimi agents/ via `extra_agent_dirs`
  (SUPPORTED-SUBSTRATES.md:109,149); omp agents/ via ~/.omp/agent/agents (:120,154);
  grok agents land at ~/.grok/agents by docs (:151) though the package has none;
  opencode agents projected from canonical at ephemeral-launch time
  (config/ephemeral-l1.machine.json:10; prepare-ephemeral-l1.mjs:489-508); devin's real
  seat is projected `.devin/agents/ufo-*.md` (devin/README.md:16-17,30-31).
- **Refuted hypothesis**: "cursor needs agents/ because .cursor has an agents dir" —
  `packages/cursor/.cursor` has no agents/, and cursor/README.md:31-33 says agents/ is
  not runtime input.

## Genuinely unexplained (record, don't guess)

- Why cursor and devin get parity-only agents/ mirrors while codex/grok/opencode don't —
  `agentTargets` is a hand-maintained literal not derived from charterlist or
  skillTargets; no gate enforces agents-set membership; no doc or code rule found.
- No in-tree reader of ufo-skill-scope.json — the tag's consumer is external.

## Contract

Shape deltas decompose into: charterlist (scope tags), sync literals (agents mirrors),
native seat dirs (.cursor/.devin), and host install conventions — with one admitted
policy gap on agents-set membership.
