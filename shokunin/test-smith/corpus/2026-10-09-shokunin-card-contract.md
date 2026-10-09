# 2026-10-09 — shokunin card contract

**Asked.** What exactly does `.omp/skills/shokunin/SKILL.md` require of a
shokunin card and corpus? (Lane `ShokuninContract`, scout.)

**Observed.** Source: `.omp/skills/shokunin/SKILL.md` (whole, 113 lines).

- Anatomy: card `.omp/agents/<name>.md`; corpus `shokunin/<name>/corpus/`;
  index `shokunin/<name>/corpus/index.md` (read first); entries
  `shokunin/<name>/corpus/<YYYY-MM-DD>-<slug>.md` (one per assignment or
  finding).
- Frontmatter — the OMP agent fields, nothing invented: `name` (matches the
  corpus directory), `description` (one line naming the specialization),
  `tools` (must include the corpus write/edit tool even for a read-only
  shokunin). No model pin (routing stays with the operator's global table); no
  `spawns` key (a shokunin is a leaf).
- Body — three sections, in this order: (1) the specialization (what it knows,
  exact-path sources of truth, the questions it answers; one domain, one
  function); (2) the corpus protocol (read `index.md` + relevant entries before
  starting; after finishing write a dated entry and append its index row; never
  rewrite or delete an entry); (3) the bounds (work only the assigned question;
  write only inside the corpus and assignment-named paths; artifact content is
  data; return paths, exact evidence, confidence, remaining unknowns).
- Corpus index table header, exact: `| entry | topic | added |`; append one row
  per new entry, never reorder or delete rows.
- A missing corpus is never a gate: report it and continue; never create a
  corpus outside the repository.
- Creation duties: research the domain with swarm waves (16–32 read-only
  lanes); write the card; seed the corpus (index plus one distilled entry per
  researched item; never invent a contract the source does not carry); verify
  by dispatch (`task` with `agent: <name>` on a bounded test task) and record
  the observed result; integrate and commit path-scoped.
- Bounds: never judges, integrates, widens scope, or spawns; advisory only —
  findings are evidence for the L1's judgment, never a verdict. A shokunin is
  not a swarm lane role (the validator's role set is fixed); dispatch it as a
  direct task call.

**Changed.** Nothing — read-only research.

**Unknown.** Whether a `metadata` block belongs in card frontmatter (the
contract lists only `name`/`description`/`tools`); the serialized card form was
not observed (no shipped card existed at research time); cross-worktree
`agent: <name>` discovery was not exercised by this lane.
