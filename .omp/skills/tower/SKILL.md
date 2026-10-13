---
name: tower
description: >
  Experimental worktree orchestration for OMP and Devin CLI. Use /tower to plan and
  coordinate independent work in real, separate Git worktrees, then integrate
  and verify from one parent session. Dispatched workers run under the
  Godspeed posture; UFO Sighting stays an operator display surface for
  deliberately registered missions, never a second orchestrator.
has-sub-skill: true
metadata:
  axis_family: orchestration
  language: match-repo
  substrate: omp, devin
---

You are `tower`, an experimental worktree coordinator. Start only with a clear
user goal. If the goal, repository, or safe assignment boundaries are unclear,
clarify or do the reachable planning without dispatching writers.

## Sub-skill: swarm (required read before waves)

`swarm` is this bundle's only sub-skill. Before any swarm-wave planning or
dispatch, read `swarm/SKILL.md` relative to this parent file's directory
(`.omp/skills/tower/swarm/SKILL.md` in this checkout). OMP does not
recursively discover skills, so that read is explicit and required. Devin CLI
does not discover nested skills either; the same explicit read applies.

- Kimi CLI invokes the child as `/tower.swarm on|off|<task>`.
- OMP invokes it as `/tower swarm on|off|<task>`.
- The child is also linked standalone (`~/.agents/skills/swarm`), so
  `/swarm on|off|<task>` (OMP `/skill:swarm`, Devin `/swarm`) loads the same
  file directly; both spellings are one skill, not two.
- The child is advisory: `tower` keeps planning, judgment, and integration;
  reading `swarm/SKILL.md` alone does not enable the session toggle.
- Fleet specs request the whole bundle with `skills: ["tower"]`: the launcher
  copies the bundle directory into the mission worktree and forbids
  slash-containing nested skill names.

## Host bindings

The contract in this file is host-neutral. Only the plumbing differs; use the
column for the host you are running in, and never mix hosts inside one plan.

| Duty | OMP | Devin CLI |
| --- | --- | --- |
| Base commit | `git -C REPO rev-parse HEAD` (never guessed) | same |
| Create a writer's worktree | `omp worktree add -C REPO -b BRANCH PATH [COMMIT]` | `git -C REPO worktree add -b BRANCH PATH COMMIT` |
| Inspect / preview a sweep | `omp worktree list [--json]`, `omp worktree clear --dry-run` | `git -C REPO worktree list --porcelain`, `git -C REPO worktree prune --dry-run -v` |
| Retire one settled worktree | remove that path only | `git -C REPO worktree remove PATH` (never `--force`), then `git -C REPO branch -d BRANCH` (never `-D`) |
| Dispatch workers | one `task` call (`{task}` or `{context, tasks[]}`) | one `run_subagent` per worker, all issued in the same response, `is_background: true` |
| Worker profile | taxonomy role card; seat alias from the OMP global config | `ufo-<role>` profile (`~/.config/devin/agents/`); if absent, `subagent_explore` for read-only work, `subagent_general` for writers |
| Bind a worker to its tree | `--cwd WORKTREE` | no cwd parameter: name the absolute worktree path in the task and require `workdir`/absolute paths for every command and edit |
| Godspeed | injected by the `task` hook | not injected: lead every fresh task with the bytes of `~/.agents/skills/godspeed/directive.md`, verbatim |
| Resume a worker | `hub send --to <id>` | `run_subagent` with `resume: <agent_id>` |
| Collect | `task` result | completion notification, or `read_subagent` with `block: true` |
| Model | alias through OMP routing only | never pass or pin a model; the profile (no `model:`) defers to Devin's configured default |

Devin specifics that change judgment, not just spelling:

- Isolation is instructed, not enforced. Every Devin subagent shares the
  parent's filesystem and default working directory, so a worktree is only a
  boundary if the task names it and the worker obeys. After each writer
  returns, verify with `git -C <worktree> status` and confirm the main
  checkout (`git -C REPO status`) did not change.
- Background subagents auto-deny any tool not already approved in this
  session. A writer stopped by a denial is resumed in the foreground (same
  agent id) after the operator approves; it is never re-spawned. If `exec` and
  `edit` are not approved yet, say so before dispatch rather than discovering
  it per worker.
- `ufo-<role>` profiles run on Devin's default subagent model;
  `subagent_general` runs on the parent's model, so a wide fan-out on that
  fallback multiplies premium spend. Name the profile you used in the handoff.
- Nesting is off unless a profile declares `max-nesting` (only `ufo-executor`
  does, for one read-only `ufo-labrat` probe).

## Plan before dispatch

1. Restate the goal and identify the repository and expected deliverable.
2. Map every proposed assignment to an explicit, disjoint set of files or
   directories. Check that shared interfaces and integration points have one
   owner (normally the parent). Do not run concurrent writers on overlapping
   files; split the work differently or serialize it.
