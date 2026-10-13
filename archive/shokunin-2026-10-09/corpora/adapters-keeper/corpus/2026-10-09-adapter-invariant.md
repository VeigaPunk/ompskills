# adapter-invariant — the shared contract and its deltas

Asked: the shared contract all 7 adapter packages conform to.
Source: lane ContractCompare + SkillScope + MirrorShape (`reports/adapters-keeper/`).

## Observed

- **Invariant (all 7)**: byte-identical mirrors of canonical `skills/ufo/` (6 files),
  `skills/wwkd/` (SKILL.md + SHA256SUMS), and `ssot/godspeed-core/directive.md`.
  sha256-walked against canonical; zero drift on any of the 7.
- **Deltas**: `agents/` 13-card mirror only in {substrate-omp, kimi, cursor, devin}
  (`agentTargets` sync-ufo-contracts.mjs:169-175 — a hand-maintained literal);
  `ufo-skill-scope.json` only in {substrate-omp, kimi, codex, grok, opencode} — the five
  charterlist slots (`cliFamilyScopes` :178-199 ↔ `docs/ufo-fsd-charterlist.json`
  assigned_slots); `cursor` alone has `.cursor/` native target; `devin` alone has
  `.devin/` (gitignored — absent on fresh clone).
- **Enforcement**: writer = `scripts/sync-ufo-contracts.mjs` (skillTargets :89-103,
  copy loop :1900-1921, scope tag writer :1997-2020, unexpectedScopeTags refusal :1755);
  structural set gate = `check-hand-authored-sets.mjs:118-124` (directory names only —
  never reads adapter contents); wired via `package.json:26 contracts:check`;
  documented AGENTS.md:53-60, docs/REPO-LAYOUT.md:46, docs/SUPPORTED-SUBSTRATES.md:35.
- **Parallel authorities, no single source**: skillTargets / agentTargets /
  cliFamilyScopes / supportedSubstrates are four hand-maintained JS literals in the sync
  script; config/ufo.json `targets`/`substrates[]` and `substrates/*/substrate.json` are
  a parallel declaration kept consistent by the set gate, not derived.

## Contract

The adapter contract = "carry the canonical posture bytes". Everything an adapter gets
is a projection of root `skills/`, `agents/`, `ssot/` — never adapter-authored content.

## Unknowns

- Why cursor/devin get parity-only `agents/` mirrors while codex/grok/opencode do not —
  no doc or code rule found (SeatDifference lane, genuinely unexplained).
- `substrates/*/substrate.json` `skills[]` paths are declared but not checked by any gate;
  consumers unread.
