# 2026-10-09 — the transcript-reading internal URIs

Lane `TranscriptURIs` (scribe) · milestone r1-research · axes source-fidelity, coverage.
Question: what `history://`, `agent://`, `artifact://`, and `local://` resolve to, whether
they are writable, their selectors, and where the data lives on disk.

## Observed

Authority: the harness docs (`omp://tools/read.md`, `omp://blob-artifact-architecture.md`,
`omp://agent-hub.md`, `omp://session.md`, `omp://tools/task.md`, `omp://tools/write.md`,
`omp://tools/grep.md`, `omp://tools/glob.md`, `omp://tools/eval.md`, …) plus **live
read-only probes** through `read`.

- The `read` tool delegates to `InternalUrlRouter`, whose built-in registry includes
  `agent://`, `artifact://`, `attachment://`, `cfg://`, `conflict://`, `history://`,
  `issue://`, `local://`, `mcp://`, `memory://`, `omp://`, `pr://`, `proc://`, `rule://`,
  `security://`, `skill://`, `ssh://`, `vault://`, `xd://`. Handlers:
  `internal-urls/router.ts`, `history-protocol.ts`, `agent-protocol.ts`,
  `artifact-protocol.ts`, `task/output-manager.ts`; `local://` has **no** protocol module
  (a file-backed scheme the router locates to the session-local sandbox).
- **`history://<id>`** — concise transcript of a live/parked agent or a retained on-disk
  `<artifactsDir>/<id>.jsonl`; **read-only** (a registered read-only scheme, denied at the
  approval gate). Bare `history://` lists registered agents and persisted subagents
  (`id | status | kind | parent | last activity`); advisor rows are excluded. Line and
  `:raw:N-M` selectors work; out-of-bounds returns explanatory text, not an error.
  `history://current/full` is experimental-gated on `compaction.experimentalContextManagement`
  (off here — `history://current` simply names an ordinary agent). Unknown id →
  `Unknown agent: <id>` + the known list.
- **`agent://<id>`** — a subagent's **saved output** (`<artifactsDir>/<id>.md`), else a
  **progress document** (status + accepted `yield` payloads + latest assistant text) when
  no `.md` exists; **not** the live transcript. Dotted nested ids (`agent://Parent.Child`);
  a slash path is **always JSON extraction** (`agent://<id>/<key>/<index>`), which reads the
  `<id>.json` sidecar first and bypasses pagination — line selectors are rejected with
  `Cannot combine query extraction with line selectors`. Unpublished + extraction →
  `Output <id> is not published yet`. **Writable**: `write agent://<id>` is peer messaging
  (steer/wake/revive); `agent://all` is **write-only broadcast** (a bare read is refused).
- **`artifact://<id>`** — spilled/truncated tool output; **numeric id required**, session-local;
  file `<artifactsDir>/<id>.<sanitizedToolType>.log`; read-only. Bare `artifact://` is
  refused; a missing id reports the available ids (observed as a live monotonic list).
  Whole-resource reads are capped at 8 MiB, unbounded `:raw` of a URL-located file at 50 KiB
  (both unexercised here).
- **`local://<name>.md`** — the session-scoped scratch root
  (`<session-file-dir>/<session-stem>/local`); bare `local://` is a directory listing;
  glob-addressable; **writable** via the plain-file path (the receipt names the URL, never
  the backing path); a trailing line selector on a write target is refused. Shared with
  subagents; plan artifacts live here (`local://<slug>-plan.md`).
- **Observed layout for one session**: `<sessionDir>/<stem>.jsonl`,
  `<sessionDir>/<stem>/{<N>.<tool>.log, <AgentId>.jsonl, <AgentId>.md/.json, local/}`.
  No `.md` outputs existed yet; `history://` returned only live rows; `artifact://89`
  round-tripped a lane's own spilled `ls` output. The session lived under a tower-fleet
  `sessionDir` override, not the documented default `~/.omp/agent/sessions/<encoded-cwd>/`.

## Unverified

All write paths (read-only lane); `agent://` extraction on a *published* output; dotted
nested ids; `history://` for a parked/persisted agent and the experimental `current/full`
route; the 8 MiB and 50 KiB refusals; cross-session artifact-dir preference; `local://`
rich selectors (`:img`, `:conflicts`, `?q=`) — the root was empty at probe time.