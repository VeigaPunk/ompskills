# 2026-10-09 — shokunin card and corpus convention matched

**Asked.** The convention this card copies.
**Sources.** `.omp/skills/shokunin/SKILL.md`, `.omp/agents/{worktree-keeper,evidence-auditor,wave-smith}.md`, their corpus indexes.
**Observed.**
- Frontmatter exactly `name`, `description` (one line), `tools: read, grep, glob, bash, write, edit`; no model, no `spawns`.
- Body: H1, specialization opener ("Narrow specialist in **…**. One domain, one function …"), optional framing insight, leaf line, then `## The specialization` (`### Sources of truth (exact paths)`, corpus anchors, `### What the contract carries`, `### Questions you answer`) → `## The corpus protocol` → `## The bounds` (optional `### One rule the skill state omits`).
- Index: `# <name> corpus — index`, append-only line, domain anchor paragraph, `| entry | topic | added |`, no footer. Entries: date-prefixed H1, bold labels `**Asked.** **Sources.** **Observed.** **Changed.** **Unknown.** **Lane.**`.
**Changed.** Nothing — read-only research (seed entry).
**Unknown.** None.

**Lane.** CardCorpusConvention (scout). Report: `.tower/fleets/shokunin3/reports/comms-keeper/CardCorpusConvention.md`.
