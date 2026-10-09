# 2026-10-09 — configuration discovery and resolution

Lane `ConfigDiscovery` (scout) · milestone r1-research · axes source-fidelity, coverage.
Question: which roots are scanned, in what order, how overlays work, which files own the
loader, and how this relates to `omp://settings.md`.

## Observed

Authority: `omp://config-usage.md` (read in full), cross-checked against
`omp://settings.md`, `omp://environment-variables.md`, `omp://slash-command-internals.md`,
`omp://extension-loading.md`, `omp://skills.md`.

- **Source priority (fixed list)**: `.omp` → `.claude` → `.codex` → `.gemini`. User bases
  are the native `~/.omp/agent` (profile-relocated), Claude's active config dir
  (`CLAUDE_CONFIG_DIR` overrides), `~/.codex`, `~/.gemini`; project bases are
  `<cwd>/.omp|.claude|.codex|.gemini`. The generic helpers in `src/config.ts`
  **do not include `.pi`**.
- **Helpers**: `getConfigDirs(subpath, {user, project, cwd, existingOnly})`,
  `findConfigFile`/`findConfigFileWithMeta` (first existing across ordered bases),
  `findAllNearestProjectConfigDirs` (walks parents, nearest existing dir per base, sorted
  by source priority). `getConfigDirs` returns **user-level entries first, then
  project-level** (same source priority within each).
  - **Doc conflict, unresolved**: `omp://slash-command-internals.md:83` says
    `getConfigDirs()` returns **project first, then user**. Both live docs cannot be
    right; no source is available to settle it. Treat as a doc defect; both agree that
    native *project* content outranks native *user* content for slash commands.
- **Provider priority** (higher wins): native 100, omp-plugins 90, claude 80,
  agent-plugins 75, codex/agents/claude-plugins 70, gemini 60, opencode 55,
  cursor/windsurf 50, cline 40, github 30, vscode 20, agents-md/claude-md 10,
  mcp-json/ssh-json/managed-skills 5, builtin-defaults 1.
- **Dedup keys**: skills `name`, tools `name`, hooks `${type}:${tool}:${name}`,
  extension modules `name`, extensions `name`; **settings: no dedup** (all items kept, so
  a lower-priority provider's settings can override a higher-priority one — `§8`).
- **Overlay layer (3)**: `PI_CONFIG_FILES` (path-list) loads first, then repeated
  `--config <file>`, later winning. Overlays are process-only, **read-only/never
  persisted**, and **strict**: a missing file, invalid YAML, or non-mapping root is a hard
  error (not quarantined). Overlay path resolution is worded "active project directory"
  (config-usage) vs "process working directory" (settings.md) — assumed equivalent
  (inference). Writes (`cfgX.set`, `/settings`, `omp config set/reset`) target the
  **global** layer only, so an overlay-supplied entry never lands there.
  Live substrate use: `fleet-dispatcher.mjs` passes `--config <task.configPath>`;
  `sync-ufo-contracts.mjs` binds `config/l1-max-context.yml` (its only contract:
  `extendedContext: true`) into every L1 dispatch.
- **Consumption** (`§7`): settings (`Settings.init()`), skills
  (`loadCapability(skillCapability.id, {cwd})` with toggles/filters; legacy
  `skills.enablePiUser`/`enablePiProject` still gate the native provider), hooks
  (`discoverExtensionPaths()` appends `.ts`/`.js` hook paths), tools, extensions. Native
  project admission for commands/rules/prompts/instructions/hooks/tools/extensions/
  settings requires an existing non-empty dir; skills and `SYSTEM.md`/`RULES.md`/
  `.omp/AGENTS.md` use their own rules.
- **File ownership (doc-declared)**: `config.ts` (source priority + helpers),
  `config/config-file.ts` (`ConfigFile<T>`, `.yml/.yaml/.json/.jsonc`, tri-state
  `tryLoad`, one-shot JSON→YAML migration), `config/settings.ts` (the layer stack,
  `Settings.init()`, project deep merge, migrations, `.broken-*` quarantine, watcher
  reload, `parent.overlay()`), `config/registry.ts` (`register(...)` + typed handles),
  `config/all-settings.ts` (imports every domain's definitions in panel order),
  `discovery/builtin.ts` (native provider, priority 100; registers the priority-5
  `omp-managed` provider), `discovery/helpers.ts` (admission + `scanSkillsFromDir` +
  `parseAgentFields`).

## Relationship to `omp://settings.md`

`settings.md` owns the user-facing precedence table, the key catalog, and the `omp config`
command surface; `config-usage.md` owns the resolution architecture — roots, helpers,
`ConfigFile<T>`, the layer implementation, provider priority/dedup, native admission, and
the per-subsystem consumption map. Where they overlap they agree (overlay ordering,
quarantine, array replacement).

## Distinction from the substrate's `config/ufo.json`

`/home/vgpnk/Projects/ufo-fsd-alpha/config/ufo.json` is the **UFO orchestrator's** machine
config, consumed by the Rust runtime (`crates/ufo-core-runtime/src/config.rs`, mirrored to
`bundled/config.json`), not an OMP config file: its keys (`orchestrator`, `budgets`,
`membrane`, `sighting`, …) get **zero hits** across the whole `omp://` doc set, and no OMP
discovery root can reach it. The only interface is OMP-shaped YAML overlays the UFO
launcher passes with `--config`.

## Unverified

Implementation-file ownership is entirely doc-declared (the OMP source is not on this
host; the installed harness is the compiled binary). No `--config`/`omp config` probe was
run (invoking the harness could trigger migrations/writes). The `getConfigDirs` order
conflict cannot be settled without source.