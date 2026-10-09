---
name: swarm
description: >
  Kimi-style swarm toggle and bounded parallel task waves for OMP. Uses the
  repository wave validator, one batched task call per wave, and global OMP
  role routing; never mutates routing configuration or turns child tasks into
  UFO Sighting missions.
metadata:
  axis_family: orchestration
  language: match-repo
  substrate: omp
---

# `/swarm` — OMP session mode and task waves

Invoke as `/skill:swarm`, `/swarm on`, `/swarm off`, or `/swarm <task>`.

## Session toggle

- `/swarm on` enables swarm-wave behavior for this conversation only; confirm
  the session state. `/swarm off` disables it and confirm. This is
  conversational state only: do not write OMP configuration or claim a
  persistent toggle API. The toggle never makes a wave the orchestrator — a
  wave stays a dispatch shape for independent, unjudged work, not a session
  mode with authority over the parent.
- When enabled, consider a validated wave for a large set of independent,
  similarly shaped, unjudged tasks with disjoint ownership. It is not a general
  replacement for ordinary `task` delegation. Use normal delegation for a small
  set, one-off task, overlapping edits, work requiring one shared writer, or any
  request that cannot meet the wave validator's shape and bounds. Never split a
  wave into several `task` calls to evade a refusal.
- `/swarm <task>` requests one wave attempt; `/skill:swarm` without a task
  explains the toggle and asks for an actionable task specification. Never
  manufacture work or split one user's task into artificial lanes merely to hit
  the minimum. Size to the work inside the band: N same-shape items are one wave
  of N when the band admits N, sequential waves of at most the ceiling when N
  exceeds it (fold a short tail into the previous wave), and direct execution
  when N falls under the floor — padding to the floor is forbidden.

## Validate, then dispatch exactly once

1. Declare a spec with distinct per-item prompts or a template containing
   `{{item}}`; use a saved spec, stdin, or inline JSON. Validate it with
   `node scripts/ufo-swarm-wave.mjs plan --spec-json '<JSON>'` (or `--spec PATH`
   / `--spec -` for a file/stdin), which emits the plan without dispatching, and
   render the dispatch payload with `run` on the same spec arguments.
   `record --registry <path> --assignments <json>` fills in agent ids once the
   task call returns them. Do not dispatch if validation refuses the spec.
2. Read the `ufo-swarm-wave-dispatch-v1` result. Make **one** OMP `task` tool
   call using its `taskCall.context` and complete `taskCall.tasks` array as-is.
   If `taskCall` is `null`, there are no new spawn tasks: send each
   `resumeSends` entry to its recorded parked agent as
   `hub send --to <entry.resume> --message <entry.message>` — `entry.name` is
   bookkeeping, not a hub field. Resume is continuity to an existing agent, not
   a fresh spawn or a second wave. Each `taskCall.tasks` entry is exactly
   `{name, agent, task}` — `agent` is the lane's taxonomy role, `task` its
   composed text, and there is no per-lane model key. Do not invent, omit, or
   rewrite lanes, roles, bindings, or resumes after validation.
3. Integrate and report only observed results. Workers advise the parent; keep
   one L1, no second judge, honest evidence, and no concurrent overlapping-file
   assignments. Wave output is advisory: no lane becomes a judge verdict.

The validator is normative. The configured wave band is **16–32 total members**
(spawn lanes plus resumes counted together) **per wave**, from
`sighting.dispatch.swarm.waveMinLanes`/`waveMaxLanes`; the per-L1 member
ceiling `swarm.maxLanes` is **100** — the round budget that sequential waves of
one round share, and the cap the validator enforces on any single wave — and a
per-spec `maxLanes` may only tighten it, never widen it. `swarm.minLanes` **16**
is the declared swarm-round floor — policy, not a planner gate; what the
planner gates is the wave band, and in a band-less policy the built-in minimum
is **2**. Both wave-band gates fire only on spawn-bearing waves, so a
resume-only wave is exempt from the wave floor *and* the wave ceiling and is
bounded only by the member cap; a spec cap below the floor makes a spawn wave
unreachable and fails before any lane spawns. Items must expand to
pairwise-distinct prompts; a duplicate expansion is a refusal, never a silent
dedupe. Refusals are typed, and this list is not their full set:
wave/band `empty_wave`, `too_few_lanes`, `wave_too_wide`, `too_many_lanes`,
`impossible_band`; lane/spec shape `duplicate_expansion`, `duplicate_name`,
`role_required`, `unknown_role`, `invalid_spec`, `invalid_policy`,
`invalid_registry`; resume `resume_unknown_member`, `duplicate_resume_id`,
`resume_role_forbidden`, `resume_item_forbidden`, `resume_meta_forbidden`,
`message_with_prompt`; and (with route preflight enabled)
`route_unreachable` — all raised by `plan`/`run` before a lane spawns; after
the task call returns ids, `record` adds `conflicting_assignment`,
`unknown_member` and `invalid_agent_id` plus the registry/assignment-shape
refusals (`invalid_registry`, `invalid_registry_path`, `invalid_assignments`).
A refusal is a reason to fix the spec or execute the work directly, never a
reason to bypass validation.

