# 2026-10-09 — the extension surface

Lane `ExtensionsSurface` (scout) · milestone r1-research · axes source-fidelity, coverage.
Question: what an extension is, how modules are discovered and loaded, and how extensions
relate to hooks, skills and tools.

## Observed

Authority: `omp://extensions.md` (read in full), `omp://extension-loading.md`,
`omp://skills/authoring-extensions.md`, with corroborating reads of `hooks.md`,
`task-agent-discovery.md`, `skills.md`, `slash-command-internals.md`,
`plugin-manager-installer-plumbing.md`, `config-usage.md`. **The coding-agent source is not
on this machine** — every implementation path is doc-declared, not source-read.

- **What an extension is**: a TS/JS module default-exporting a factory receiving
  `ExtensionAPI`; it may initialize synchronously or return a promise. One module can
  combine event handlers (`pi.on`), tools (`pi.registerTool`), slash commands
  (`pi.registerCommand`), shortcuts/flags, message renderers, and injection APIs.
- **Discovery → ordered entry list** (`discoverAndLoadExtensions()`): (1) native
  auto-discovered extension modules, (2) discovered JS/TS hook factories, (3) installed
  plugin extension entries (`getAllPluginExtensionPaths(cwd)`), (4) explicit configured
  paths (CLI `--extension`/`-e` and `--hook`, then the settings `extensions` array).
  Dedup is by **absolute path, first seen wins** (no realpath normalization). Ambient
  extension-module discovery is **filtered to the native provider only**.
- **Native roots**: project `<cwd>/.omp/extensions` (cwd-only, no ancestor walk); user
  `<agentDir>/extensions` (default `~/.omp/agent/extensions`; profile- and
  `PI_CODING_AGENT_DIR`-aware); legacy `<cwd>/.omp/settings.json#extensions` and the
  agent-dir `settings.json#extensions`. `.pi/extensions` is not a native root.
- **Load mechanics**: modules are imported **concurrently with Bun**; factories are bound
  **sequentially in path order** — so top-level module side effects have no path-order
  guarantee. Per path, the realpath is resolved and dynamically imported with a per-load
  `?mtime` cache-buster (POSIX path specifiers propagate through extension-owned relative
  imports; Windows `file://` query strings are ignored so the reload guarantee does not
  apply there). A scoped Bun `onLoad` rewrites legacy pi-package specifiers and
  `@sinclair/typebox`. The factory is `getExtensionFactory(module)` = the module itself if a
  function, else `module.default`; it must be a function, may return `void` or a promise,
  and is awaited before the next path.
- **Returns**: loaded extension definitions; per-path `{path, error}` without aborting other
  loads; a **shared extension runtime object** used by `ExtensionRunner`; and prepared
  factories rebindable without re-evaluating the module graph.
- **Isolation**: per-path import/factory failures are captured and a failed factory's
  pending provider-registration queue is rolled back; discovery enumeration errors are
  **not** covered. Imports/file-backed factories run under `withHostGuard()` (a load-time
  `process.exit` throws `ExtensionExitError`; stdin/raw-input state is restored). Extensions
  are **not sandboxed** — one `EventBus`, one `ExtensionRuntime`. Handler exceptions are
  caught and emitted as extension errors; most handlers get a 30 s budget,
  `session_shutdown` 2 s concurrent, and `tool_call` uses
  `extensionHandlers.toolCallTimeoutMs` (default 30000) and **fails closed**.
- **Suffix split**: auto-scanned native/configured directories discover `.ts`/`.js` only;
  explicitly named files and installed-plugin manifest entries may also use `.mjs`/`.cjs`.
  A manifest directory entry resolves `index.{ts,js,mjs,cjs}`; plugin-directory expansion
  skips `*.d.{ts,mts,cts}`.
- **Gates**: `--no-extensions`/`disableExtensionDiscovery` excludes ambient factories while
  explicit paths still resolve; `disabledExtensions` filters by id
  `extension-module:<derivedName>` (an explicitly configured file path bypasses it; the
  `hook` capability applies its own hook-specific disabled ids). Live changes to
  `extensions`/`disabledExtensions` suspend or resume already-loaded sources (modules are not
  unloaded; newly enabled modules need a restart).
- **Shared surface with hooks**: `--hook` is an alias for `--extension`; discovered JS/TS
  hook factories load as extension modules so `pi.on(...)` binds to the runtime event bus;
  tools are wrapped by `ExtensionToolWrapper`; a discovered factory receives
  `ExtensionAPI`/`ExtensionContext`, **not** `HookAPI`/`HookContext` (legacy context names
  are not shimmed). Shared event names do not imply identical result chaining.
- **Contributing skills/agents/hooks/tools**: an extension **package** carries sibling
  capability directories, and the `omp-plugins` provider (priority 90) scans its `skills/`,
  `hooks/pre|post/`, `tools/`, `commands/`, `rules/`, `prompts/`, and `.mcp.json`.

## Unverified

The docs cite `packages/coding-agent/src/...` paths that do not exist on this filesystem
(`omp` is a compiled binary; the substrate has no coding-agent tree), so no LSP could
answer and no code-level claim was verified. Live source changes and runtime behavior were
not exercised.