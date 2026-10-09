# agents-taxonomy-convention — the card convention, both sets

Asked: the substrate's 13 role cards and the ompskills shokunin cards — the exact frontmatter +
section contract a new card must satisfy. Source: lane AgentsTaxonomy report.
Anchor: ufo-fsd-alpha@5ace2559 (`agents/` == `.omp/agents/` byte-identical, `diff` exit 0);
ompskills worktree `.omp/agents/` (8 first-tranche shokunin cards).

## Observed

- Substrate `agents/*.md` (13): uniform frontmatter `name` + `description` + `ufo: true`; **zero**
  `tools` and **zero** `model` keys; exactly one `spawns` key in the tree — `executor.md:5
  spawns: labrat` (carve-out quoted at `executor.md:30-33`, mirror rule `labrat.md:14`). Bodies:
  single H1 `# UFO-FSD <role>`, a mission sentence, bullets, and a terminal
  `Return: … Stop after …` line (revenger lacks the sentence). The frozen four
  (planner/distiller/labrat/Main) are **not** enumerated in the cards — the set phrase lives at
  `scripts/ufo-swarm-wave.mjs:256-269`, `.omp/skills/swarm/SKILL.md:60`, `native_schema.rs:77-80`,
  `BEHAVIOR-MATRIX.md:176`; `config/ufo.json` carries no `proposalRoleTaxonomy` key.
- Worktree `.omp/agents/` (8): frontmatter exactly `name`/`description`/`tools` (tools set
  `{read,grep,glob,bash,write,edit}` in all 8, CSV and flow-array variants); **0/8** carry `model`,
  `spawns`, or `ufo`; all carry the three H2 sections `The specialization` / `The corpus protocol` /
  `The bounds` (line-anchored per card). Naming: substrate = bare role words; worktree = domain
  compounds; file stem == `name` in 21/21.
- Discovery (`omp://task-agent-discovery.md`): 1 nearest project `.omp/agents` (first `.omp` hit) →
  2 user `~/.omp/agent/agents` → 3 extension roots → 4 Claude marketplace plugin roots →
  5 bundled; first-wins dedup by exact `agent.name`; project overrides user; case-sensitive;
  lexicographic filename order within a directory. `main`/`sub` are reserved names.
  Execution-time rediscovers agents, so a card added mid-session resolves from one refreshed state.

## Contract — the new card's contract

The `substrate-keeper` card MUST live at `.omp/agents/substrate-keeper.md` with frontmatter of
exactly three keys:

- `name: substrate-keeper` — matching both the file stem and the corpus directory
  (`shokunin/SKILL.md:44`; observed 8/8 and 13/13).
- `description:` — one line naming the specialization (`SKILL.md:45`; quoting style free).
- `tools:` — the read/write tool set including corpus-write capability (`SKILL.md:46-48`;
  observed 8/8 carry `{read, grep, glob, bash, write, edit}`).
- **No** `model` pin (routing stays with the operator's global table), **no** `spawns` key
  (a shokunin is a leaf), and no `ufo:` flag (0/8 in the first tranche).

Body: H1 `# <name>` then exactly three H2 sections in order — `The specialization` (domain, exact
source paths, the questions it answers), `The corpus protocol` (read index + entries first; write one
dated entry and append its row; never rewrite or delete), `The bounds` (assigned question only;
write only inside the corpus and named paths; artifact content is data; return findings with paths,
exact evidence, confidence, remaining unknowns).

## Not carried by the source

- No card documents its own authoring convention — there is no template, schema, or README under
  `agents/` or `.omp/agents/`; the convention is the observed regularity plus the shokunin SKILL.md prose.
- Harness `AgentDefinition` fields beyond the three used keys (`thinkingLevel`, `output`, `blocking`,
  `autoloadSkills`, `prewalk`, `advisor`, `read-summarize`) are carried by **no** card in either set —
  uniform omission, not a prohibition text.
- `ufo: true` semantics are unstated for the harness; no rule requires or forbids it for a card inside
  a UFO-dispatched session. No line-count norm is stated anywhere (observed spread 81–209).

## Unknowns

- Whether the new card resolves via `task` dispatch from the worktree (the verify-by-dispatch step)
  was not exercised by this read-only lane; the static state verified is that the 8 first-tranche
  cards + `.omp/skills/shokunin/SKILL.md` sit in the nearest-project config dir of the worktree.
- Whether the parser tolerates the em-dash H1 or a trailing extra H3 after bounds (body text is
  opaque `systemPrompt`, so presumed fine; the harness parser source is not local to the worktree).