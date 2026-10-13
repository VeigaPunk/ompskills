# load-order — Load order: four skill URIs, invocation markers vs explicit reads

Item: the `## Load order` section (`sighting/l1-prompt.md:10-33`).

Observed:
- Order: `skill://tower` (`:20`), `skill://godspeed` (`:21`), `skill://swarm` (`:22`), `skill://wwkd` (`:23`).
- Invocation markers = template lines 1-3 (`/skill:tower`, `/skill:godspeed`, `/skill:swarm`), no `{{}}`, so `renderPrompt` cannot rewrite them; the four numbered URIs are the fallback explicit reads.
- `skill://wwkd` is the only URI with no `/skill:` marker, and is best-effort: "Your worktree carries only the skills the repo tracks or the fleet spec names, so this URI may not resolve; step 1 restates the stance, so a missing URI is never a gate."
- Mechanic: `skillSourceDirs` `tower-fleet.mjs:681-687` = [`<repo>/.omp/skills`, `<ufoRoot>/.omp/skills`, `~/.agents/skills`]; `copySkill` `:690-700` first-exists wins. The shokunin fleet spec declares only `skills: ["shokunin"]`; the worktree `.omp/skills` = {shokunin, swarm, tower}. So `wwkd`/`ufo` never reach this worktree.
- `skill://ufo` optional (`:28-33`): only when the repo IS the UFO substrate; its load order expects `ssot/godspeed-core/directive.md` and fails closed without it. Observed: `read skill://wwkd` in-session → "Unknown skill; Available: godspeed, omarchy, shokunin, swarm, tower".

Evidence: `LoadOrderStance.md`.
Unknowns: none material.
