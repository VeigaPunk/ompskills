# ufo-godspeed-inject.js — hook semantics and the tool_call protocol

**Asked:** exactly what the dispatch hook does and what it emits.
**Source:** `/home/vgpnk/Projects/ufo-fsd-alpha/.omp/hooks/pre/ufo-godspeed-inject.js` — 92 lines,
3819 B, sha256 `1588898bf99253d1bd90cfe9f4dd255400445ca56e180a75438a7dd1a2d65f2b`, git-clean at
`5ace2559`.

## Observed

- Default export only: `ufoGodspeedInject(pi)` (L82) labels `uf0 godspeed inject` (L83; lowercase `uf0`
  with a **digit zero**). Registers exactly one `pi.on("tool_call", …)` (L85); no session side effects.
  `GODSPEED_INVOCATION` / `hasInvocation` / `withInvocation` / `injectGodspeed` are module-private.
- **Gate** (L86): `if (event?.toolName !== "task") return;` — non-task is a passive no-op, never a block.
- **Shapes:** batched `Array.isArray(input.tasks)` (L59-71) is handled **first** (early return; a
  top-level `input.task` alongside is ignored), per item with `withInvocation(item.task)`, shallow copy
  `{...item, task}`, `context` untouched, never mutates the caller's objects; `injected === 0` returns the
  **original** object reference (identity preserved). Flat `typeof input.task === "string"` (L73-76) →
  `{...input, task}`; else `undefined` (no replacement).
- **Idempotence regex** `hasInvocation` (L33-36): `/^\s*<GODSPEED_INVOCATION>(?:\s|$)/u` — start-anchored,
  leading blank lines allowed, terminator required. `withInvocation` (L43-49) prepends
  `` `${GODSPEED_INVOCATION}\n\n${text}` `` (pure prefix; never appends, so a caller's terminal marker
  stays terminal); non-string / whitespace-only / already-invoked pass unchanged.
- **Return protocol** (L91): a non-blocking `tool_call` handler returning `input` replaces the arguments
  the tool executes with (raw execution input, not `event.input`); ignored when `block` is true; last-wins
  across handlers; handler throw/timeout fails closed at `toolCallTimeoutMs` (default 30000).
- **Why `pre/` not `hooks/`:** native discovery scans only `hooks/pre|post/*.{ts,js}` per root; a factory
  directly in `.omp/hooks/` is never discovered (in-tree proof: `ufo-statusline.mjs` loads only because
  `.omp/config.yml:10-11` lists it under `extensions:`). `sync-ufo-contracts.mjs:150-161`
  `requiredPreHooks` binds the path — absence is a named validation error. `pre/` loads for every session
  in that cwd regardless of `--config` (a settings overlay cannot move the discovery root).
- **No directive, no marker:** `grep -c 'directive.md'` = 0; the marker bytes appear exactly once, inside
  the header comment at L9. Emitted bytes are only the invocation prefix.

## Unknown

Whether an explicit `disabledExtensions` suppression arm is configured anywhere (unconfigured on this host).