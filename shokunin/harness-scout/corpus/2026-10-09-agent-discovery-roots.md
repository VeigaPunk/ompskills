# 2026-10-09 — task-agent discovery roots and first-wins precedence

Lane `AgentDiscoveryRoots` (scout) · milestone r1-research · axes source-fidelity, coverage.
Question: which roots `discoverAgents(cwd, home, extensionRoots?)` merges, in what
order, how a name collision resolves, and which foreign roots are skipped.

## Observed

- Authority: `omp://task-agent-discovery.md` ("Filesystem and plugin discovery" →
  "Discovery inputs and precedence" → "Merge and collision rules"). Implementation
  corroboration: the compiled bundle `/home/vgpnk/.local/bin/omp` (omp `18.8.6`,
  283,690,464 B, `md5 a9a0bd3fcf5940410ddf651884dd6571`) carries the original
  `// packages/coding-agent/src/<file>` path comments, so file attribution is exact
  while identifiers are minified.
- Implementation files (doc path → bundle alias): `packages/coding-agent/src/task/discovery.ts`
  (`discoverAgents`=`nI`, `getAgent`=`xQ`, `loadAgentsFromDir`=`oBl`,
  `TASK_AGENT_CONFIG_SOURCE`=`lRr` = `".omp"`); `task/agents.ts`
  (`loadBundledAgents`=`Bk`, `EMBEDDED_AGENT_DEFS`=`J5l`, `parseAgent`=`ojt`,
  `AgentParsingError`=`Noo`); `config.ts` (`getConfigDirs`=`f4`,
  `findAllNearestProjectConfigDirs`=`VLn`); `discovery/helpers.ts`
  (`parseAgentFields`=`_Ls`, `listClaudePluginRoots`=`tF`);
  `discovery/omp-extension-roots.ts` (`listOmpExtensionRoots`=`Pfe`);
  `capability/index.ts` (`isProviderEnabled`, `isUserSourceEnabled`).
- Ordered inputs, deduped first-wins by exact `agent.name` in this sequence:
  1. nearest project `.omp/agents` — `findAllNearestProjectConfigDirs("agents", cwd)`
     filtered `source === ".omp"`, **first `.omp` hit only**.
  2. user `.omp` agent dir — `getConfigDirs("agents", {project:false})` filtered
     `".omp"`. Resolves to **`~/.omp/agent/agents`** (singular `agent/`; also
     `~/.omp/profiles/<profile>/agent` under a profile) — the doc's looser
     "user `.omp/agents`" is imprecise.
  3. `<extension-root>/agents` for each `listOmpExtensionRoots(...)` when
     `isProviderEnabled("omp-plugins")`; inner order explicit CLI/SDK `--extension`
     roots → session effective `extensions:` array → installed npm/link plugins.
  4. Claude marketplace plugin roots `listClaudePluginRoots(home, cwd)` when
     `isProviderEnabled("claude-plugins")`, project scope before user scope; kept
     only if project scope, or the `claude-plugins`/`claude` user source is enabled,
     or the root's origin is not the foreign `claude` tree. A Claude-dialect root
     discards frontmatter `model` (`ignoreModel`).
  5. bundled `loadBundledAgents()` — `scout`, `reviewer`, `security-reviewer`,
     `task`, `sonic`; parsed at level `fatal` (a bundled YAML error can abort
     discovery, unlike custom cards).
- Collision implications (all from the order above): project `.omp` beats user
  `.omp`; earlier extension roots beat later ones, Claude plugins, and bundled;
  non-bundled beats bundled; name matching is **case-sensitive** (raw string
  compare; only the `main`/`sub` reserved-name test lowercases); within one
  directory files are read in `localeCompare` filename order (the doc says
  "lexicographic"; ASCII-equivalent).
- Cross-harness skip mechanism is the `.filter(c => c.source === ".omp")` source
  filter, not a denylist: `.claude/agents`, `.codex/agents`, `.gemini/agents` sit
  in the config-dir source tables but are dropped. `SOURCE_PATHS` covers a wider
  harness set but feeds skills/rules/context, not task agents.
- `getAgent(agents, name)` = `agents.find(a => a.name === name)` — linear,
  exact, no folding. Invalid/one-bad-file handling: unreadable dir → empty; read
  or parse failure → warn + skip; `parseAgent(..., level:"warn")`; a custom card
  failing required fields throws `AgentParsingError`, caught per-directory.

## Divergences from the doc

- Doc "lexicographic" is `localeCompare`.
- Doc `Unknown agent "…". Available: …` is abbreviated: the shipped message appends
  `. Searched: <searchedDirs>`.
- Doc does not name the extension-root inner ordering (explicit → session
  `extensions:` → installed plugins) nor the `merge` vs `explicit-only` mode.

## Unverified

No dispatch was run, so the *runtime* collision outcome (which card actually serves
a shadowed name) is inferred from code+doc, not printed. Claude-plugin and
extension-package branches were not exercisable (no such roots on this machine).
Identifiers are build-specific minified names.