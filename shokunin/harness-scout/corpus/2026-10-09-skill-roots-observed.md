# 2026-10-09 — observed skill surface of this session

Lane `SkillRootsObserved` (scribe) · milestone r1-research · axes source-fidelity, coverage.
Question: the live skill index, each name's resolution, the `skill://` read-vs-bash
distinction, and how the worktree's skills differ from the substrate's.

## Observed

Session cwd = the mission worktree. All probes read-only.

- **Index**: there is **no enumerable `skill://` endpoint** (`read skill://` → `InvalidInput`
  rc 2; `glob skill://*/SKILL.md` refused). The exposed index is the system-prompt skill
  metadata list. For this session it is exactly: `godspeed, omarchy, shokunin, swarm, tower`.
- **Resolution** (`read skill://<name>` / `readlink -f skill://<name>`):

  | name | read → file | physical |
  | --- | --- | --- |
  | godspeed | `/home/vgpnk/.agents/skills/godspeed/SKILL.md` | `/home/vgpnk/.agents/skills/godspeed` |
  | omarchy | `/home/vgpnk/.agents/skills/omarchy/SKILL.md` | `/home/vgpnk/.local/share/omarchy/default/omarchy-skill` (dir symlink) |
  | shokunin | `<worktree>/.omp/skills/shokunin/SKILL.md` | `<worktree>/.omp/skills/shokunin` |
  | swarm | `<worktree>/.omp/skills/swarm/SKILL.md` | `<worktree>/.omp/skills/swarm` |
  | tower | `<worktree>/.omp/skills/tower/SKILL.md` | `<worktree>/.omp/skills/tower` |

- **`skill://<name>` distinction confirmed**: in `read` it is the `SKILL.md`; in `bash` it
  is the skill directory (`ls -la skill://shokunin` lists dir contents, not the body);
  `readlink -f`/`realpath` print the physical path. `read skill://godspeed/directive.md`
  resolved the relative-path form. Incidentally `ls skill://<name>` emits a stderr
  `unknown io error: 'skill://<name>/..'` (the traversal guard) while still listing.
- **Roots**: global `/home/vgpnk/.agents/skills/` = {godspeed, omarchy}; worktree
  `<worktree>/.omp/skills/` = {shokunin, swarm, tower}; disjoint name sets, so no
  collision. `~/.claude/skills/` and `~/.codex/skills/` each hold an `omarchy` symlink to
  the same target but contribute nothing (their user sources default off, no
  `skills:` config key). The worktree has no `.claude/skills`, `.codex/skills`,
  `.agents/skills`, `.github/skills`, or `skills/` root.
- **Provenance**: worktree skill bodies are byte-identical to the ompskills repo root
  `.omp/skills/` — shokunin `2612bb7a…`, swarm `b4279d35…`, tower `6845c00e…`.
- **Substrate differs byte-wise**: substrate `.omp/skills/` = {swarm, tower, ufo, wwkd};
  swarm worktree `b4279d35…` (211 lines) vs substrate `1d6162bc…` (87 lines); tower
  worktree `6845c00e…` (174 lines) vs substrate `7af92fb5…` (37 lines). The substrate
  copies are the older, shorter bodies; identity (`name`, `metadata.axis_family`) matches.
  The substrate copies are **not reachable** from a worktree lane (its `.omp/skills` is
  only project-scope for a session whose cwd is the substrate).

## Inference

A lane dispatched into a worktree of this repo resolves the same five names identically:
`shokunin`/`swarm`/`tower` from that worktree's own `.omp/skills/`,
`godspeed`/`omarchy` from the global root. Native project-skill discovery is rooted at
cwd/project root; the substrate copies participate only when the substrate is the cwd.

## Unverified

Discovery ordering/dedup between the global and worktree roots (no collision, moot here);
whether the `agents` or `native` provider surfaces `.agents/skills` (no `skills:` config
key to read a binding); behavior for a different cwd (inference only).