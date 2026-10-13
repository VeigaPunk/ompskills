# OMP skills

Specialist agent cards, append-only specialist corpora, and the skills this
repo authors. This checkout stays the single source of truth; the two
top-level skills are exposed user-globally by symlink (2026-10-11, operator
directive — they had been repository-local and that scoping was wrong for how
they are used):

```sh
~/.agents/skills/tower     -> <this repo>/.omp/skills/tower
~/.agents/skills/shokunin  -> <this repo>/.omp/skills/shokunin
~/.agents/skills/ufo       -> <this repo>/.omp/skills/ufo
~/.agents/skills/swarm     -> <this repo>/.omp/skills/tower/swarm
```

`~/.agents/skills` is OMP's user-global skill source (the same one tower's
fleet launcher already consults), so `/skill:tower`, `/skill:shokunin`, and
`/skill:ufo` now load from any directory. Editing the skills here propagates everywhere
through the links; moving or renaming this checkout breaks them. `swarm`
stays a sub-skill of `tower` and is ALSO linked standalone (2026-10-13,
operator directive) so `/swarm` resolves directly; both entry points load the
same file. Devin CLI reads `~/.agents/skills` too, and `tower`, `swarm`, and
`ufo` carry a Devin host binding next to the OMP one (worker profiles:
`~/.config/devin/agents/ufo-<role>.md`, linked from ufo-fsd-alpha's generated
`.devin/agents/`). Shokunin
lanes are not symlinked: each lives in its own repo under the fleet root,
promoting a trained lane into OMP (`~/.omp/agent/agents/`) is operator-owned,
and Devin consults a lane through `~/.config/devin/agents/<id>-shokunin.md`.

## Consolidated skill layout

| Entry | Contract | Invocation |
| --- | --- | --- |
| [tower](.omp/skills/tower/SKILL.md) | Worktree coordination; sole parent judgment and integration | OMP `/skill:tower`; Kimi `/tower` |
| [tower → swarm](.omp/skills/tower/swarm/SKILL.md) | Session-local toggle and validated, bounded task waves | OMP `/skill:tower swarm on`, `off`, or `<task>`; Kimi `/tower.swarm on`, `off`, or `<task>` |
| [shokunin](.omp/skills/shokunin/SKILL.md) | OMP/Devin binding over the kimi-shokunin protocol: mint and train domain specialists on the learning path | OMP `/skill:shokunin`; Devin `/shokunin` |
| [ufo](.omp/skills/ufo/SKILL.md) | UFO-FSD operator surface — wall, missions, routed dispatch on the global cascade table | `/skill:ufo`, `ufo`, `/ufo` |

`tower` carries `has-sub-skill: true`. Its `swarm` child retains local frontmatter
`name: swarm`. Kimi discovers the dotted child name; OMP's native loader discovers
only top-level skills, so the parent explicitly reads `swarm/SKILL.md` relative to
its own directory before wave planning or dispatch. Reading the child does not
turn on the session toggle.

Fleet specifications select `skills: ["tower"]`, copying the entire parent bundle.
Do not request `"tower/swarm"`: the launcher's skill-name validator rejects `/`.
For future launches, replace standalone `"swarm"` selections with `"tower"`.
The fleet L1 prompt explicitly reads `.omp/skills/tower/swarm/SKILL.md`; it does
not invoke a nonexistent OMP `skill://tower.swarm` or the retired `skill://swarm`.

The 26 keeper cards and corpora minted here on 2026-10-09 are archived under
[archive/shokunin-2026-10-09/](archive/shokunin-2026-10-09/) (2026-10-13,
operator decision). `shokunin` is now a thin OMP/Devin binding over the
canonical kimi-shokunin protocol; live lanes live in the fleet root
(`~/Projects/shokunin`), one git repo per lane.

## Consolidation method — Kimi Code CLI

Use Kimi's shipped `sub-skill` workflow, not a generic merge of Markdown files:

```sh
kimi --skills-dir "$PWD/.omp/skills"
```

1. Invoke `/sub-skill.review` and explicitly restrict its inventory to this
   repository's `.omp/skills/`. Inventory names, descriptions, source scopes,
   coupling, and payload directories. Exclude user-wide skills, agent cards,
   corpora, and live `.tower/` state.
2. Select a shallow, same-domain grouping. The applied grouping is `tower → swarm`;
   `shokunin` stays independent because specialist memory is not orchestration.
   Preserve one parent judge, worktree isolation, live routing/policy authority,
   Godspeed injection and resume rules, and every child operational constraint.
3. Back up every directory to be modified before moving anything. Keep backups
   outside the scanned skill root; never overwrite one. This run preserved all
   three original skill directories under `.skills-backup-20261009-ru11wk/`.
4. Invoke `/sub-skill.consolidate` with the approved grouping and explicit write
   scope. Move the entire child directory, including references/assets/templates;
   set `has-sub-skill: true` on the parent and retain child `name`/`description`.
5. Migrate operative callers and current-source pointers in the same cutover.
   Account for the host loader: Kimi's dotted commands are not OMP skill URIs.
   Leave historical corpus entries, indexes, reports, and live fleet state intact.
6. Verify discovery, explicit child loading, rendered fleet prompts, payload
   alignment, and protected-file checksums before declaring completion.

Kimi 2.1.1's noninteractive `-p` invocation did not expand these restricted built-in
slash commands automatically. This run extracted their authored procedure from
the installed CLI binary and followed it in Kimi's review/apply session
`session_99055382-0259-47c8-801d-057a0616daf2`. Use the interactive slash commands
above for subsequent consolidations. `--auto` and `-p` cannot be combined in this
installed version.

Official references: [sub-skill commands](https://www.kimi.com/code/docs/en/kimi-code-cli/reference/slash-commands.html#built-in-skill-commands)
and [skill layout/discovery](https://www.kimi.com/code/docs/en/kimi-code-cli/customization/skills.html).

## Verification

From this repository:

```sh
omp read skill://tower
omp read .omp/skills/tower/swarm/SKILL.md:1-45
node test/tower-fleet.test.mjs
```

For Kimi discovery, start a new session with `--skills-dir "$PWD/.omp/skills"`
and load `/tower.swarm` for a read-only inspection without enabling the toggle
or dispatching a wave.

Observed for the 2026-10-09 cutover:

- Native OMP loaded the parent and explicitly read the child at its new path.
- Kimi's `Skill` tool accepted `tower.swarm`, loaded it inline from the new
  directory, and confirmed the retained `name: swarm` and validator contract.
- An actual `tower-fleet.mjs plan --json` smoke rendered the parent invocation
  and explicit child load, selected `skills: ["tower"]`, and created no fleet
  state or worktrees.
- `node test/tower-fleet.test.mjs` completed with `ALL CHECKS PASS`.
- All 758 pre-existing corpus files (732 entries and 26 indexes) matched their
  before-cutover SHA-256 checksums; the independent shokunin skill and all three
  original skill backups also matched their baseline checksums.

No routing/configuration changes, live mission launches, commits, corpus rewrites,
or compatibility aliases are part of this consolidation.