Each new spawn carries one explicit taxonomy role: `scout`, `reviewer`,
`critic`, `connector`, `sentinel`, `executor`, `mutation-tester`, `revenger`,
`simplifier`, or `scribe`. Do not include frozen-topology seats (planner,
distiller, labrat, Main) as swarm roles. A spawn item may declare `axes` (1–8
distinct nonempty names, ≤256 bytes each) and a short `milestone`; spec-level
values are defaults, item-level wins, and a resume lane inherits the spawn
binding rather than supplying its own.

Resume assignments must name an owned member from the wave registry or the
spec's declared `priorRegistry`; unknown ids fail closed as
`resume_unknown_member` before any lane spawns, while conflicting handles fail
closed at `record`, after the task call returns ids. Keep and use the
validator's registry and dispatch output for continuity — the registry records
each spawn member's name, agent id, item and role; a resume row names its owner
and inherits that binding, with its own `agentId` deliberately null so the
original spawn row stays the handle's sole owner. That is what lets a later wave
resume a member by its recorded agent id across turns. A resumed agent retains
its existing identity and role; do not assign it a new role or a replacement
agent. OMP's one `task` call is the wave, so kimi's 5-per-700ms launch ramp
needs no porting: the harness queues lanes beyond its own concurrency window,
and the ramp constants are recorded in the plan as declared pacing policy
only.

## Lane shape: leaf by default

A swarm member is a leaf — no delegation and no background jobs. Omit the
`spawns:` key entirely for a leaf; `spawns: []` is a footgun, not the leaf
spelling, because an empty list collapses to undefined and yields a wildcard
when `task` is in the lane's tools. `agents/executor.md` is the one card that
permits a spawn (`labrat`), and the host's `task.maxRecursionDepth` (**2**) is
what bounds that chain. The host's `task.maxConcurrency` (**32**) is a separate
cap on lanes running at once; it is not the wave band and not the member
ceiling — the host cap bounds how many lanes run at once, never how wide one
wave may be; the later waves of a full round are dispatched after the earlier
waves, and a wave never relies on the harness concurrency queue to hold its
lanes.

## Godspeed posture

Every fresh spawn lane carries `/skill:godspeed` as its leading line: the wave
renderer injects it, and — in any session rooted where the hook is installed —
the OMP `task` hook (`.omp/hooks/pre/ufo-godspeed-inject.js`) enforces it for
every `task` dispatch, batched or flat, idempotently. The hook is
project-scoped (`<cwd>/.omp/hooks/pre/`), so dispatching from a repo without it
leaves the renderer as the only guarantee, and eval-kernel `agent()`/
`workpool()` spawns bypass the `task` tool entirely and must prepend the
invocation themselves. Resume `hub send` entries never carry
it — a resume continues an existing session, and a stacked invocation would
reach a lane twice. The posture in one line: **name the axes, iterate cheap and
in parallel, keep moves that improve any axis and harm none, and never stall in
clarifying-question loops.** It governs how a lane works inside its own item; it
does not widen the lane's scope, let it judge, or let it spawn.

## Routing and observation

- The taxonomy role selects its `@m_*`/role alias bucket through the operator's
  bound global OMP `~/.omp/agent/config.yml` (`task.agentModelOverrides`,
  `modelRoles`, and `retry.fallbackChains`); it binds each seat to a bucket
  alias — the approved table is three (`m_strong`, `m_mid`, `m_fast`), with
  other `m_*` aliases declared as named lanes, and the live table rather than
  this file decides the binding. Any alias and ordered fallback chain may be
  used **only through OMP routing and authentication already configured by the
  operator**. The global config is the sole routing/auth authority. Never
  hardcode a provider/model, credentials, or a per-lane model param — there is
  no per-lane model knob. Opt-in route preflight (`--route-families`, on `plan`
  and `run`) flags a wave whose pinned lanes resolve into one route family
  carrying more than one lane as `singleFamily` (roles with no seat override
  are reported unpinned and never attributed), so you can split it or record the
  accepted risk; never edit or override global routing from this skill.
