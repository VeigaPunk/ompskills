# skill resolution: two orders and one bridge

**Asked:** how `skill://<name>` and the tower-fleet skill copy resolve.
**Sources:** `sighting/tower-fleet.mjs` (684-704, 825), `omp://skills.md`, live probes from this worktree.

## Observed

- OMP resolves `skill://<name>` **only** against the startup-discovered skill list; no fallback
  search. Provider precedence (priority-first): native `.omp` user/project 100 > `skillshare` 95 >
  `omp-plugins` 90 > `claude` 80 > `agent-plugins` 75 > priority-70 group (`claude-plugins`,
  `agents`, `codex`) > `opencode` 55 > `github` 30 > `omp-managed` 5; first name wins. Layout is
  non-recursive `<skills-root>/<name>/SKILL.md`.
- Live probes (cwd = this mission worktree, 2026-10-09): `skill://shokunin` -> the worktree's own
  `.omp/skills/shokunin/SKILL.md`; `skill://godspeed` -> `/home/vgpnk/.agents/skills/godspeed/SKILL.md`;
  `skill://wwkd` -> "Unknown skill" although `wwkd` exists at `<ufoRoot>/.omp/skills/`. So **OMP
  never searches `<ufoRoot>/.omp/skills`** from a non-substrate repo.
- tower-fleet copy precedence (`skillSourceDirs` 684-690): `<repo>/.omp/skills` ->
  `<ufoRoot>/.omp/skills` -> `~/.agents/skills`; `copySkill` (692-704) takes the first directory
  that exists and `cpSync`-es it into `<worktree>/.omp/skills/<name>` (directory existence alone is
  the match, no frontmatter check). Missing skill = **warning, not abort** (825: "not found for
  mission … continuing"), persisted to `fleet.json`; launch still exits 0.
- Live receipt: `.tower/fleets/shokunin/fleet.json` records mission `skill-scribe` skill `shokunin`
  sourced from `/home/vgpnk/Projects/ompskills/.omp/skills/shokunin` — repo-first confirmed.
- Bridge fact: a copied skill lands in the native priority-100 root, so a ufoRoot or `~/.agents`
  copy OVERRIDES the live provider version for sessions in that worktree. `ufoRoot` is **copied,
  never searched** — the copy step is the only bridge by which substrate skills reach OMP.
  [INFERENCE] the repo-first rule copies from the main checkout working tree, so uncommitted repo
  edits can overwrite the worktree's git-tracked copy.

## Remaining unknown

Native user-vs-project precedence (no `~/.omp/skills` on this host); tri-source collision when
repo, ufoRoot and `~/.agents` copies differ (tower-fleet takes repo silently).
