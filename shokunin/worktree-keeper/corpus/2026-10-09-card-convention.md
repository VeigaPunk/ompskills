# 2026-10-09 — shokunin card template (convention match)

**Asked.** Extract the exact card template from the 8 first-tranche `.omp/agents/*.md` cards.
**Sources.** `.omp/agents/{fleet-warden,wave-smith,host-smith,mission-keeper,route-auditor,skill-scribe,test-smith,wall-watcher}.md`; `.omp/skills/shokunin/SKILL.md:40-65`.
**Observed.**
- Frontmatter: exactly 3 keys in order — `name`, `description`, `tools` (8/8, no fourth key). No model pin, no `spawns` key (grep for `model|spawn|spawns|task|agent|version:` → 0 matches). `tools` is a bare comma scalar in 7/8 (mission-keeper uses a flow list); the tool set is identical across all 8: `read, grep, glob, bash, write, edit` (no `task`/`lsp`/`ask`; corpus tools present even for read-only specialties).
- Body: H1 `# <name>` (6/8 bare; route-auditor/skill-scribe add an em-dash tagline), optional intro paragraph (5/8), then **`## The specialization` → `## The corpus protocol` → `## The bounds`** in that order (8/8, no other H2). Optional `###` subheads under The specialization (`### Sources of truth (exact paths)`, `### Questions you answer`) in 3/8.
- Path/anchor style: repo-relative backticked paths; substrate absolute `/home/vgpnk/Projects/ufo-fsd-alpha` labelled read-only; inline `path:line` anchors; exact backticked argv with observed exit code; `[INFERENCE]` marking required for non-observed claims.
- NOT template elements: a "revision anchor" line (only wave-smith.md:55-57) and a trailing `### One rule the skill state omits` (only wave-smith.md:137, after `## The bounds`).
**Changed.** Seed entry; the worktree-keeper card is authored to this template.
**Unknown.** "Narrow specialist in …" vs "<domain> specialist …" description opener (5/3 split, no rule); no host gate lints `.omp/agents/` — the template is convention, not enforced.

**Lane.** CardConvention (scout). Report: `reports/worktree-keeper/CardConvention.md`.
