# 2026-10-09 — availability gates: what makes a discovered agent unusable

Lane `AgentAvailabilityGates` (sentinel) · milestone r1-research · axes source-fidelity, coverage.
Question: the guardrails that veto an already-discovered agent, the exact order they
fire, and the refusal shapes.

## Observed

Authority: `omp://task-agent-discovery.md` §"Agent lookup and selection",
§"Availability constraints beyond discovery", §"Plan mode behavior"; guard code sliced
verbatim from `/home/vgpnk/.local/bin/omp` (`18.8.6`) at byte offsets; live config; two
archived substrate refusal transcripts.

- `resolveEffectiveSubagentPolicy` (bundle `SQ`), ordered steps: (1) `settings.reloadFromDisk()`;
  (2) resolve the omitted/explicit name through the parent spawn policy; (3) plan-mode
  request-shape rejects, **then** the depth / self-recursion / spawn-policy guard block;
  (4) rediscover with session cwd + effective extension roots, append session agents,
  exact-name lookup; (5) `task.disabledAgents` check after lookup; (6) plan-mode
  `effectiveAgent`, schema resolution, model policy, and the isolation gate; returns one
  resolved policy object reused by launch.
- **Spawn policy** (`dD`): `"*"`/`true`/`null`/absent ⇒ allow-any, omitted `agent`
  defaults to `task`; `""`/`false` ⇒ deny-all (`Allowed: none (spawns disabled for this
  agent)`); CSV ⇒ allow-list, omitted `agent` defaults to the first; a whitespace/comma-only
  string trims to empty ⇒ deny-all. Membership is an exact-string `includes` on trimmed
  entries (case-sensitive).
- **Guard order is load-bearing** (`TBl`): depth → blocked-self-recursion →
  parent spawn policy, all **before** discovery. Depth predicate `sq(max, depth) =
  max < 0 || depth < max`; `task.maxRecursionDepth` default `2` (live config sets 2
  explicitly; UI options `-1 Unlimited`, `0 None`). At a reached cap the child is handed
  `spawns: ""` and the shared tool filter drops `task`.
- **`PI_BLOCKED_AGENT`** self-recursion guard: reads `request.blockedAgent ?? env` and
  fires only on **strict name equality** (`n === t`), so case/name variants evade it. The
  dispatcher seeds the override from its own env and injects it into every request (the
  child-env injection site itself was not located → inference).
- **`task.disabledAgents`**: `type: array, default: []`; absent from the live config ⇒
  inert here. Checked by exact resolved name after the guards; refusal omits the
  `Available:` clause when no alternatives exist.
- **Plan mode**: rejects run first; `Object.hasOwn` means merely *present* isolation
  keys (`requested`/`apply`/`merge`) reject even when falsy. The `effectiveAgent`
  builder prepends `prompts/system/plan-mode-subagent.md`, restricts tools to
  `read, grep, glob, web_search` (+ `ast_grep` only when declared), and clears
  `spawns` and `prewalk`. Plan mode also rejects eval-defined tools.
- **Isolation master switch**: `Subagent isolated execution requires
  task.isolation.enabled; it is currently false.`
- **Refusal shapes** (all `StructuredSubagentError("preflight", …)`): unknown name
  `Unknown agent "${s}". Available: ${…}. Searched: ${…}`; depth `Cannot spawn another
  agent at task depth ${s}; maximum depth is ${o}.`; self-recursion `Cannot spawn ${n}
  agent from within itself (recursion prevention). Use a different agent type.`;
  spawn policy `Cannot spawn '${t}'. Allowed: ${allowedErrorText}`; disabled `Agent
  "${s}" is disabled in settings. Enable it via /agents, or use a different agent type.`.
- Failures surface as plain text `Task <Name> failed preflight: <message>` — no XML
  envelope, no error code; the wording is the only machine-visible class discriminator.
- Worktree `.omp/agents/` cards: `grep '^spawns:|^tools:'` matched **only** `tools:`
  lines — no card declares `spawns` and no list contains `task`, so all 8 are leaf
  specialists (the doc's `tools: task` ⇒ `spawns: *` back-compat never fires).

## Divergence from the doc

The doc quotes `Unknown agent "…". Available: …` but the shipped 18.8.6 message adds
`. Searched: <dirs>`. An archived substrate probe (older build) lacks the tail — treat
the tail as current-state, not a contradiction.

## Unverified

`reloadFromDisk()` atomicity semantics; the child-env `PI_BLOCKED_AGENT` injection site;
no live spawn probe was launched, so refusal shapes rest on bundle templates plus two
archived observations.