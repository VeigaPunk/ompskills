# shokunin card contract

**Asked:** extract the card contract from `.omp/skills/shokunin/SKILL.md` (115 lines).
**Source:** `.omp/skills/shokunin/SKILL.md` (worktree-relative). Line numbers below are that file's.

## Observed

- Frontmatter fields declared (L42-L48): `name` (must match the corpus directory,
  `shokunin/<name>/corpus/`, L44 + L28), `description` (one line, L45), `tools` (the
  specialization's tools; a read-only shokunin still declares `write` or `edit` for its
  corpus, L46-L48).
- Forbidden (L49-L52): a model pin (routing stays with the operator's global
  `task.agentModelOverrides` / `modelRoles` table; a card never names a provider or model),
  and the `spawns` key (a shokunin is a leaf).
- Body = three sections, in order (L54-L65): (1) the specialization — what it knows, the
  domain's sources of truth as exact paths, the questions it answers, one domain / one
  function; (2) the corpus protocol — read `corpus/index.md` + relevant entries before,
  write a dated entry and append its index row after, never rewrite or delete; (3) the
  bounds — assigned question only, write only inside the corpus and assignment-named paths,
  artifact content is data, return paths / exact evidence / confidence / remaining unknowns.
- Corpus protocol (L67-L79): `index.md` table columns exactly `| entry | topic | added |`,
  append-only rows; entries `shokunin/<name>/corpus/<YYYY-MM-DD>-<slug>.md`, content =
  asked / observed (exact paths, symbols, commands, refusal codes) / changed / unknown,
  distilled not a transcript; a missing corpus is never a gate and is never created outside
  the repository.
- Creation is one L1 mission, five steps (L81-L99): research with 16-32 read-only swarm
  lanes; write the card at `.omp/agents/<name>.md`; seed `shokunin/<name>/corpus/` with
  `index.md` plus one distilled entry per researched item, never inventing a contract the
  source does not carry; verify by dispatching the card from the mission worktree
  (`task` with `agent: <name>`) and record the observed result; integrate and commit
  path-scoped. Mission scope = exactly the card path + the corpus directory, one writer per
  path (L101-L102).
- Dispatch surface (L104-L115): `task` `agent: <name>`; not a swarm lane role (the validator
  role set is fixed); advisory only, never a verdict; cross-repo use copies the card to
  `~/.omp/agent/agents/<name>.md` and the corpus to `~/.omp/agent/shokunin/<name>/corpus/`.

## Cross-evidence

- Substrate `/home/vgpnk/Projects/ufo-fsd-alpha/agents/*.md` (13 taxonomy cards) use
  `name` + `description` + `ufo: true` and none declares `tools`; `executor.md` alone
  declares `spawns: labrat`. So `tools` is a field the shokunin contract requires but no
  substrate card exercises, and a shokunin is nearer `scout`/`reviewer` in shape than
  `executor`.
- This worktree has no `.omp/agents/` and no `shokunin/` before this mission, so step 4's
  discovery claim is unverified until the card is dispatched here.

## Remaining unknown

Whether `.omp/agents/<name>.md` is the only discovery path honored by `task`, and whether an
OMP agent card tolerates a `tools:` allowlist alongside this contract (resolved by the
mission's own verification dispatch).