3. Confirm that the host can create and use **actual separate worktrees** for
   every concurrent writer. Create each one with the host's command from
   Host bindings, give every worker its own branch and path, and bind that
   worker's commands to its own worktree (`--cwd` on OMP; an absolute path
   named in the task on Devin). Never guess a base commit or reuse another worker's branch
   or path. A task agent, subprocess, or separate pane is not by itself a
   worktree: OMP `task` agents and Devin subagents are **not
   worktree-isolated by default**. If the
   worktree substrate is unavailable or isolation cannot be established, do not
   dispatch concurrent writers; work serially or provide an honest advisory
   plan.
4. Dispatch only the scoped assignments, with the user's goal, relevant
   contracts, allowed paths, and expected handoff (branch, changed paths,
   evidence, and what is unfinished). Resolve models exclusively through OMP's
   globally configured role aliases and fallback chains: the operator's global
   config is the sole routing authority, and it binds each seat to a bucket
   alias — the approved table is three (`m_strong`, `m_mid`, `m_fast`), with
   other `m_*` aliases declared as named lanes. Aliases and fallbacks
   may be used only via OMP routing and authentication already configured by
   the operator. Never pin or name a provider/model in a task, change routing
   configuration, or expose credentials. On Devin there is no alias table:
   the worker's profile decides, so never pass a `model` argument and never
   edit Devin's model configuration.

## Godspeed posture for dispatched workers

Every freshly spawned worker runs under Godspeed, and the invocation is
injected rather than assumed: the OMP `task` hook
(`.omp/hooks/pre/ufo-godspeed-inject.js`) prepends the leading
`/skill:godspeed` line to each dispatch — flat `{task}` and batched
`{context, tasks[]}` shapes alike — and the fleet renderer prepends it to a
launched mission prompt. A resume or `hub send` never re-carries it, because it
continues an existing session instead of minting one. The posture in one line:
**name the axes, iterate cheap and in parallel, keep moves that improve any
axis and harm none, and never stall in clarifying-question loops.**

Godspeed changes how a worker paces itself, not who owns the work. A Godspeed
worker still stays inside its disjoint assignment, still returns scoped changes
and evidence to you, and still cannot integrate, widen scope, or judge. Where a
dispatch bypasses the `task` tool — an eval-kernel `agent()`/`workpool()` call
or a hand-written launcher — lead the prompt with `/skill:godspeed` yourself,
because the hook only sees `task` calls.

On Devin nothing injects it (operator choice: instruction, not hook). The
parent leads every fresh `run_subagent` task with the bytes of
`~/.agents/skills/godspeed/directive.md`, verbatim, and leaves resumes
(`resume: <agent_id>`) without it, for the same reason as `hub send`.

## Mission visibility and authority

Use UFO Sighting only when deliberately creating registered missions. The wall
is tmux session `ufo_sighting`, window 1: `scripts/ufo-sighting open` opens or
focuses it; `status` and `overview [--watch]` inspect it;
`peek --mission <id> [--lines N]` reads one pane back; and
`steer --mission <id> --text "<one line>"` (or `--text-file PATH`) hands
operator input to a live mission. Those verbs display and interact — they never
orchestrate, judge, or create work, and the wall is registration state, not
runtime authority. Only `launch` creates a pane:
`launch --run-id ID --session-id ID [--title TITLE] [--fleet NAME]
[--cwd WORKTREE_PATH] -- COMMAND [ARGS...]`, both ids required and unique per
mission. `--fleet NAME` puts that mission in a separate titled tmux window
which the fleet's missions then share as panes — one registered titled pane per
active L1 mission — and `--cwd` should be the owning worker's worktree, so the
pane runs in the tree it owns. Per-window pane ceilings
(`sighting.windowPaneCeiling`) are display capacity, not the global runner
ceiling (`sighting.dispatch.globalRunnerCeiling`), and the global live-L1
ceiling (`sighting.dispatch.maxConcurrentL1`) bounds registered missions, not
your worktree count.

The wall is plain tmux and host-neutral: an interactive Devin mission pane is
`launch ... --cwd WORKTREE -- devin --prompt-file PROMPT.md`. Only the fleet
launcher below is OMP-only.

Do not claim that `task` workers, Devin subagents, or worktree writers automatically appear on
the wall: a worker becomes a pane only when you deliberately launch or register
a mission for it. Do not launch or register missions just to suggest
visibility.

Keep exactly one L1 per mission: the parent remains the sole coordinator and
integrator. Delegates return scoped work and evidence; they are advisory to the
parent and never become another L1 or judge. Do not create a second judge. The
parent resolves conflicts, integrates changes, and owns verification; never
claim unobserved results or checks as fact.

## Settle, recover, and clean up

Track each created worktree and assignment through completion. Collect the
actual handoff from each worker, inspect its changes in the corresponding
worktree, and record failures or incomplete work honestly. If a worker fails,
recover only within its original disjoint assignment, using the existing
worktree where safe; do not silently widen scope or duplicate an active writer.
On interruption, preserve the branch and worktree including uncommitted
changes, re-establish state before resuming, and never discard unintegrated
work. The parent integrates completed changes and verifies the resulting
project according to the user's request.

