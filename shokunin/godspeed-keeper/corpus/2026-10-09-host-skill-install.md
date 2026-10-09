# The skill a lane actually resolves: the host install

**Asked:** which `SKILL.md` a lane invoking the godspeed skill receives, and how the host copy differs.
**Source:** `/home/vgpnk/.agents/skills/godspeed/SKILL.md` (869 B, sha256
`1d6167238784245e003d0c8d38197cc25824018545e31bc81de25edb38d5f83a`) vs
`…/skills/godspeed/SKILL.md` (`c0d2232a…`).

## Observed

- **Resolution precedence proven empirically:** the harness skill header names
  `/home/vgpnk/.agents/skills/godspeed/SKILL.md` — the host variant, `1d616723…`, **not** the substrate
  `c0d2232a…`. No project-scope godspeed skill exists anywhere in the ompskills workspace or this
  worktree (`ls .omp/skills` → only `shokunin`, `swarm`, `tower`), so every lane from this fleet gets
  the host copy.
- **Host inlines instead of loading:** host SKILL.md lines 10–17 are byte-identical to `directive.md`
  (`tail -n +10 | cmp` → identical); `grep directive` in it returns zero matches. The substrate skill is
  the opposite shape — a thin loader plus the trilogy ban and the envelope-marker section, both of which
  the host copy **lacks entirely** (diff: 22 insertions / 11 deletions).
- A `directive.md` **does** exist at `/home/vgpnk/.agents/skills/godspeed/directive.md` (`db88963c…`,
  identical to ssot) but the host SKILL.md never references it — orphaned. No `godspeed-core/`, README,
  `SHA256SUMS`, or filter/velocity anywhere under `~/.agents` (top level: only `skills/{godspeed,omarchy}`).
- **Governance gap:** `sync-ufo-contracts.mjs` mirrors `directive.md` to nine repo-relative paths and
  copies only `skills/ufo` to repo-relative skill targets; `grep '\.agents|os\.homedir|/home/'` in the
  script → no matches. `~/.agents` is outside every mirror channel and no manifest pins the host
  `SKILL.md`, so `contracts:check` stays green while all real lanes run the older shape.
- Posture text itself is not yet stale (inlined rules == current ssot bytes); the drift is structural —
  future re-authoring of `directive.md` reaches the orphaned host `directive.md` at best, never the
  inlined body, and the two losing guards are exactly the trilogy ban and marker-vs-invocation semantics.
- Host mtimes (2026-10-06) are newer than the substrate's (2026-10-03) while host content is the older
  generation — host-as-pre-cutover-shape is marked [INFERENCE]; nothing in the sync path rewrote it.

## Unknown

What writes `~/.agents/skills/godspeed` (no substrate source references it); harness precedence if a
project-scope godspeed skill were ever added.