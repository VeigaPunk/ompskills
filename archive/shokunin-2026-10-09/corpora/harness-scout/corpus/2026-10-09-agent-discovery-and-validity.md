# 2026-10-09 — task-agent discovery roots, merge rule, and invalid-vs-shadowed

Lane `GrowHarnessScout` (scout) · system exercise · axis source-fidelity.
Question: state the exact discovery roots and precedence for task agents
(project `.omp/agents`, user `~/.omp/agent/agents`, extensions, Claude plugins,
bundled), the merge/dedup rule, and what makes a definition invalid vs merely
shadowed. Authority cited: `omp://task-agent-discovery.md`.

## Observed

Authority: `omp://task-agent-discovery.md` — sections "Filesystem and plugin
discovery", "Discovery inputs and precedence", "Merge and collision rules",
"Invalid/missing agent file behavior", "Bundled agents". Corroborated against
the prior bundle-level probe in `2026-10-09-agent-discovery-roots.md` (omp
`18.8.6`, `/home/vgpnk/.local/bin/omp`) and live disk state read today.

### Roots and precedence (discoverAgents, in merge order)

1. **Project** — nearest `.omp/agents` dir from
   `findAllNearestProjectConfigDirs("agents", cwd)`; first `.omp` hit only.
2. **User** — `getConfigDirs("agents", { project: false })`, first `.omp` hit
   only; resolves to `~/.omp/agent/agents` (doc's "user `.omp/agents`" wording
   is loose — the real path carries singular `agent/`, per the prior entry).
3. **OMP extension packages** — `<extension-root>/agents` for each enabled root
   from `listOmpExtensionRoots(...)`, inner order: explicit CLI `--extension` /
   SDK `additionalExtensionPaths` roots → the session's effective `extensions:`
   array in configured order → installed npm/link plugins. Gated on the
   `omp-plugins` provider; `explicit-only` mode (`--no-extensions`) leaves only
   explicit roots. Project/user `extensions:` arrays are not concatenated
   (array-replacement settings precedence).
4. **Claude marketplace plugins** — `listClaudePluginRoots(home, cwd)` roots
   with `agents/` subdirs, only when `isProviderEnabled("claude-plugins")`;
   project scope sorts before user scope; user scope additionally requires the
   `claude-plugins`/`claude` user source enabled, except omp-origin roots
   (`origin: "omp"`, `--plugin-dir`). Claude-dialect roots discard frontmatter
   `model`.
5. **Bundled** — `loadBundledAgents()` appends `EMBEDDED_AGENT_DEFS`:
   `scout`, `reviewer`, `security-reviewer` (prompt files) plus `task`, `sonic`
   (shared `task.md` body + injected frontmatter). Parsed at level `"fatal"`:
   unrecoverable YAML or invalid required fields throw and can fail discovery
   entirely.

Skipped by design: direct cross-harness roots `.claude/agents`,
`.codex/agents`, `.gemini/agents` — dropped by the
`TASK_AGENT_CONFIG_SOURCE = ".omp"` source filter, not a denylist.

### Merge/dedup rule

First-wins by **exact, case-sensitive** `agent.name`:

- a `Set<string>` tracks seen names; agents are flattened in directory order
  and kept only if the name is unseen;
- bundled agents are filtered against the same set and appended only if still
  unseen;
- within one directory, markdown files are read in lexicographic filename
  order before dedup;
- lookup afterwards is `getAgent(agents, name)` =
  `agents.find(a => a.name === name)` — exact linear search, no folding.

Implications: project `.omp` overrides user `.omp`; earlier extension roots
override later ones, Claude plugins, and bundled; any non-bundled agent
overrides a bundled same-namer; `Task` and `task` are distinct names.

### Invalid vs merely shadowed

**Invalid** = the card fails `parseAgentFields()`
(`src/discovery/helpers.ts` via `parseAgent(..., level)`):

- missing or non-string `name` or `description` ⇒ invalid (`null`), treated as
  a parse failure;
- reserved names `main` and `sub` — checked after trim + lowercase — ⇒ invalid;
- per directory (`loadAgentsFromDir`, level `"warn"`): unreadable/missing dir ⇒
  treated as empty; a file read or parse failure logs a warning and skips the
  file; an unrecovered frontmatter error falls back to top-level `key: value`
  lines (each parsed as YAML when possible); if required fields are still
  invalid, `AgentParsingError` is thrown and caught by the directory loader.
  Net effect: one bad custom file never aborts discovery of the others.
- contrast: bundled parsing runs at level `"fatal"`, so the same field errors
  throw and can fail discovery entirely.

**Shadowed** = the card parses cleanly (all required fields present, name not
reserved) but an earlier root in the flattened order already claimed its exact
name. First-wins drops it silently: no warning, no error, and `getAgent`'s
exact-name search can never return it. Shadowing is a precedence outcome, not a
defect. Case-sensitivity matters here in both directions: same spelling wins by
order; different case does **not** shadow (`Task` never blocks `task`).

**Neither invalid nor shadowed — traps that survive parsing:** an explicit
`tools: []` grants only `yield` (not the default toolset); a missing `spawns`
with `task` in `tools` backfills `spawns: *`.

## Live state read today (2026-10-09)

- `~/.omp/agent/agents` exists — 13 cards (connector, critic, distiller,
  executor, labrat, …).
- Project `/home/vgpnk/Projects/ompskills/.omp/agents` — 16 cards
  (evidence-auditor, fleet-warden, godspeed-keeper, harness-scout, …).
- `comm -12` of the two filename sets: **empty** — no project/user name overlap
  on disk right now, so no live shadowing instance to point at.
- Foreign root `/home/vgpnk/.claude/agents` exists (`the-kimiraikkoner.md`) and
  is skipped by the `.omp` source filter; no `~/.codex/agents` or
  `~/.gemini/agents` on this machine.

## What changed

New entry; supersedes nothing. The prior `2026-10-09-agent-discovery-roots.md`
answered the same roots question from lane `AgentDiscoveryRoots` with deeper
bundle-level symbol attribution; this entry restates the assignment's three
asks against the doc with today's live-state read and pins down the
invalid-vs-shadowed distinction, which the prior entry treated only in passing.

## Unverified

No `task` dispatch was run, so shadowing/invalidity outcomes are inferred from
doc + compiled-bundle probes, not from a printed preflight. The Claude-plugin
and extension-package branches have no roots on this machine and were not
exercised. Minified identifiers quoted from the bundle are build-specific.
