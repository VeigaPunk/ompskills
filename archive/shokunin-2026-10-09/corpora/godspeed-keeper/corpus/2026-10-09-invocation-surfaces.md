**Asked:** which surfaces carry the `/skill:godspeed` invocation today (wave
renderer, task hook, fleet renderer, manual prepend), which of those files
actually exist on disk in the ompskills repo and in ufo-fsd-alpha, and where an
invoker must prepend it manually.

**Sources:** `/home/vgpnk/Projects/ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs`,
`…/ufo-fsd-alpha/.omp/hooks/pre/ufo-godspeed-inject.js`,
`…/ufo-fsd-alpha/scripts/fleet-dispatcher.mjs`,
`/home/vgpnk/Projects/ompskills/sighting/{l1-prompt.md,tower-fleet.mjs}`,
ompskills `.omp/` tree, `/home/vgpnk/.omp`, `/home/vgpnk/.agents/skills/`.
All re-verified on disk 2026-10-09; hashes computed this session.

## Observed

**1. Wave renderer — EXISTS only in ufo-fsd-alpha.**
`ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs`, 97,909 B, sha256
`cd8247af7e7a9dc3e9dcff08d902e05ece72479f402ac754a89c5767cc304c00`.
- `GODSPEED_INVOCATION = "/skill:godspeed"` at :160.
- Spawn-arm prepend at :1166-1168: after `laneBindingSuffix` (:1149) and
  `reportInstruction` (:1151-1153) appends, `if (!opensWithGodspeedInvocation(text))`
  → `text = \`${GODSPEED_INVOCATION}\n\n${text}\`` (:1167). Idempotence regex
  `opensWithGodspeedInvocation` :173-175 (hook-parity).
- Compact/template-hoist emission prepends unconditionally at :1182
  (`compact = \`${GODSPEED_INVOCATION}\n\n${compact}\``).
- Resume arm :1133-1146 carries NONE: "The leading invocation is NOT injected —
  a resumed lane keeps its identity and transcript" (:1145-1146).
- `checkComposedText` (64 KiB bound) runs before the envelope check
  (:1169-1171).
- ABSENT from ompskills: no `scripts/` dir, `find` for `ufo-swarm-wave*` →
  nothing. So this surface fires only when the renderer is executed against the
  substrate, not because of anything in the ompskills checkout.

**2. Task dispatch hook — EXISTS only in ufo-fsd-alpha.**
`ufo-fsd-alpha/.omp/hooks/pre/ufo-godspeed-inject.js`, 92 lines, 3,819 B,
sha256 `1588898bf99253d1bd90cfe9f4dd255400445ca56e180a75438a7dd1a2d65f2b`
(matches the card pin).
- Header :1-26 documents the operator directive, cwd-scoped discovery
  (`.omp/hooks/pre/*.{ts,js}` only; a factory in `.omp/hooks/` never discovered;
  `--config` cannot move the root), and the eval-kernel bypass ("callers must
  lead those prompts themselves", :24-26).
- Prepend bytes in `withInvocation` :54:
  `` `${GODSPEED_INVOCATION}\n\n${text}` ``; non-strings / empty /
  already-invoked pass through.
- `injectGodspeed` :65-95: batched `{context, tasks[]}` arm first (:73-86,
  copy-on-write per item, `context` untouched), flat `{task}` arm (:88-93);
  `injected === 0` returns the original input (identity-preserving no-op).
- Handler :97-104: gate `event?.toolName !== "task"` → return; returns `{input}`
  to replace the executed arguments.
- ABSENT from ompskills (`.omp/` holds only `agents/` + `skills/`; no
  `.omp/hooks`) and from `~/.omp` (dir exists, no `hooks/`). Harness-scout and
  tf-audit r2 agree: no global registration. Discovery is cwd-scoped with no
  ancestor walk → the hook fires only for OMP sessions rooted in ufo-fsd-alpha.

**3. Fleet renderer / L1 pane path — split across the two repos; the two
   "fleet" claims must not be conflated.**
- ompskills `sighting/l1-prompt.md` — EXISTS (10,877 B). The *template authors*
  the invocation: :1 `/skill:tower`, :2 `/skill:godspeed`, :3 `/skill:swarm`.
  Authored bytes, not a runtime prepend.
- ompskills `sighting/tower-fleet.mjs` — EXISTS (61,309 B). grep
  `godspeed|GODSPEED|skill:` → **zero matches**; the launcher writes the
  rendered prompt verbatim. The repo `tower` SKILL's "the fleet renderer
  prepends it" is unanchored — only template :2 supplies the line
  (tf-audit-prompt r2, AUD, confirmed again here).
- ufo-fsd-alpha `scripts/fleet-dispatcher.mjs` — EXISTS (452,778 B, sha256
  `ba5e02beac550d5635860afdb3c2d9c42e6b59938d74241807758823921e8833`). The one
  genuine substrate fleet prepend: :8708
  `` const snapshotPromptBody = `/skill:ufo\n/skill:godspeed\n\n${overlayPrefix}${promptCore}`; ``
  — every newly minted L1 snapshot opens `/skill:ufo` immediately followed by
  `/skill:godspeed` (:8703-8708 comment). Note its prepend is `/skill:ufo` +
  `/skill:godspeed` (L1 loads the ufo skill too), unlike the wave renderer's
  godspeed-only leading line.
- ufo-fsd-alpha has **no** `sighting/` directory (`ls sighting` → No such file
  or directory; `find` for `l1-prompt.md`/`tower-fleet.mjs` → nothing). The
  card's `sighting/*` anchors are ompskills paths (also present in ompskills
  tower worktrees, e.g. `.tower/worktrees/tower1/tf-safety-r2/sighting/`).

**4. Manual-prepend sites (invoker MUST lead the prompt itself):**
- Any hand-written or script-issued `task` dispatch from ompskills / this host:
  no hook on disk anywhere in the discovery roots (`ompskills/.omp` none,
  `~/.omp/hooks` none, no global registration) and cwd-scoped discovery walks no
  ancestors — the swarm SKILL's own prose (`.omp/skills/swarm/SKILL.md`:129-134)
  concedes "dispatching from a repo without it leaves the renderer as the only
  guarantee", and the renderer guarantee covers only waves composed by
  ufo-swarm-wave.mjs.
- Eval-kernel `agent()` / `workpool()` calls: host-bridge, emit no `tool_call`;
  hook header :24-26 — "NOT covered here; callers must lead those prompts
  themselves".
- Any hand-written launcher outside the two composers above.
- NOT resume lanes / `hub send`: they never carry the invocation by design
  (renderer resume arm omits it, :1145-1146; the hook only sees `task`), so
  there is nothing to prepend there — an exemption, not a prepend site.

**Resolvability side-note (kept separate, per standing rule):** when a lane
does carry the line, `skill://godspeed` resolves to the host install
`~/.agents/skills/godspeed/SKILL.md` (869 B, `1d6167238784…` — re-verified this
session); no project-scope godspeed skill exists in ompskills
(`.omp/skills` = shokunin/swarm/tower).

## Unknown

- Whether any eval-kernel caller inside ufo-fsd-alpha currently prepsends the
  invocation by hand (the hook header names the obligation but points at no
  call site); locating those callers was out of this question's scope.
- Runtime behavior of the hook under the omp build on this host was not
  exercised (read-only research); existence/hash/line-anchors are the evidence.
