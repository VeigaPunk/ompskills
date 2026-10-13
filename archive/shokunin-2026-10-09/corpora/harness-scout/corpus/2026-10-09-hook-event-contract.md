# 2026-10-09 — the hook factory and event contract

Lane `HookIOContract` (revenger) · milestone r1-research · axes source-fidelity, coverage.
Question: the factory signature, the event catalogue, how a hook blocks or rewrites, and
how legacy differs from current.

## Observed

Authority: `omp://skills/authoring-hooks.md`, `omp://hooks.md`,
`omp://skills/examples/safety-hook/README.md`; read-only substrate observation of
`/home/vgpnk/Projects/ufo-fsd-alpha/.omp/hooks/`.

- **Factory**: the module must default-export a **function** (not a class) receiving
  `HookAPI` (legacy subpath `@oh-my-pi/pi-coding-agent/extensibility/hooks`) or
  `ExtensionAPI` (package root). It registers handlers during factory execution; a
  returned promise is awaited. Beyond `pi.on`, it may use `pi.sendMessage`,
  `pi.appendEntry`, `pi.registerCommand`, `pi.registerMessageRenderer`, `pi.exec` +
  `pi.logger`, and builders `pi.zod`/`pi.arktype`/`pi.typebox`/`pi.pi`.
- **`pi.on(event, handler)`**: `async (event, ctx) => …`; runtime handler order is
  hooks-array order then per-hook/event registration order (deterministic); directory
  file order follows `readdir` with no extra sort.
- **Event catalogue** (docs):
  - tool: `tool_call` → `{block?, reason?, input?, additionalContext?}`;
    `tool_result` → `{content?, details?, isError?, additionalContext?}`.
  - context/agent: `context` → `{messages?}` (chained, pre-LLM); `before_agent_start`
    → `{message?}` (first returned message wins); `agent_start`/`agent_end`;
    `turn_start`/`turn_end`; `auto_compaction_start|end`, `auto_retry_start|end`,
    `ttsr_triggered`, `todo_reminder`.
  - session lifecycle: `session_start`, `session_before_switch`→`{cancel?}`,
    `session_switch`, `session_before_branch`→`{cancel?, skipConversationRestore?}`,
    `session_branch`, `session_before_compact`→`{cancel?, compaction?}`,
    `session.compacting`→`{context?, prompt?, preserveData?}`, `session_compact`,
    `session_before_tree`→`{cancel?, summary?}`, `session_tree`, `session_shutdown`.
    Branch events carry `reason ∈ {branch, fork, btw}` deciding what `entryId` means.
  - **extension-only** (require `ExtensionAPI`): `tool_execution_start|update|end`,
    `input`, `user_bash`, `user_python`.
- **Blocking / overriding**: any `tool_call` handler returning `{block:true}` stops
  execution immediately and discards collected context; a handler that **throws** also
  blocks (fail-closed); `reason` becomes the error text the LLM sees. A non-blocking
  handler may return `input` to replace the **raw** arguments (last wins; ignored when
  blocked; not applied to provider-native `computer` calls). Post-execution,
  `tool_result` patches merge **per field** (a later undefined field never erases an
  earlier value); `HookToolWrapper` ignores returned `isError` while
  `ExtensionToolWrapper` applies it. Eval-prelude calls (`browser.open`, `tab.run`,
  `computer.run`) are host-bridge calls and emit **no** `tool_call`/`tool_result`.
  `additionalContext` is trusted handler guidance kept outside the tool result,
  preserved in registration order (whitespace-insensitive repeats dropped).
- **Context rewriting**: `context` handlers are chained (each sees the previous
  output); returning nothing passes messages through.
- **Legacy vs current** (both docs): `HookAPI` and the standalone `HookRunner` are
  legacy SDK APIs; normal sessions bind discovered factories through the extension
  runner with `ExtensionAPI`, and shared events can chain differently. The legacy
  runner imposes **no `tool_call` timeout** (it may wait on UI input); the extension
  runner has separate handler-timeout/cancellation behavior. The default runtime wraps
  tools with `ExtensionToolWrapper`.
- **Discovery/install**: native scan is `<cwd>/.omp/hooks/pre|post/*.{ts,js}` (project,
  cwd-only) and `<agentDir>/hooks/pre|post/*.{ts,js}` (user); a factory directly under
  `hooks/` is **not** discovered. Example extension install:
  `cp -r . ~/.omp/agent/extensions/safety-hook` then restart, or
  `omp --extension ./safety-hook`.
- **Substrate observation**: `.omp/hooks/pre/` holds three `.js` factories
  (`ufo-godspeed-inject.js`, `primeagent-assimilation.js`, `ufo-l0-monitor.js`);
  `ufo-statusline.mjs` sits directly under `.omp/hooks/` (outside the native scan set —
  it loads only via the substrate `.omp/config.yml` `extensions:` entry).

## Unverified

`ExtensionRunner` chaining behavior for shared events beyond the docs;
profile/XDG-specific root actuals. All implementation-level claims are doc-sourced
(the doc-named `packages/coding-agent/src/extensibility/*` paths do not resolve on this
host).