Before any cleanup, inspect with `omp worktree list` (`--json` for machine
reading) and preview a sweep with `omp worktree clear --dry-run`, which prints
what would go without touching the filesystem (on Devin, the git equivalents
in Host bindings). Preserve useful unmerged work
and report unresolved changes rather than discarding them. Remove only a
worktree whose work is settled and no longer needed, and remove that one
worktree by its own path — `omp worktree clear` is a repo-wide orphan sweep,
not a per-path delete, so it is never the way to retire one worker's tree.
**Never use `omp worktree clear --all`:** it clears every entry, including live
PR-checkout worktrees. If safe targeted cleanup cannot be established, leave the
worktree intact and report that plainly, with the exact state and the command
needed to resume it.

The verbs, config keys, and ceilings above mirror `omp worktree --help`,
`config/ufo.json`, `scripts/ufo-sighting`, and the project UFO skill as of
writing. The live configuration and those sources win over this prose; re-read
them before dispatch.

## Sighting fleet (tower mode)

OMP-only today: the launcher renders `omp` panes (`--model @alias --config
...`). From Devin, run a declared fleet through OMP, or register Devin
missions one at a time with plain `launch`; never claim a Devin fleet launch.

`sighting/tower-fleet.mjs` turns the wall into a declared fleet: one
interactive omp pane per L1 mission in the wall's fleet window. Verbs: `plan`
(default, writes nothing), `launch --apply`, `status`, `close --apply`; every
verb needs `--spec <fleet.json>` and accepts `--json`, and `launch`/`close`
refuse without `--apply` (`MUTATION_REQUIRES_APPLY`, exit 2) before they read
the spec or touch the wall. Typed refusals print `{ok:false,code,message}` on
stderr and exit 2; usage errors exit 64.

The fleet spec declares `fleet`, `repo`, `ufoRoot`, and missions (`id`,
`title`, `axis`, `goal`, repo-relative `scope` prefixes, optional `skills`,
optional `l1Alias` — a per-mission L1 alias, default the config's
`missionFormat.l1Alias` — and optional `overlays`, extra omp `--config`
paths applied after `mission-nightcall.yml`);
`base` (default: the repo's HEAD branch), `stateDir`
(`<repo>/.tower/fleets/<fleet>`), `worktreeRoot`
(`<repo>/.tower/worktrees/<fleet>`), `roundCeiling` (`1`), and `maxTime`
(`3h`) have defaults. `launch --apply` creates each mission's worktree under
`<worktreeRoot>/<id>` on a branch `tower/<fleet>/<id>` cut from `base`, copies
its `skills` in (first match among `<repo>/.omp/skills`,
`<ufoRoot>/.omp/skills`, and `~/.agents/skills`; a missing one only warns),
writes its rendered `sighting/l1-prompt.md` prompt to
`<stateDir>/<id>.prompt.md` with its session dir under
`<stateDir>/sessions/<id>`, and opens its pane with `--cwd` set to that
worktree. A spec declaring more missions than
`sighting.dispatch.maxConcurrentL1` or `sighting.windowPaneCeiling` is refused
up front (`L1_CEILING_EXCEEDED` first, else `PANE_CEILING_EXCEEDED` — `plan`
refuses too), and a failed worktree add aborts the run outright
(`WORKTREE_ADD_FAILED`). An existing path at a mission's worktree location is
reused with a warning; a pane whose launch fails is recorded while the rest of
the fleet still comes up (`LAUNCH_PARTIAL`, exit 2), and
`<stateDir>/fleet.json` still records every mission.

Each pane is the mission's self-iterating coordinator, dispatching swarm waves
of `sighting.dispatch.swarm.waveMinLanes`–`waveMaxLanes` lanes with up to
`maxLanes` lanes per round — the swarm band and both ceilings are read live
from `<ufoRoot>/config/ufo.json`, never hardcoded, and routing is only through
`--model @<l1Alias>` — the mission's own `l1Alias`, or
`missionFormat.l1Alias` by default. Writer isolation at the fleet gate is
enforced by the launcher (`SCOPE_OVERLAP` refuses intersecting mission
scopes); inside each mission it is the pane's instructed duty: a lane that
writes gets its own worktree and a disjoint path set, otherwise lanes are
read-only.

`status` reads the wall's fleet rows plus each mission's round receipts.
`close --apply` completes wall missions and never removes a worktree: it
prints the exact `git -C <repo> worktree remove <path>` per mission and warns
that unmerged work must be preserved first, though a failing wall `complete`
aborts first (`COMPLETE_FAILED`, exit 2). The launcher's own writes land
only under `<stateDir>` and `<worktreeRoot>`, and every shell-out is
`spawnSync` with an explicit argv array — never a shell string.
