# 2026-10-09 — context files and the rulebook pipeline

Lane `ContextAndRules` (scout) · milestone r1-research · axes source-fidelity, coverage.
Question: how `AGENTS.md`/`CLAUDE.md`/`GEMINI.md` are discovered and injected, how
`RULES.md` stays sticky, and how rules normalize into buckets.

## Observed

Authority: `omp://context-files.md`, `omp://rulebook-matching-pipeline.md`,
`omp://skills.md:226`, `omp://system-prompt-customization.md`.

### Context files

- Discovered automatically before a session and injected as **one `<repo-rules>` block**
  (one `<file path="…">` element per surviving file, ordered user-first → farthest
  ancestor → closest to cwd). The block lives in the trailing `<project-context>` system
  block, after the static prompt, so sessions in different directories share a cached
  prefix. Content is expanded Markdown with `@` imports resolved; each file's absolute
  path is shown.
- **`agents-md` walk** (`src/discovery/agents-md.ts`): walks ancestor directories from
  `cwd`; for a repo nested under home it continues through enclosing workspace dirs up to
  but **not including** home; with no repo root under home the home boundary remains
  included; otherwise it stops at the repository root (or the filesystem root); files in
  hidden owner dirs are skipped. `claude-md` (`CLAUDE.md`) has the identical walk.
- Native files: `~/.omp/agent/AGENTS.md` (user) and
  `<nearest-non-empty-ancestor>/.omp/AGENTS.md` (project) — a missing `AGENTS.md` there
  does **not** let discovery continue to a farther `.omp/`; empty `.omp/` dirs are skipped.
  `.claude/CLAUDE.md`, `.gemini/GEMINI.md`, `.github/copilot-instructions.md` are
  **cwd-only** (no ancestor walk-up); `.codex`/`opencode` are user-only.
- **Task subagents do NOT inherit `AGENTS.md`** — inherited context files whose basename is
  `agents.md` (case-insensitive) are dropped; `CLAUDE.md`/`GEMINI.md` are inherited; text
  pulled via `@` imports is not filtered.
- **Providers vs model providers**: discovery providers (19: native, omp-plugins, claude,
  agent-plugins, codex, agents, claude-plugins, gemini, opencode, cursor, windsurf, cline,
  github, vscode, agents-md, claude-md, mcp-json, ssh-json, builtin-defaults) are
  config-source adapters; model providers (anthropic, openai, google, …) are inference
  backends. Both namespaces share **one** `disabledProviders` list. Only `enabledModels`
  and `disabledProviders` support path-scoped entries. Per-file off-switch:
  `disabledExtensions` with `context-file:<level>:<basename>`; a disabled file is dropped
  **before** dedup.
- **Load order/size**: priority native 100 … agents-md/claude-md 10 … builtin-defaults 1.
  Dedup: one user file survives across providers (native wins); one project file per
  **directory depth** (multiple depths survive — monorepo ancestor + package both load);
  contained files collapse after `@`-import expansion. Final order: user file, farther
  ancestors, closest-to-cwd last (most prominent).

### Rules

- Canonical `Rule`: `name`, `path`, `content`, `globs?`, `alwaysApply?`, `description?`,
  `condition?`, `astCondition?`, `question?`, `scope?`, `agents?`, `interruptMode?`,
  `_source`. **Identity is `rule.name`** ⇒ precedence and dedup are name-based only.
- Rule providers are **fewer** than the context-file registry: native 100, omp-plugins 90,
  agents 70, cursor 50, windsurf 50, cline 40, github 30, builtin-defaults 1.
  `native` loads `<cwd>/.omp/rules/*.{md,mdc}` and `<agentDir>/rules/*.{md,mdc}` plus the
  sticky files.
- **`RULES.md`** is read only at the active user agent dir and the nearest non-empty
  project `.omp/` (no fallback to a farther `.omp/RULES.md`), loaded as an
  **always-apply rule** whose full body rides every request; frontmatter cannot un-stick
  it. Names: `RULES` (user), `RULES@project` (project) — dedup is name-based, so a regular
  rule with one of those names can shadow it.
- **Buckets** (`bucketRules`): drop `ttsr.disabledRules`; drop `builtin-defaults` when
  `ttsr.builtinRules=false`; filter by `agents` globs against the session's agent name;
  rules with `condition`/`astCondition`/`question` → TTSR-only (if registration accepts);
  remaining `alwaysApply` → always-apply; remaining with `description` → rulebook.
- **`rule://`** resolves exact-name against rulebook + always-apply + registered TTSR
  rules; rules with no description, no `alwaysApply`, and no accepted TTSR condition are
  not addressable.

## Observation of the mission worktree root

`AGENTS.md` and `RULES.md` are **absent** at the worktree root; `.omp/` holds `agents/`
(8 cards) and `skills/` — so no project context file or sticky rule is contributed from
this worktree root (inference from the doc's rules).

## Unverified

The omp implementation tree is **not on disk** (`agents-md.ts`, `rule.ts`,
`rule-buckets.ts`, `frontmatter.ts` all absent; the substrate has no `packages/coding-agent`),
so every implementation-path claim is doc-asserted, not source-verified. No live session
run confirmed an empty `<repo-rules>` block for this worktree; no LSP server answered.