- Use `scripts/ufo-sighting open` to open the operator wall (tmux session
  `ufo_sighting`, window 1); `status [--lite]` and `overview [--watch]` to
  inspect it; `peek --mission <id> [--lines N]` to read a pane back;
  `steer --mission <id> --text "<one line>"` to send operator input; and
  `complete --mission <id> [--note <text>]` to retire a registered mission.
  These are UFO Sighting display and interaction controls for registered
  missions, not swarm orchestration: the wall itself never dispatches, judges,
  or owns a wave. A `task` worker or swarm lane is **not** automatically a wall
  mission or titled pane.
- `launch … --fleet NAME ... -- <command>` opens a separate tmux window named
  after that fleet inside the session, one pane per registered mission — use
  `--fleet` for the registered fleet missions a launcher actually starts, and
  do not claim it exposes task workers.
- A registered fleet mission is the one wall mission that does dispatch and
  judge: `sighting/tower-fleet.mjs <verb> --spec <fleet.json>` renders
  `sighting/l1-prompt.md` into a fleet L1 pane that runs its own swarm waves.
  The verb is positional and comes first — omitting it selects `plan` (which
  writes nothing) — and the others are `launch --apply`, `status`, and `close
  --apply [--mission <id>]`. A mutation verb without `--apply` refuses with
  typed `MUTATION_REQUIRES_APPLY` before touching the wall or the filesystem,
  and every refusal is a typed `{ok:false, code, message}` envelope (exit 2;
  usage exit 64). Most of them — `INVALID_SPEC`, `L1_CEILING_EXCEEDED`,
  `PANE_CEILING_EXCEEDED`, `SCOPE_OVERLAP`, `UNKNOWN_MISSION` and the rest —
  are raised before any mutation; the exception is `LAUNCH_PARTIAL`, which
  exits 2 after panes and state were already written. Each mission gets its own
  worktree at `<repo>/.tower/worktrees/<fleet>/<id>` on branch
  `tower/<fleet>/<id>`, reused rather than clobbered, and comes up as one
  interactive omp pane — `-p`/`--print`/`--mode` are refused by
  `INTERACTIVE_GUARD`, and the pane's argv keeps `--cwd` equal to its own
  worktree. The launcher reads its authority once per invocation from
  `<ufoRoot>/config/ufo.json` — `dispatch.swarm.waveMinLanes`/`waveMaxLanes`/
  `maxLanes`, `dispatch.maxConcurrentL1`, `sighting.windowPaneCeiling` and
  `dispatch.missionFormat.l1Alias`, never `dispatch.globalRunnerCeiling` or
  `swarm.minLanes` — and refuses `CONFIG_UNREADABLE` before any mutation.
- The fleet pane carries a per-pane alias binding: the launcher passes
  `--model @<sighting.dispatch.missionFormat.l1Alias>` and
  `--config <ufoRoot>/config/mission-nightcall.yml`. That alias names a bucket
  in the operator's global routing table, not a provider/model, so the
  no-per-lane-knob rule above still holds for every lane.
- Three separate limits, none interchangeable: `sighting.windowPaneCeiling` is
  the enforced mission capacity of a fleet window (the default wall never reads
  it — its own capacity is display geometry, `layouts` rows × columns),
  `sighting.dispatch.maxConcurrentL1` is the live L1 mission ceiling, and
  `sighting.dispatch.globalRunnerCeiling` is the global runner ceiling.
  `close --apply` retires wall missions only; it never removes a worktree, and
  its human-readable output prints the exact
  `git -C <repo> worktree remove <path>` per mission.

The planner, taxonomy, registry, route authority, and Sighting behavior above
follow the project UFO skill, `scripts/ufo-swarm-wave.mjs`,
`sighting/tower-fleet.mjs`, `config/ufo.json`, and the repository routing
authority; defer to their current validator, config values, and operator-bound
global configuration rather than to any number or verb restated here.
