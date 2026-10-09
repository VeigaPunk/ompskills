# 2026-10-09 — the `omp://` harness doc set

Lane `DocSetMap` (scout) · milestone r1-research · axes source-fidelity, legibility.
Question: what the `omp://` doc set contains, which docs belong to the harness-scout
domain, and how lookups work.

## Observed

Bare `read omp://` returns a flat alphabetical Markdown list titled `# Documentation`,
header `134 files available`: 82 root `.md` + `skills/**` (6) + `toolconv/**` (12) +
`tools/**` (34). The index exposes **no category field** — grouping is structural
(directory) plus each doc's H1.

Lookup convention (observed):
- Address as `omp://<relative-path>.md`; root and subdirectory paths both work
  (`omp://skills.md`, `omp://tools/task.md`, `omp://skills/authoring-hooks.md`).
- **Bare path = the whole document** (no declaration mode, unlike source reads).
- **No directory listing**: `read omp://tools/` → `Documentation file not found: tools`
  plus a `Did you mean:` suggestion line. Use the top-level `omp://` index.
- Missing file → `Documentation file not found: <name>` + nearest-match suggestions.
- Selectors (grammar from `omp://tools/read.md`): `:raw`, `:img` (local SVG only),
  `:N`/`:N-`/`:N..`, `:A-B`/`:A..B`, `:A+C`, `:-N`, comma lists `:R1,R2`, and
  `:range:raw`/`:raw:range`. 1-indexed (`:0` throws); a single bounded non-raw range adds
  1 leading + 3 trailing context lines; raw and multi-range reads are exact.

Domain membership — **45 of 134** docs in domain, 89 out:

| sub-domain | docs |
| --- | --- |
| agent/task discovery (5) | `task-agent-discovery.md`, `tools/task.md`, `agent-hub.md`, `prewalk.md`, `advisor-watchdog.md` |
| skills (3) | `skills.md`, `tools/manage_skill.md`, `slash-command-internals.md` |
| hooks (3) | `hooks.md`, `skills/authoring-hooks.md`, `skills/examples/safety-hook/README.md` |
| settings/config (5) | `settings.md`, `config-usage.md`, `environment-variables.md`, `approval-mode.md`, `magic-keywords.md` |
| sessions/transcripts (10) | `session.md`, `session-tree-plan.md`, `session-operations-export-share-fork-resume.md`, `session-switching-and-recent-listing.md`, `tree.md`, `compaction.md`, `handoff-generation-pipeline.md`, `non-compaction-retry-policy.md`, `ttsr-injection-lifecycle.md`, `blob-artifact-architecture.md` |
| extensions (7) | `extensions.md`, `extension-loading.md`, `gemini-manifest-extensions.md`, `custom-tools.md`, `plugin-manager-installer-plumbing.md`, `skills/authoring-extensions.md`, `skills/examples/hello-extension/README.md` |
| context/rules (12) | `context-files.md`, `rulebook-matching-pipeline.md`, `system-prompt-customization.md`, `memory.md`, `mnemosyne-memory-backend.md`, `tools/{context-notes,new-context,learn,memory_edit,recall,retain,reflect}.md` |

Out-of-domain (named exclusion groups): providers & auth (12), toolconv (12), TUI (6),
computer-use (2), natives (11), MCP (4), marketplace/plugin authoring (3), tool &
execution runtimes (28), integrations SDK/RPC (2), CLI/build/platform (6), live-sharing (2),
LSP config (1). `tools/read.md` is out of domain but is the **authoritative source for the
`omp://` selector grammar**.

The 45/89 partition was verified by explicit set arithmetic over the index (zero
unclassified). Borderline placements kept **in** and recorded: `blob-artifact-architecture.md`
(sessions), `plugin-manager-installer-plumbing.md` (extensions),
`slash-command-internals.md` (skills — command discovery mirrors skill discovery).

## Reading list (per sub-domain, primary authority first)

1. discovery: `task-agent-discovery.md` → `tools/task.md` → `agent-hub.md` → `prewalk.md` → `advisor-watchdog.md`
2. skills: `skills.md` → `tools/manage_skill.md` → `slash-command-internals.md`
3. hooks: `hooks.md` → `skills/authoring-hooks.md` → `skills/examples/safety-hook/README.md`
4. settings/config: `settings.md` → `config-usage.md` → `environment-variables.md` → `approval-mode.md` → `magic-keywords.md`
5. sessions: `session.md` → `session-tree-plan.md` → `session-switching-and-recent-listing.md` → `session-operations-export-share-fork-resume.md` → `tree.md` → `compaction.md` → …
6. extensions: `extensions.md` → `extension-loading.md` → `custom-tools.md` → `gemini-manifest-extensions.md` → …
7. context/rules: `context-files.md` → `rulebook-matching-pipeline.md` → `system-prompt-customization.md` → …

## Unverified

Category labels are inferred (the harness emits no taxonomy). Docs beyond the indexed 134
were not probed. Sub-domain boundary calls are judgment.