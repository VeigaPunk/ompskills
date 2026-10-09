# 2026-10-09 — session listing, switching, and the session tree

Lane `SessionListing` (reviewer) · milestone r1-research · axes source-fidelity, coverage.
Question: how recent sessions are discovered and switched, and how the session tree behaves.

## Observed

Authority: `omp://session-switching-and-recent-listing.md`, `omp://session-tree-plan.md`,
cross-referenced with `omp://session.md`; live read-only FS corroboration.

- **Directory scope**: file sessions live at
  `~/.omp/agent/sessions/<encoded-cwd>/*.jsonl`; encoding `-<relative>` under home,
  `-tmp-<relative>` under the temp root, `--<encoded-absolute>--` otherwise;
  filenames `<ISO-with-dashes>Z_<uuidv7>.jsonl`. Reverted hashed-scheme buckets are
  migrated best-effort.
- **Two listing pipelines**: `getRecentSessions(sessionDir, limit=4)` for the welcome
  summary (mtime-desc, `history.db` `session_titles` index, prefix/tail fallback,
  untitled empty stubs skipped) and `SessionManager.list(...)` for pickers/id matching
  (4 KiB prefix + bounded 32 KiB tail, lifecycle status, cached, bounded parallel workers).
  Picker callers use `listForPicker`/`listAllForPicker` (drop untitled empty stubs unless
  pinned). Normal scans repair the newest orphaned `.bak`; `listSessionsReadOnly` does not.
- **Display names**: `sessionDisplayName` = `title` → first user message → `Untitled · <time>`
  (raw id intentionally never used).
- **`--continue`** (`continueRecent`, breadcrumb-first): reads
  `~/.omp/agent/terminal-sessions/<terminal-id>`; a missing target is usable only when its
  optional third line is `fresh`; a missing fresh target starts a new session (does not
  resurrect the transcript); re-root only when the recorded device/inode matches; else a
  cwd-matching breadcrumb, else the newest non-empty session. Terminal id precedence: TTY
  path, then `ZELLIJ_PANE_ID`, `TMUX_PANE`, `CMUX_SURFACE_ID`, `KITTY_WINDOW_ID`,
  `WEZTERM_PANE`, `TERM_SESSION_ID`, `WT_SESSION`.
- **`--resume`**: a path-like value opens directly (`throwIfMissing`); a resume key goes
  through `resolveResumableSession` (local first, then global unless a custom `sessionDir`
  disables fallback) with a case-insensitive matcher (id prefix | JSONL filename prefix |
  id suffix after the timestamp), first match in modified-desc order. A matched session
  whose recorded cwd is gone triggers the re-root prompt; non-TTY cannot answer →
  `SessionResolutionError`. `--resume` with no value opens the picker; it never auto-switches
  to all-projects.
- **Picker presentation**: `apps/session-picker.ts` `selectSession` — fullscreen TUI,
  Tab toggles folder/all-projects scope, search combines metadata with `history.db` prompt
  history, Esc cancels, Ctrl+C exits. In-session picker uses `ctx.ui.showOverlay`; a
  recoverable pre-switch failure keeps the picker open.
- **`switchSession` (13 steps)**: emits cancellable `session_before_switch{reason:"resume"}`,
  disconnects listeners, aborts work, flushes pending writes, snapshots rollback state;
  `setSessionFile` loads/migrates/backfills; then emits `session_switch`, replaces messages,
  closes provider sessions, applies the resolved model, restores thinking + tiers,
  reconnects. Returns `false` when a hook cancels or cwd policy rejects (a cross-project
  switch without a cwd-change callback is rejected). Model restore picks the first
  registered+enabled+credentialed candidate, retried once; an unresolvable different session
  throws `Could not restore model <provider/id>` and rolls back (TUI-style sessions with
  `retry.modelFallback` keep the current model with a notice instead).
- **Tree model**: append-only log, tree-based runtime. Every non-header entry has `id` and
  `parentId`; the active position is `leafId`. `SessionManager` internals: `#index` in
  lockstep with `#entries`, `#entriesById`, `#children`, `#labels`, `#leaf`, `#usage`;
  `getBranch`, `getTree` (children sorted oldest→newest by timestamp), `getChildren`,
  `getLabel`. Leaf primitives: `branch(entryId)` (pointer-only, cannot target `null`),
  `resetLeaf()` (next append is a new root), `branchWithSummary(id, …)`.
- **`/tree`** (`navigateTree`): validates, computes the abandoned path, emits
  `session_before_tree` with `TreePreparation`, optionally summarizes, then applies
  `branchWithSummary`/`resetLeaf`/`branch`; selecting a user message moves the leaf to its
  **parent** and restores the draft. `/branch` (alias `/rewind`) does a same-file rewind
  with `summarize:false`. Programmatic `AgentSession.branch(entryId)` **creates a new
  session file** (`createBranchedSession`), which excludes existing `label` entries and
  rebuilds fresh labels; in-memory sessions never return a file path.
- **Extension/hook integration**: `session_before_tree` receives
  `{targetId, oldLeafId, commonAncestorId, entriesToSummarize, userWantsSummary}` and may
  cancel or supply the summary; `session_tree` emits `newLeafId`, `oldLeafId`,
  `summaryEntry`, `fromExtension`.

## Cross-check of the two docs

No contradiction. Ranked tensions: (1) **neither assigned doc states the leaf pointer is
non-durable across reload** — only `session.md` does; a reader of just these two could
believe a bare `branch()` persists. (2) "branch" is overloaded (pointer move vs new-file API
vs the same-file `/branch` command). (3) Differing error strictness per layer (zero-mutation
header rejection vs lenient tree rooting). (4) The picker's "fork marker" is never defined
(it reflects the header `parentSession` lineage). (5) File listings sort by mtime while tree
children sort by entry timestamp.

## Unverified

All runtime behavior is doc-cited (the omp source is absent; `substrates/omp` is a pointer
only) and no CLI probe was run. The relative ordering of the breadcrumb's `fresh` vs
`cwdstat` lines is unverified (only a `cwdstat` variant observed). The picker UI,
`history.db` `session_titles` usage, and orphan-`.bak` repair were not inspected.