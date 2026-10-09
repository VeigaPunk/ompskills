# godspeed dispatch hook: exact behavior and its real scope

**Asked:** what `.omp/hooks/pre/ufo-godspeed-inject.js` does, and whether it is installed here.
**Source:** `/home/vgpnk/Projects/ufo-fsd-alpha/.omp/hooks/pre/ufo-godspeed-inject.js` (93 lines,
3819 B) + `omp://hooks.md` / `omp://extension-loading.md`.

## Observed

- Prepends `GODSPEED_INVOCATION = "/skill:godspeed"` (:31) as `` `${invocation}\n\n${text}` ``
  (:43-48) — invocation line, blank line, prompt. No directive bytes, no `| godspeed` marker.
- Gate: `if (event?.toolName !== "task") return` (:86). Batched `{context, tasks[]}` handled on
  `Array.isArray(input.tasks)` (:60) per item (:64), copy-on-write, `context` untouched, caller
  object not mutated (:70; test :71-90). Flat `{task}` on `typeof input.task === "string"` (:73).
  An input with both arms is treated as batched only. Non-object/missing/non-string/empty task ->
  `{injected: 0}` -> `undefined` = no replacement (:88).
- Idempotency guard `hasInvocation` (:34-36): `/^\s*\/skill:godspeed(?:\s|$)/u` — start-anchored,
  leading blank lines allowed, terminator required. `"/skill:godspeedy"`, `"please /skill:godspeed"`
  and `"text\n/skill:godspeed"` are **not** invocations and still get prepended. The same regex is
  duplicated (not imported) at `ufo-swarm-wave.mjs:173-175` and `test/run-wave-test.mjs:152`.
- No env, no fs, no network; the only protocol is the in-process `tool_call` return `{input}` (:91)
  — last-wins across handlers, handlers blind to each other (`omp://hooks.md`).
- Native discovery scans only `<cwd>/.omp/hooks/pre|post/*.{ts,js}` plus user-scope
  `<agentDir>/hooks/pre|post/` — cwd-only, it does not walk ancestors. `--config` cannot retarget it.
- **Scope verified:** `/home/vgpnk/Projects/ompskills/.tower/worktrees/shokunin/skill-scribe/.omp/hooks`
  does not exist; nor does `/home/vgpnk/Projects/ompskills/.omp/hooks`, `~/.omp/hooks`, or
  `~/.omp/agent/hooks`. From this worktree the hook never loads: every `task` call leaves with
  exactly the caller's bytes; only the wave renderer (`ufo-swarm-wave.mjs:1166-1168`) enforces the
  posture. The posture still lands because `/skill:godspeed` resolves from user scope
  `/home/vgpnk/.agents/skills/godspeed/SKILL.md`. Corpus line: **injectability is cwd-scoped;
  resolvability is user-scoped — verify them separately.**
- Documentation inconsistency found: `.omp/skills/tower/SKILL.md:49-54` asserts the hook is
  "injected rather than assumed … flat and batched alike" with **no scope qualifier**, while the
  sibling `.omp/skills/swarm/SKILL.md:129-136` carries the correct qualifier ("in any session
  rooted where the hook is installed … project-scoped `<cwd>/.omp/hooks/pre/`").

## Remaining unknown

Whether the deferred "directive-prefix disjunct" fix lands; whether restricted/revived children
inheriting the parent's extension factories changes any shipped wave's observed behavior.
