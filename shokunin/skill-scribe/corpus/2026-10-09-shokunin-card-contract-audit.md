# 2026-10-09 — shokunin SKILL.md audited against its own card contract and the 16 cards

**Asked.** Audit `.omp/skills/shokunin/SKILL.md` against its own card contract and
against the 16 cards in `.omp/agents/`: list every divergence — card violates the
contract, or contract text does not match reality — with paths.

**Observed.** Full read of `.omp/skills/shokunin/SKILL.md`; full read of all 16
cards (`worktree-keeper`, `isolation-keeper`, `ledger-keeper`, `harness-scout`,
`safety-warden`, `evidence-auditor`, `godspeed-keeper`, `substrate-keeper`,
`host-smith`, `test-smith`, `wall-watcher`, `route-auditor`, `skill-scribe`,
`mission-keeper`, `fleet-warden`, `wave-smith`); heading census via
`grep '^## (The specialization|The corpus protocol|The bounds)'`; frontmatter
census via `grep '^tools:|^name:|^description:|^spawns:|model:'`; corpus check
`ls -d shokunin/*/corpus` (16 dirs, 16 `index.md`, all with the exact header
`| entry | topic | added |`); substrate role-card frontmatter
(`/home/vgpnk/Projects/ufo-fsd-alpha/agents/scout.md:1-5`, 13 cards); `git status`
during the audit (siblings appending corpus entries concurrently).

## What matches (the negative space, 16/16 unless noted)

- Frontmatter: every card has `name` (equal to its corpus dir), a one-line
  `description`, `tools:` including both `write` and `edit`, **no** `model` pin,
  **no** `spawns` key. (One caveat: an early `read` of `.omp/agents/host-smith.md`
  rendered the frontmatter *without* its `tools:` line; a re-read `:raw`, a grep,
  and clean `git status` all show `tools:` present at `:4` — first read dropped a
  line that is on disk; reported to `xd://report_issue`.)
- Body: every card has exactly the three contract sections as H2s, in the
  contract order (The specialization → The corpus protocol → The bounds).
- Specialization: every card names exact-path sources of truth and a
  questions-it-answers enumeration.
- Corpus protocol: every card carries read-index-and-relevant-entries-first,
  dated-entry-after, append-row, never-rewrite/reorder/delete, and
  "A missing corpus is never a gate".
- Bounds: every card carries the four contract elements (assigned question
  only; write only inside corpus + named paths; artifact content is data;
  findings with paths/evidence/confidence/remaining unknowns).
- Anatomy ↔ reality: 16 cards ↔ 16 `shokunin/<name>/corpus/` dirs ↔ 16
  `index.md` with the exact contract columns; all entry files match
  `<YYYY-MM-DD>-<slug>.md`; `git log` shows the cards landed as
  `tower/shokunin2/*` fleet merges, matching "created by one L1 mission".
- External references check out against sibling cards: `~/.omp/agent/agents`
  user root (harness-scout), the fixed ten-role wave set (wave-smith), the
  live band 16–32 / 100 / 16 / `m_strong` (mission-keeper), and
  `task.agentModelOverrides`/`modelRoles` as the routing authority (host-smith,
  route-auditor).

## Divergences found

**Cards → contract (card text diverges from the SKILL.md contract):**

1. **Corpus-protocol clause dropped (4 cards).** The contract's corpus protocol
   ends "…and it never creates a corpus outside the repository."
   `.omp/agents/host-smith.md:99-105`, `.omp/agents/ledger-keeper.md:216-222`,
   `.omp/agents/route-auditor.md:67-74`, and `.omp/agents/wave-smith.md:114-120`
   keep "A missing corpus is never a gate — report it and continue without one."
   but omit the never-create-outside clause. The other 12 cards carry both
   clauses. Minor.
2. **Leaf/advisory discipline absent (3 cards) or partial (3).** SKILL.md states
   as definitional "a shokunin never judges, integrates, widens scope, or spawns"
   (intro) and "A shokunin is advisory: its findings are evidence for the L1's
   judgment, never a verdict" (Using). No trace of either statement:
   `.omp/agents/host-smith.md`, `.omp/agents/ledger-keeper.md`,
   `.omp/agents/wave-smith.md`. Partial: `.omp/agents/fleet-warden.md` has only
   "Never dispatch subagents" (`:156`); `.omp/agents/isolation-keeper.md:390-392`
   and `.omp/agents/mission-keeper.md:208-210` carry the advisory half but not
   the never-integrates/spawns half. Note: the three-section contract's bounds
   bullet does not itself list the leaf sentence, so this is divergence from the
   contract document's definitional prose, not from the letter of the
   three-section requirement; all 16 satisfy the letter (each bounds scope via
   "work only the assigned question").
3. **Entry path written relative (nit).** `.omp/agents/mission-keeper.md:194`
   says "write a dated entry `corpus/<YYYY-MM-DD>-<slug>.md`" while the contract
   anatomy and the card's own read-first path use the qualified
   `shokunin/mission-keeper/corpus/…`.
4. **Duplicated word (nit).** `.omp/agents/substrate-keeper.md:122-123` protocol
   text: "what what was observed".

**Contract → reality (SKILL.md text that does not match the on-disk reality):**

5. **"the same card format" overstated.** SKILL.md: "It is shaped like a taxonomy
   role — the same card format…". The taxonomy role cards it can only mean —
   `/home/vgpnk/Projects/ufo-fsd-alpha/agents/*.md` (13 cards, per this corpus's
   `role-card-conventions` entry and `.omp/agents/skill-scribe.md`) — carry
   frontmatter `name`/`description`/`ufo: true` and a short free-form body
   (`agents/scout.md:1-9`); shokunin cards carry `name`/`description`/`tools` and
   the three-section anatomy. "Same card format" holds only for
   name+description+markdown body.
6. **Frozen band numbers.** "Creating a shokunin" step 1 says "waves of 16–32
   read-only lanes". 16–32 matches the live band today
   (`config/ufo.json` `sighting.dispatch.swarm`, corroborated by
   `.omp/agents/mission-keeper.md` "Current live truth (2026-10-09)"), but the
   band is live config the prose freezes; the floor/ceiling gate spawn-bearing
   waves only (wave-smith), and "read-only" is a mission convention, not a
   validator rule. Low.

**Tooling note (not a contract divergence):** first `read` of
`.omp/agents/host-smith.md` returned frontmatter missing the `tools:` line that a
`:raw` re-read, grep, and clean `git status` confirm on disk; filed at
`xd://report_issue`.

**Changed.** Nothing in the audited files; this entry + one index row appended.

**Unknown.** (a) Whether the OMP harness's bundled taxonomy agent cards (not the
substrate `agents/` cards) share the shokunin frontmatter — the compiled bundle
would need a string probe to settle "same card format" against *those* cards.
(b) The 12 fully-compliant cards' future drift, and whether siblings editing
cards concurrently during this audit change any cited line (citations are as
read at audit time; `git status` showed only corpus files modified, no
`.omp/agents` or `.omp/skills` changes). (c) Whether the contract intends the
leaf sentence as a required fourth bounds element — the three-section letter
does not include it, so items in divergence 2 are flagged interpretation-dependent.
