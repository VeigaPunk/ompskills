# 2026-10-09 — the hook subsystem as the harness documents it

Lane `HooksSubsystem` (scout) · milestone r1-research · axes source-fidelity, coverage.
Question: the current runtime status of hooks, which parts are legacy, and the factory
and discovery shapes.

## Observed

Authority: `omp://hooks.md` ("the current hook subsystem code in
`packages/coding-agent/src/extensibility/hooks/*`"), corroborated by
`omp://extension-loading.md` and `omp://skills/authoring-hooks.md`, plus symbol strings
recovered from `/home/vgpnk/.local/bin/omp`.

- **Current runtime status.** The default CLI runtime initializes the **extension
  runner** path: `--hook` is an alias for `--extension` (both merged into
  `additionalExtensionPaths`); JS/TS hook factories discovered through `hookCapability`
  (e.g. `.omp/hooks/pre/*.ts`) load as **extension modules** so their `pi.on(...)`
  handlers bind to the runtime event bus; tools are wrapped by `ExtensionToolWrapper`,
  not `HookToolWrapper`; context transforms and lifecycle emissions go through
  `ExtensionRunner`. A discovered factory receives `ExtensionAPI`/`ExtensionContext`,
  **not** `HookAPI`/`HookContext`; shared `pi.on` handlers work but legacy-only context
  names are not shimmed (`ctx.hasQueuedMessages()` → `ctx.hasPendingMessages()`).
- **Legacy-marked** (per hooks.md): the whole types/loader/runner/wrapper impl,
  `HookAPI`/`HookContext`, `hasQueuedMessages`, `HookRunner`, `HookToolWrapper`,
  `discoverAndLoadHooks`+`loadHooks`, `pi.typebox`, and `HookAPI` not re-exported from
  the package root. Key files listed: `hooks/{types,loader,runner,tool-wrapper,index}.ts`
  plus `extensibility/shared-events.ts`, `extensions/loader.ts`, `extensions/wrapper.ts`.
- **Factory shape.** A hook module must default-export a factory function; the loader
  selects `getExtensionFactory(module)` = the module itself if a function, else
  `module.default`; the factory must be a function and may return `void` or a promise
  (awaited before the next path). So `.omp/hooks/pre/foo.ts` may legally take either
  `HookAPI` or `ExtensionAPI` — the loader only cares that the default export is a function.
- **Discovery order** (`discoverExtensionPaths`): native provider modules → importable
  `.ts`/`.js` hook factories from the hook capability (unless `includeAmbientHooks:false`)
  → enabled plugin entry points → explicitly configured paths. Dedup by absolute path.
- **Native hook scan location (common trap)**: only `<cwd>/.omp/hooks/pre/*.{ts,js}` and
  `<cwd>/.omp/hooks/post/*.{ts,js}` (project), plus `<agentDir>/hooks/pre|post/*.{ts,js}`
  (user). A factory directly under `.omp/hooks/` is **not** discovered; non-files and
  dot-entries are skipped; `.ts`/`.js` only from the hook capability.
- **Binary corroboration** (symbols present): `ExtensionToolWrapper`, `HookToolWrapper`,
  `HookRunner`, `discoverAndLoadHooks`, `loadHooks`, `hookCapability`,
  `additionalExtensionPaths`, `disabledExtensionIds`, `enabledProviders`,
  `includeAmbientHooks`, `hasQueuedMessages`/`hasPendingMessages`, `registerMessageRenderer`,
  the CLI set `new Set(["--extension","-e","--hook","--trusted-extension"])`, and the
  runtime string `Invalid type (must be 'pre' or 'post')`. The `.omp/hooks` literal path
  was not found (likely composed from constants).

## Unverified

No raw TypeScript for `packages/coding-agent/src/extensibility/hooks/*` is readable on
this host (the worktree is a skills repo; the substrate has no coding-agent tree), so
internal behavior is doc-asserted with binary symbol presence as the only corroboration.
No runtime probe was run; merge/timeout semantics rest on hooks.md alone. The native
`.omp/hooks/pre|post` scan paths are doc-asserted; the binary exposed only the
`Invalid type` string.