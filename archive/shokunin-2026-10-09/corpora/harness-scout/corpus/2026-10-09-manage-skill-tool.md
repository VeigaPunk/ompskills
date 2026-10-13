# 2026-10-09 — the manage_skill tool

Lane `ManageSkillTool` (scout) · milestone r1-research · axes source-fidelity, coverage.
Question: what `manage_skill` does, how it is gated and mounted, its inputs/outputs and
refusals, and where managed skills live.

## Observed

Authority: `omp://tools/manage_skill.md` (MS); cross-checks `omp://skills.md` (SK),
`omp://settings.md` (SET), `omp://custom-tools.md` (CT), `omp://tools/learn.md` (LEARN).

- **Purpose**: create, update, or delete an **isolated managed skill**; managed skills
  are generated under `<agent-dir>/managed-skills` and never edit authored skills.
  Declared sources: `packages/coding-agent/src/tools/manage-skill.ts`,
  `prompts/tools/manage-skill.md`, `autolearn/managed-skills.ts`,
  `extensibility/skills.ts`.
- **Registration/visibility**: `approval = "write"`, `strict = true`,
  `loadMode = "essential"`; stays **top-level**, not mounted under `xd://` (CT: essential
  built-ins stay top-level; discoverable tools mount under `xd://`). Registration
  requires `autolearn.enabled = true` (default `false`) and is **independent of
  `memory.backend`**. Enabled top-level sessions auto-include it; **subagents do not
  discover it** but may use it when explicitly listed. Execution is single-shot, no
  progress updates.
- **Inputs**: `action` (`create|update|delete`, required); `name` (required; trimmed and
  lowercased, then validated against `[a-z0-9][a-z0-9-]{0,63}`); `description` and
  `body` (both required for `create`/`update`; `delete` needs only `name`).
- **Outputs**: `delete` → `Deleted managed skill "<name>".`; `create`/`update` →
  `Created`/`Updated managed skill "<name>" (managed-skills/<name>/SKILL.md).` with
  `details = {action, name}`. Authored-skill shadowing on `create` returns
  `isError: true` with `details.shadowed = true` and **writes nothing**.
- **Flow**: `createIf` exposes the tool only when `autolearn.enabled`; `create` checks
  whether an active authored skill already owns the name (→ shadow error); create/update
  call `writeManagedSkill` (normalize + validate name, sanitize frontmatter, serialize
  same-name in-process writes, write `SKILL.md`); a successful mutation refreshes active
  skills when the session callback exists (a refresh failure propagates **after** the
  write — no rollback). `create` is exclusive-create (`wx`), not temp+rename.
- **Location/provider**: `<agent-dir>/managed-skills/<name>/SKILL.md` (default
  `~/.omp/agent/managed-skills`); provider `omp-managed`, priority **5**
  (SK §providers), registered in `discovery/builtin.ts`, discovered unconditionally and
  resolved dead-last, always deferring to a same-named authored skill.
- **Caps/sanitization**: descriptions sanitized to one line (control/format chars, angle
  brackets, backticks, repeated tildes stripped); bodies trimmed non-empty; generated
  frontmatter carries only normalized `name` + sanitized `description`; final file
  capped at **64,000 UTF-8 bytes**; the root, skill dir, and file are checked against
  symlink escapes and `update` rejects non-regular/multiply-hard-linked files.
- **Refusals**: `Invalid skill name "<raw>"…`; `"<action>" requires both "description"
  and "body".`; `Managed skill "<name>" needs a non-empty description.`; `… non-empty
  body.`; `Managed skill is <bytes> bytes; the limit is 64000.`; action-specific helper
  errors for existing/missing targets; safety errors for unsafe roots/symlinks.
- **Live**: the global config has no `autolearn`/`memory` keys → defaults apply
  (`autolearn.enabled=false`), and `~/.omp/agent/managed-skills` does not exist (expected
  with autolearn disabled — the dir is created on first managed write).

## Unverified

The source files in MS §Source were not found in the read-only substrate; no `lsp` server
answered. All behavioral claims rest on the doc (the doc's metadata/flow are treated as
authoritative per "the live doc wins"). The `priority 5` value is attributed to SK, not MS.