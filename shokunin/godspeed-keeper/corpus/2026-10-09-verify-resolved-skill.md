# Verification: the resolved godspeed SKILL.md and its hash

**Asked (bounded):** independently re-verify `2026-10-09-host-skill-install.md`'s
central claim — which `SKILL.md` a lane actually resolves when it invokes
`/skill:godspeed` from this worktree, and its sha256. Bound: one question, two
hashes, one directory listing.
**Entry under test:** `2026-10-09-host-skill-install.md` (index row 7).

## Observed (2026-10-09, this worktree)

Cwd: `/home/vgpnk/Projects/ompskills/.tower/worktrees/shokunin2/godspeed-keeper`.

**Claim 1 — the harness resolves the host variant. HOLDS.** The skill loader
itself returned the host file, not the substrate copy: reading
`skill://godspeed` in this session yielded header
`[Skill file: /home/vgpnk/.agents/skills/godspeed/SKILL.md]`. That is a direct,
in-band observation of what a lane receives, independent of the entry's
empirical argument.

**Claim 2 — the two hashes. HOLDS, byte-exact.**

```
$ sha256sum /home/vgpnk/.agents/skills/godspeed/SKILL.md \
            /home/vgpnk/Projects/ufo-fsd-alpha/skills/godspeed/SKILL.md
1d6167238784245e003d0c8d38197cc25824018545e31bc81de25edb38d5f83a  /home/vgpnk/.agents/skills/godspeed/SKILL.md
c0d2232a22a07be4fd36fbabc0ce3be77af604a761d5aa207332c9f9bfaf9bb3  /home/vgpnk/Projects/ufo-fsd-alpha/skills/godspeed/SKILL.md
```

Sizes: host `869` B, substrate `1242` B — both match the card and the entry.

**Claim 3 — no project-scope godspeed skill exists. HOLDS.**

```
$ ls -la .omp/skills                       # this worktree
shokunin/  swarm/  tower/                  # no godspeed
$ ls -la /home/vgpnk/Projects/ompskills/.omp/skills   # ompskills repo root
shokunin/  swarm/  tower/                  # no godspeed
```

`godspeed` is absent from `.omp/skills` in both the repo and this worktree, so
there is no project-scope override and the host install `1d616723…` is the only
resolvable candidate. Confirms the entry's "every lane from this fleet gets the
host copy".

**Verdict:** the entry's central claim is **verified, not falsified**. Resolved
variant = `/home/vgpnk/.agents/skills/godspeed/SKILL.md`, sha256
`1d6167238784245e003d0c8d38197cc25824018545e31bc81de25edb38d5f83a` (869 B). The
substrate copy `c0d2232a22a07be4fd36fbabc0ce3be77af604a761d5aa207332c9f9bfaf9bb3`
(1242 B) is **not** what a lane from this fleet receives.

## What changed

Nothing in the substrate or the host — this was read-only confirmation. Corpus
gained this entry and one index row.

## Remaining unknown

Unchanged from the verified entry: what writes
`~/.agents/skills/godspeed` (still unreferenced by any substrate source), and
harness precedence if a project-scope godspeed skill were ever added. NOT
re-checked here (out of the assignment's bound): the inline-vs-loader shape
(`tail -n +10 | cmp`), the orphaned host `directive.md`, and the
`sync-ufo-contracts.mjs` unreachability argument.