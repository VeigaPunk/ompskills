# godspeed-injection — Godspeed injection: renderer, hook, resume

Item: the Godspeed-injection contract across `skill://swarm`, `skill://tower`, and the prompt's step 3/4.

Observed three enforcement points sharing one idempotence regex `/^\s*\/skill:godspeed(?:\s|$)/u`:
- Renderer (`ufo-swarm-wave.mjs`): leads every spawn lane; the resume branch explicitly does NOT inject and resumes leave `taskCall` entirely (`resumeSends`).
- Hook (`ufo-fsd-alpha/.omp/hooks/pre/ufo-godspeed-inject.js`, 93 lines): fires only on `task` tool calls, covers batched `{context,tasks[]}` and flat `{task}`, idempotent, project-scoped (loaded per cwd); eval-kernel `agent()`/`workpool()` bypass it and must self-prepend. Observed absence: neither this worktree nor ompskills has `.omp/hooks`, so this fleet's L1 relies on the renderer alone.
- Rule (prompt `:89-91`): never hand-write `/skill:godspeed` into the spec context or a lane prompt; a resume message must not carry it. The pane's own `/skill:godspeed` (template line 2) comes from template content.
The four posture rules are byte-identical to `ufo-fsd-alpha/.omp/ssot/godspeed-core/directive.md:1-6`.
Fidelity note: the tower SKILL misattributes the L1 injection to "the fleet renderer" (grep: `tower-fleet.mjs` has no godspeed logic).

Evidence: `GodspeedInjection.md`.
Unknowns: live renderer/hook execution; typed-refusal behavior for a hand-written invocation in spec context.
