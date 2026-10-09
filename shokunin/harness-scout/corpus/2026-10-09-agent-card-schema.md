# 2026-10-09 — task-agent card frontmatter schema

Lane `AgentCardFields` (scout) · milestone r1-research · axes source-fidelity, coverage.
Question: the `AgentDefinition` shape, `parseAgentFields()` rules, invalid-file
handling, and which keys the 8 first-tranche cards actually use.

## Observed

- Authority: `omp://task-agent-discovery.md` §"Agent definition shape",
  §"Bundled agents", §"Invalid/missing agent file behavior".
- `AgentDefinition`: required `name`, `description`, `systemPrompt`; optional
  `tools`, `spawns`, prioritized `model` list, `thinkingLevel`, `output`,
  `blocking`, `autoloadSkills`, `readSummarize`, `prewalk`, `advisor`; `source`
  (`"bundled" | "user" | "project"`); optional `filePath`.
- `parseAgentFields()` (`packages/coding-agent/src/discovery/helpers.ts`):
  - missing/non-string `name` or `description` → invalid (`null`), treated as parse
    failure;
  - `main` and `sub` are reserved (checked after trim + lowercase);
  - `tools` accepts CSV **or** array; legacy aliases normalized, `yield`
    auto-added — so `tools: []` grants **only** `yield`, not the default toolset;
  - `spawns` accepts `*`, CSV, or array; **back-compat**: `spawns` missing but
    `tools` includes `task` ⇒ `spawns: *`;
  - `output` passed through as opaque schema data;
  - `read-summarize` → `readSummarize` (`false` disables child read structural
    summaries via a `read.summarize.enabled:false` override in `runSubprocess`;
    `scout` ships disabled; absent inherits the parent);
  - `model` one selector / CSV / array, tried in order after role-alias expansion;
  - `thinking-level`/`thinking` → `thinkingLevel`; a task item's coarse `effort`
    (`lo|med|hi`, needs `task.enableEffort`, default false) wins after model
    clamping to `task.maxEffort`;
  - `blocking: true` makes the parent wait even under async;
  - `autoloadSkills` injects named parent-session skills before the first child
    prompt (unknown names ignored);
  - `prewalk` boolean|string (overridden per agent by `task.agentPrewalk`);
  - `advisor` boolean|string (overridden by `task.agentAdvisor`; subagents default
    to none).
  `parseFrontmatter` normalizes line endings and kebab-case keys, replaces tabs,
  and can repair ambiguous plain scalars before failing.
- Invalid-file handling: unreadable dir → empty (`readdir(...).catch(() => [])`);
  read/parse failure → warning + skip; the parse path is `parseAgent(..., level:"warn")`
  with a top-level `key: value` fallback; unresolvable required fields throw
  `AgentParsingError`, caught per-directory. **Net: one bad custom card never aborts
  the directory.** Bundled agents differ — `parseAgent(..., "fatal")`, so a bundled
  error can abort discovery entirely.

## The 8 first-tranche cards (`.omp/agents/`)

Every card uses **exactly** `name`, `description`, `tools` — no `model` pin, no
`spawns` (and no `tools` list contains `task`, so the back-compat rule does not
fire), no `thinking`/`output`/`blocking`/`autoloadSkills`/`read-summarize`/`prewalk`/
`advisor`. `tools` form: `mission-keeper` uses the array form, the other seven CSV.
All eight names are distinct kebab-case and none is `main`/`sub`. This is the
convention a new shokunin card follows.

## Unverified

The implementation files the doc names (`src/discovery/helpers.ts`,
`src/task/types.ts`, `src/task/executor.ts`) are **absent from this workstation**
(only the compiled `omp` binary exists); the exact legacy-alias list, reserved-name
comparison details, and `AgentDefinition` TS field types rest on doc prose. No `lsp`
device is mounted. Doc-fidelity, not code-fidelity.