# 2026-10-09 — session storage and the entry model

Lane `SessionStorage` (revenger) · milestone r1-research · axes source-fidelity, coverage.
Question: the session JSONL format, the entry taxonomy, the tree/leaf model, persistence
guarantees, and the on-disk layout.

## Observed

Authority: `omp://session.md` (read in full). Live on-disk observation was **names/stats
only** — no file bodies read.

- **JSONL format**: one JSON object per line; a fixed-width **256-byte** `type:"title"`
  slot first, then the header `type:"session"`, then `SessionEntry` values. Current version
  `3`; new ids are UUIDv7. Header fields include `type`, `version`, `id`, `timestamp`,
  `cwd`, `title`, `titleSource` (`auto`|`user`), `additionalDirectories`,
  `previousSessionFiles`, `providerPromptCacheKey`, `parentSession` (opaque lineage).
- **Entry base**: every non-header entry carries `type`, `id`, `parentId`, `timestamp`;
  `parentId` may be `null` for a root; generated ids are normally 8 hex chars.
- **Entry taxonomy** — 16 members: `message`, `model_usage`, `thinking_level_change`,
  `model_change`, `service_tier_change`, `compaction`, `branch_summary`,
  `reset_boundary`, `custom`, `custom_message`, `label`, `title_change`, `ttsr_injection`,
  `credential_pin`, `session_init`, `mode_change`. Persisted `message.role` is
  **camelCase** (`toolResult`, not `tool_result`); a `toolCall` is a content-block type,
  not a role. Core-reserved `customType` values extensions must not use:
  `tool_execution_start`, `session_exit`, `user_todo_edit`, `vibe-session-lifecycle`,
  `autoresearch-control`. `session_init` is the cold-subagent revival contract;
  `isolated: true` children are not cold-revivable.
- **Tree/leaf**: append-only log + a mutable in-memory `leafId`; ordinary appends create a
  child of the current leaf; `branch(entryId)` moves only the pointer; `resetLeaf()` sets
  it null; `branchWithSummary()` appends a `branch_summary` (root → `fromId: "root"`).
  **There is no persisted leaf field** — loading rebuilds the leaf from the last physical
  entry, so a pointer-only move needs a later append to survive reload.
- **Migration**: v1→v2 adds `id`/`parentId` and converts the compaction index anchor to an
  id anchor; v2→v3 rewrites legacy `hookMessage` role to `custom`; if any ran, the next
  persistence does a **full rewrite** before incremental appends resume. `loadEntriesFromFile`
  skips malformed records (counted), strips/folds the title slot; a first logical entry that
  is not a valid header yields `[]`. `setSessionFile` rejects a non-empty file without a
  valid header **without modifying** it.
- **`buildSessionContext`** (6 steps): resolve the leaf → walk `parentId` to root (bounded
  corrupt-cycle guard) → derive runtime state (thinking, tiers, model map, injected TTSR,
  mode) → apply the `reset_boundary`/compaction emission boundary → convert
  `message`/`custom_message`/`branch_summary` to messages → drop dangling/unsafe tool calls.
- **Persistence**: no `fsync`; memory-only until an assistant message or `ensureOnDisk()`;
  atomic full rewrites via `writeTextAtomic` with a size precondition; a cross-process
  publish lock (size-based, not content-hash); a **process-owned OS lease keyed by session
  id** at `<session-owners>/<session-id>` (Linux abstract socket, no file); a lease held
  elsewhere moves the writer to a fresh sibling `<timestamp>_<new-id>.jsonl` with
  `parentSession` = the old id. Conflict recovery retries up to 3× then moves to a sibling
  (`reason:"contested"`). Errors are latched and logged once, not thrown into the turn loop;
  undecidable durability raises `SessionPersistenceIndeterminateError`.
- **Size controls / blobs**: strings > **500,000** chars truncated (except signed/encrypted
  provider blocks and replay carriers); `image_url` data URLs always content-addressed to
  `blob:sha256:<hash>`; base64 ≥ **1,024** chars externalized; blob store
  `~/.omp/agent/blobs/<sha256>`.
- **Storage abstractions**: `FileSessionStorage`, `MemorySessionStorage`,
  `IndexedSessionStorage` (shared local index + ordered remote publication); `omp gc`
  sweeps unreferenced blobs / archives cold sessions / prunes stale state (preview by
  default, `--apply` required).

## On-disk observation (names/stats only)

`~/.omp/agent/sessions/` holds **9** path-encoded buckets (`-Projects-ompskills`, `-tmp`,
`-Projects-ufo-fsd-alpha`, …), 28 `*.jsonl` journals named
`<ISO-with-dashes>Z_<uuid>.jsonl` (UUIDv7), 22 sibling artifact dirs `<timestamp>_<uuid>/`
(bash/eval/read spill logs, paired `<Name>.jsonl`/`<Name>.md` subagent transcripts, a
`local/` dir), 0 archives, 0 `.bak` recoverables. `custom-session-files/` = 36 flat 7-hex
files (100–151 B). `terminal-sessions/` = 26 `pts-N`/`tmux-%N` files, incl. a
`pts-23 (deleted)` beside a live `pts-23`. `history.db` tables exactly `history`,
`history_fts` (+ shadow tables), `session_recaps`, `session_titles`. `~/.omp/agent/blobs/`
does **not** exist; `~/.omp/run/` has no `session-owners/` (consistent with the Linux
abstract-socket lease).

## Match assessment / gaps

Doc↔observation matches on bucket naming, file naming, UUIDv7, `history.db` tables, and
the absent `session-owners/`. Cosmetic gap: cwd `/tmp` itself appears as `-tmp` (no
trailing dash) — an empty-relative-path edge the doc does not state. Per-session artifact
dirs appear only in prose, not in the doc's layout block.

## Unverified

Implementation links in `omp://session.md` (`packages/coding-agent/src/session/*.ts`) do
not resolve in this substrate, so version constants, thresholds, error classes, and
`buildSessionContext` are doc-only. The 256-byte slot, header/entry JSON shapes, blob refs,
and lease behavior were not read from bodies.