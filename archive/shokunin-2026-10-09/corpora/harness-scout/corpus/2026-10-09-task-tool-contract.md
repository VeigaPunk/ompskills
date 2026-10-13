# 2026-10-09 — the task tool contract (call shapes, per-item keys, caps)

Lane `TaskToolSurface` (reviewer) · milestone r1-research · axes source-fidelity, coverage.
Question: what one `task` call accepts, what its per-item keys do, how a lane is
addressed, and which caps bind it.

## Observed

Authority: `omp://tools/task.md`, `omp://task-agent-discovery.md`, targeted
`omp://settings.md`; live `/home/vgpnk/.omp/agent/config.yml`.

- **Call shapes.** `task.batch` (default on) shape-swaps the wire schema.
  Batched: `{ context, tasks: item[] }` — `context` is required shared background
  rendered into every spawn's `CONTEXT` section; `agent`, `outputSchema`,
  `schemaMode` are per item; provided names must be unique within a call
  (case-insensitive). Flat: `{ ...item }`, one spawn; `tasks`/`context` rejected.
  Runtime stays permissive (the flat form is accepted while batch is on for internal
  callers/stale transcripts); the model sees one shape.
- **Per-item keys.** `name?` (stable id; CamelCase ≤32 requested but only a string
  required; defaults to a generated AdjectiveNoun, session-uniquified by
  `AgentOutputManager`); `agent?` (exact-name; also accepts session `m1`/`m2` model
  pseudonyms); `task` (required, empty-after-trim rejected); `solutionSpace`
  (required by the schema, but the tool's `lenientArgValidation` still spawns without
  it — it is the **sole input to the `auto` thinking classifier**; ignored when
  thinking is not `auto`); `outputSchema?`; `schemaMode?` (`permissive` default,
  `strict` fails after retry exhaustion; invalid caller schemas fail preflight in
  either mode); `tools?` (`string[]` of names defined in the **parent** eval kernel;
  requires `eval.tools.enabled` default true; rejected in plan mode); conditional
  `effort?` (`task.enableEffort`), `isolated?` (`task.isolation.enabled` + no plan
  mode). Legacy per-call `schema` is always rejected. There is no wire label field.
- **Agent selection.** Exact-name linear search. Unrestricted session + omitted
  `agent` → `task`; restricted parent `spawns` CSV + omitted `agent` → first listed
  name. Missing name → preflight fail `Unknown agent "…". Available: …` (shipped:
  plus `. Searched: <dirs>`); denial → `Cannot spawn '…'. Allowed: …`.
- **Output-schema precedence.** item `outputSchema` > agent frontmatter `output` >
  parent session `outputSchema`. Model precedence (separate): `task.agentModelOverrides[agent]`
  > frontmatter `model` list > parent active → configured/default; role aliases expand
  through `modelRoles`.
- **Depth and concurrency.** `task.maxRecursionDepth` default `2` (negative
  disables); `task.maxConcurrency` default `32` (0 unlimited). **Live config.yml
  lines 24–25 set both explicitly to 32 and 2** (equal to defaults). One
  session-scoped `Semaphore` per `TaskTool`, resized from the live setting before
  every acquire/release, bounds all spawn runs including sync/speculative. At the
  depth cap `runSubprocess` strips the child's `task` tool and sets its spawn policy
  empty.
- **Addressing.** Ids are name-based, session-unique: `Task`, `Task-2` on repeats,
  `<id>.<child>` when nested. `read agent://<id>` → `<id>.md` (inline summary capped
  at `FULL_OUTPUT_THRESHOLD = 5000` chars); a `<id>.json` sidecar is written for
  structured payloads even when schema-invalid, and JSON-path reads prefer it;
  `agent://<id>/<key>/<index>` is JSON extraction. `write agent://<id>` messages/wakes
  a parked agent; `agent://all` is **write-only** broadcast and cannot carry JSON-path
  suffixes. `history://<id>` renders the transcript. Lifecycle: `running | idle |
  parked | aborted`; parking after `task.agentIdleTtlMs` (default `420_000` ms);
  `Main` is never parked.
- **`blocking: true`** (frontmatter only) makes the parent wait for that agent even
  under async; no bundled agent declares it. `async.enabled` default true,
  `async.maxJobs` default 100 — non-blocking spawns register background jobs, ids
  allocated up front, and the call returns immediately; job cancellation is
  `write proc://<jobId>/kill`.
- **Runtime limits.** Tool mode `approval="exec"`, `strict=false`,
  `lenientArgValidation=true`, `loadMode="essential"`; per-subagent output truncation
  `MAX_OUTPUT_BYTES = 500_000`, `MAX_OUTPUT_LINES = 5000`
  (`PI_TASK_MAX_OUTPUT_BYTES`/`PI_TASK_MAX_OUTPUT_LINES`); missing-`yield` recovery up
  to 3 reminders; child sessions do not inherit conversation history.

## Not carried by the sources read

Live config sets no `task.batch`, `enableEffort`, `speculativeLaunch`,
`disabledAgents`, or `isolation` keys, and no top-level `async:`/`eval:` blocks — so
all documented defaults are in effect. The doc itself flags one inconsistency
(`task-follow-up.md` labels isolated runs non-resumable vs the retained-workspace
lifecycle).

## Unverified

All `src/task/**` paths are citations of the doc's own Source listing — the substrate
is the ufo-fsd project, not the omp source tree, so no code-level check was possible.
"Live defaults" are inferred from the absence of keys in the single global config.