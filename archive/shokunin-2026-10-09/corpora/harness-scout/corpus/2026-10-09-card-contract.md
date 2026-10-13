# 2026-10-09 — the shokunin card contract and the first-tranche convention

Lane `CardContract` (connector) · milestone r1-research · axes card-contract, legibility.
Question: what a shokunin card must contain, and how the 8 first-tranche cards vary.

## Observed

Sources: `.omp/skills/shokunin/SKILL.md`; all 8 `.omp/agents/` cards; all 8 corpus indexes;
`omp://task-agent-discovery.md`; the substrate's `scripts/check-hand-authored-sets.mjs`.

- **Frontmatter** (contract `SKILL.md:42-52`): exactly `name`, `description`, `tools`; no
  model pin (routing stays with the operator's global `task.agentModelOverrides`/`modelRoles`);
  no `spawns` key (a shokunin is a leaf). Observed 8/8.
- **Why those prohibitions are load-bearing** (harness evidence): OMP's model precedence is
  `task.agentModelOverrides[agent]` → frontmatter `model` → parent, so an omitted `model` is
  what lets the global table win; and the legacy rule "if `spawns` is missing but `tools`
  includes `task`, `spawns` becomes `*`" means the leaf rule holds **only if `task` is also
  absent from `tools`**. Every card's tool set is `{read, grep, glob, bash, write, edit}` —
  no `task`. `main`/`sub` are reserved names; none used. `tools` accepts CSV or array (both
  spellings appear; `mission-keeper` uses the array form).
- **Body**: three `##` sections in contract order — `## The specialization` (domain +
  exact-path sources of truth + questions), `## The corpus protocol`, `## The bounds` — with
  no fourth `##` section. Observed 8/8, in this order.
- **No host gate lints a shokunin card.** The substrate's `check-hand-authored-sets.mjs` does
  have `lintCard`/`CARD_KEYS = {name, description, ufo, spawns, tools}` and a `NEVER_JUDGE`
  regex (`:39`), but `lintCards` scans the substrate's own `agents/*.md`, never `.omp/agents/`,
  and demands `ufo: true`, which the shokunin contract deliberately omits (a shokunin is not a
  taxonomy seat). **The card contract is self-discipline**; the one grammar the two surfaces
  share is the explicit never-judge clause.

### Per-card variation (measured)

Byte range **4561 (test-smith) → 11641 (mission-keeper)**, median ≈7509; 81–209 lines.
5/8 add an H1-level lead paragraph; host-smith/skill-scribe/wave-smith go straight into the
specialization. Subsections inside the specialization: mission-keeper 13 `###`, host-smith 5,
wave-smith 4, the other five 0.

### Deviations, named

1. **host-smith and wave-smith** — no leaf bound at all (no judge/spawn clause).
2. **fleet-warden** — spawn bound yes, judge bound no.
3. **mission-keeper** — advisory bound phrased as "never a verdict" (fails the greppable
   grammar) and no spawn bound; also the only card with no labeled "Sources of truth" block
   (it uses an artifact table) and it abbreviates the entry path to `corpus/…`.
4. **wave-smith** — `### One rule the skill state omits` parks specialization/drift material
   at the tail of `## The bounds` (1764 chars vs ~600 median).
5. **route-auditor** — the only card whose repo sources are **absolute paths into the main
   checkout** (`/home/vgpnk/Projects/ompskills/…`), so dispatched from a mission worktree it
   sends the agent outside that worktree.
6. Only **3/8** cards name the index columns `| entry | topic | added |`; **3/8** omit "never
   create a corpus outside the repository"; only **wave-smith** carries a revision anchor
   (commit + two sha256 prefixes + "re-hash") and dates its live config values.
7. Style splits (not violations): second vs third person; quoted vs bare `description`;
   wave-smith's bare scalar contains `": "` (relies on OMP's lenient plain-scalar repair).

### Checklist a new card must satisfy

Frontmatter: exactly `name`/`description`/`tools`; `name` == filename == corpus dir and not
`main`/`sub`; one-line `description` naming the specialization; `tools` includes `write` and
`edit`; **`tools` must not list `task`**; zero provider/model selectors anywhere in the card
(alias buckets such as `@m_strong` are the only routing vocabulary allowed).

Body: three `##` sections in order; specialization opens with a domain-scoping sentence that
names what it is *not* and states one domain/one function; a labeled "Sources of truth" block
with exact paths, repo-relative for repo files and an explicit root otherwise; a questions
block; the corpus protocol names the index path and the entry pattern in full, states all five
clauses (read-first, dated entry, one appended row, never rewrite/reorder/delete, missing
corpus is never a gate) and the index columns verbatim; bounds state the assigned-question
limit, the write-path limit, artifact-is-data, and the leaf verbs (judge/integrate/widen/
spawn) in one greppable negated clause; the return contract names paths, exact evidence,
confidence, and remaining unknowns; any `path:line` pin carries a revision anchor and any live
config value is dated/anchored.

Corpus seed: `index.md` with the contract header, one distilled entry per researched item,
index rows == entry files.

## Proposed move (recorded, not executed)

Add a fourth clause to `SKILL.md` §"The card contract" → `## The bounds`, requiring the leaf
bound in one greppable negated clause (the grammar `check-hand-authored-sets.mjs` `NEVER_JUDGE`
recognizes) and naming the index columns, then backfill it into the four failing cards and move
wave-smith's trailing subsection under its specialization. This lane edited nothing — the card
paths belong to the creating missions (one writer per path). Route the backfills as r2 errata
to the owning missions.

## Not verified

Whether OMP's parser repairs wave-smith's unquoted `": "` description, and whether OMP ignores
the substrate `ufo:` key, are `[INFERENCE]` (no YAML parser and no source available).
Discovery/dispatch of a shokunin by name was not exercised by this lane.