# 2026-10-09 — approval, slash commands, and magic keywords

Lane `ApprovalAndCommands` (scout) · milestone r1-research · axes source-fidelity, coverage.
Question: how tool approval resolves, how slash commands are discovered and expanded, and
which magic keywords exist.

## Observed

Authority: `omp://approval-mode.md`, `omp://slash-command-internals.md`,
`omp://magic-keywords.md`, `omp://skills.md`.

### Approval

- **Three inputs**: (1) the tool's `approval` tier — `read` (reads data or UI-only session
  metadata), `write` (mutates workspace/session state, no arbitrary code), `exec` (executes
  code, shells out, drives a browser, spawns agents); (2) an object-form tool policy
  `policy: allow|deny|prompt` with optional `override`/reason/`policyKey`; (3) user policy
  `tools.approval.<toolName>` which overrides the mode but **cannot** bypass a tool's own
  deny/prompt or a non-yolo safety override.
- Tools without an `approval` declaration, and decisions without a valid tier, default to
  **`exec`**; **MCP server tools declare `write` regardless of their annotations**.
- **Modes**: `always-ask` (auto `read`), `write` (auto read+write), `yolo` (auto all; the
  schema default). `--approval-mode` overrides the configured mode; `--auto-approve`/`--yolo`
  force yolo even alongside an explicit `--approval-mode`. Fail-closed: an execute-time caller
  with neither settings nor `autoApprove` resolves to `always-ask` with no grants, and a call
  requiring a prompt with no interactive UI **fails** rather than silently allowing.
- **Resolution per tool call** (ordered): evaluate `tool.approval(args)` (malformed → `exec`)
  → tool-declared `deny` always denies → user `deny` always denies → in yolo an explicit tool
  `allow`/`prompt` wins, else a valid user policy, else allowed → in non-yolo an
  `override:true` allows only with an accompanying tool `policy: allow`; every other
  non-denied case prompts → without an override, explicit tool policy wins, then valid user
  policy → with no explicit policy the mode decides by tier. Approval is **re-resolved after
  extension `tool_call` handlers revise the input**. `policyKey` selects
  `tools.approval.<policyKey>` first (e.g. `xd://lsp` writes consult `tools.approval.lsp`).
- **MCP keying**: the exact final registered name `mcp__<server>_<tool>` (redundant
  `<server>_` prefix removed; >64 chars capped with a deterministic hash suffix; sanitizer
  lowercases and keeps `[a-z0-9_]`). Legacy digit-stripped `deny`/`prompt` keys are inherited
  only when no current-name policy applies; legacy `allow` is never inherited.
- **Safety overrides**: object-form `{tier:"exec", override:true, reason}`; `bash` uses it for
  critical patterns (`rm -rf /`, fork bombs, remote-fetch-then-execute, `/etc/passwd` writes,
  host shutdown), which beat a matching `allow`/`prompt` (but not `deny`). `bash.patterns`
  (`deny` absolute, `prompt` forces, `allow` = simple command at the `write` tier);
  `bash.allowCompoundCommands` off by default (only flat `&&` chains of literal args; any
  segment deny wins, else any prompt; a whole-chain restriction vetoes). **Scope limit: the
  pattern policy gates approval for the `bash` tool, not containment — `eval` also declares
  `exec` and can spawn a shell, so a `bash.patterns` deny does not apply to the same command
  via `eval`.**
- **ACP**: same settings resolver; precedence runtime flags > `--config` > project > global;
  no session-level approval-policy field; `yolo` skips tier prompts and the client permission
  gate unless a per-tool policy requires it; rejected/cancelled prompts reject the call.
- **Subagents** run headless at `yolo`; the parent `task` approval is the authorization
  boundary; user `deny` stays absolute and any `prompt` resolution rejects.

### Slash commands

- A capability (`id: "slash-commands"`, key = command name); providers loaded in parallel,
  consumed in priority order, deduped first-wins; `disabledExtensions` can carry
  `slash-command:<name>`. Priorities: native 100, omp-plugins 90, claude 80,
  claude-plugins/agents/codex 70, opencode 55. Lower-precedence duplicates are marked
  `_shadowed`. **Extension-registered handler commands use a different rule: the last loaded
  extension registering a name wins.** Built-ins are a separate registry, dispatched before
  session-level expansion, and reserve their names/aliases first.
- File scanning is non-recursive `*.md` via native glob (`gitignore: true`, `hidden: false`).
  `native` loads `<cwd>/.omp/commands/*.md` (project) and `<agentDir>/commands/*.md` (user) —
  **project beats user** within the provider. Claude commands get namespaced aliases
  (`foo/bar.md` → `bar` and `foo:bar`).
- Prompt pipeline after the built-in boundary: extension commands → TypeScript custom/MCP
  prompt commands → file-based slash commands (`expandSlashCommand`) → prompt templates →
  delivery. File-command expansion splits the name at the **first literal space**, parses
  quote-aware args (`$1`, `$@[start:length]`, `$ARGUMENTS`/`$@`; one-pass substitution; no
  backslash escaping). Unknown `/...` is **not rejected** — it falls through as ordinary
  prompt text. `runCommands: false` skips handlers; `expandPromptTemplates: false` bypasses
  all expansion. Streaming requires `streamingBehavior` (`steer`/`followUp`/`aside`) or the
  prompt throws.

### Magic keywords

Single source of truth: `packages/coding-agent/src/modes/magic-keywords.ts`. Table:
`ultrathink` (careful multi-step reasoning; selects the model's highest supported effort for
the turn, bypassing `providers.autoThinkingMaxEffort`), `orchestrate` (multi-agent
orchestration contract; requires `task`), `workflowz` (deterministic multi-subagent workflow
via the eval kernel's `agent()`/`workpool()`; requires both `eval` and `task`), `jevify`
(bulk-classification contract via the eval `judge()` helper; requires `eval`). Matching:
exact lowercase, standalone prose only (letters/digits/underscores/slashes/hyphens/`()` do not
match), ignoring fenced code, inline code, and HTML/XML comments/tags; matching runs on the
**expanded** prompt; synthetic prompts never trigger notices. Config keys
`magicKeywords.enabled` plus per-keyword flags (`magicKeywords.workflow` for `workflowz`).

## Unverified

The docs cite `packages/coding-agent/src/...` paths not present on this filesystem; all
code-level claims are doc-sourced with binary string probes as literal corroboration only.
No live TUI session exercised approval prompts, `/skill:` delivery, or magic-keyword
injection.