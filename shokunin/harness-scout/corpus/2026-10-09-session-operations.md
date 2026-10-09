# 2026-10-09 — session operations: export, dump, share, fresh, clear, fork, resume

Lane `SessionOps` (scout) · milestone r1-research · axes source-fidelity, coverage.
Question: the operator-visible session operations, what each mutates, and where output lands.

## Observed

Authority: `omp://session-operations-export-share-fork-resume.md`, with **literal text
extraction** from the compiled bundle `/home/vgpnk/.local/bin/omp` (v18.8.6) — not semantic
analysis (no LSP device mounted; the TS source is absent).

| Operation | Token/args | State effect | Artifact / landing | Caveat |
| --- | --- | --- | --- | --- |
| Export (TUI) | `/export [--themes] [path]` | none | HTML; default `omp-session-<stem>.html` in cwd; opens in browser | whitespace-tokenized (quoted paths with spaces not preserved); `--copy`/`clipboard` → `Use /dump to copy the session to clipboard.`; TUI exports the focused subagent view |
| Export (CLI) | `--export <session.jsonl> [out]` | none; no `AgentSession` | same default name via `exportFromFile`; prints `Exported to: …` | missing input → `File not found: <path>`; no live system prompt/tool descriptions embedded |
| Dump | `/dump [all]` | none | clipboard + best-effort `omp-llm-request-<id>.json` in `os.tmpdir()`; `all` → `omp-dump-<id>.zip` | uses the live message array, not all branches; sidecar may hold secrets |
| Share | `/share` | none | E2E-encrypted link (`share.serverUrl` default `https://my.omp.sh/s`; `share.store` `blob`\|`gist`, blob name `session.ompshare.txt`; `share.redactSecrets`) | a custom-share failure terminates and does **not** fall back; works for `--no-session` |
| New | `/new` (TUI) | new session identity (via `handleClearCommand`) | new header in persistent mode | cancellable `session_before_switch{reason:"new"}` |
| Fresh | `/fresh` | resets provider-facing stream state only; transcript/file unchanged | none | rejected while streaming |
| Clear | `/clear` (TUI) | clears live/model conversation in place; appends `reset_boundary` | none | rejected while streaming or foreground bash/eval; aborts active compaction |
| Delete | `/delete` (TUI) | new empty session; best-effort deletes old JSONL + artifacts | none | best-effort, not an erasure boundary; in-memory → `Nothing to delete (in-memory session)` |
| Fork | `/fork` (TUI) | active identity changes; whole-session fork | new session file + copied artifact dir | rejected while streaming; in-memory → `Fork failed (session not persisted or cancelled)` |
| Fork (entry) | RPC `fork` with `entryId` | same-file tree cut at the entry, then branch | new branched file + artifact copy | `entryId` must be a `message` entry else `Invalid entry ID for forking`; RPC uses `requireIdle:true` |
| Fork (CLI) | `--fork <id\|path>` (hidden) | forks into current cwd/session dir | copies source artifacts recursively | `--fork requires session persistence`; hidden from `omp --help` |
| Resume (interactive) | `/resume [id\|@claude\|@codex]` | in-memory state replaced | none | unknown → `Session "<value>" not found`; `@claude`/`@codex` import a foreign session under a fresh OMP identity |
| Resume (CLI) | `--resume` (picker) / `--resume <id\|path>` | after creation | picker scoped to current folder; path-like opens directly | missing recorded cwd → re-root prompt; non-TTY cannot answer → `SessionResolutionError` |
| Continue | `--continue` (startup only; **no `/continue`**) | after creation | breadcrumb/most-recent session or a new one | fresh unmaterialized breadcrumb leaves nothing to continue |
| Restart | `/restart` (TUI) | process relaunches | none | `restartArgv` strips one-shot selectors, appends `--resume <id>` for an on-disk session |

- **Export landing**: default name `` `${lt}-session-${basename(file,".jsonl")}.html` `` with
  `lt === "omp"` → `omp-session-<stem>.html` in the **current directory**; `--export <out>`
  overrides. `export/html/index.ts` exports `exportFromFile`, `exportSessionToHtml`,
  `buildSessionData`, `parseExportArgs`, …; `exportFromFile` opens with
  `{suppressBreadcrumb:true, throwIfMissing:true}` and writes with `Bun.write`.
- **Controller split**: `slash-commands/builtin-collaboration.ts` (export/dump/share),
  `builtin-lifecycle.ts` (new/fresh/clear/delete/resume/restart), `modes/controllers/command-controller.ts`
  (TUI execution), `selector-controller.ts` (`handleResumeSession` → `switchSession` with
  `applyCwdChange`), `session/agent-session.ts` (`freshSession`, `resetSessionContext`,
  `fork`, `exportToHtml`, dumps), `session/session-manager.ts` (`newSession`, `fork`,
  `forkFrom`, `continueRecent`, `createBranchedSession`).
- **Verified state transitions**: `freshSession()` bails if streaming, mints a new provider
  id, never touches `sessionManager`; `resetSessionContext()` bails if streaming/bash/eval,
  resets the agent and appends a `reset_boundary`; `fork(entryId)` throws on a non-`message`
  entry. TUI-only specs (`/clear`, `/delete`, `/new`, `/fork`) match the doc's "Interactive
  slash command" labelling; `/export`, `/dump`, `/share`, `/fresh` carry a headless handler.

## Doc gaps found in source

1. `/fork` has an **undocumented Tern-pane path** (forks into a new terminal pane when the
   Tern daemon supports `fork`, else forks in place).
2. The in-code `/fork` description ("from a previous message") is **stale** vs the
   whole-session `handleForkCommand`.
3. `--fork`, `--prompt-cache-key`, `--provider-session-id` have parse handlers but are
   **hidden from `omp --help`**.
4. Exact refusal strings: `--fork|--resume|--continue requires session persistence`,
   `Fork failed (session not persisted or cancelled)`, `Nothing to delete (in-memory session)`.

## Unverified

`--continue <full-UUID>` → `--resume <UUID>` normalization is doc-stated, not source-located;
`/restart`'s POSIX-exec vs Windows-spawn fallback was not read; share sealing/budget/trim
internals were not re-read (only the literals confirmed). All quotes come from the minified
bundle.