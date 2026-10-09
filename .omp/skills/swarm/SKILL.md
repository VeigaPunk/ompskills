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
   a fresh spawn or a second wave. Do not invent, omit, or rewrite lanes, roles,
   bindings, or resumes after validation.
3. Integrate and report only observed results. Workers advise the parent; keep
   one L1, no second judge, honest evidence, and no concurrent overlapping-file
   assignments. Wave output is advisory: no lane becomes a judge verdict.

The validator is normative. The configured wave band is **16–32 total members**
(spawn lanes plus resumes counted together) **per wave**, from
`sighting.dispatch.swarm.waveMinLanes`/`waveMaxLanes`; the per-L1 member
ceiling `swarm.maxLanes` is **100** — the round ceiling that sequential waves
of one round share — and a per-spec `maxLanes` may only tighten it,
never widen it. `swarm.minLanes` **16** is the declared swarm-round floor —
policy, not a planner gate; what the planner gates is the wave band, and in a
band-less policy the built-in minimum is **2**. Resume-only waves are exempt
from the floor. A spec cap below the floor makes the band unreachable and fails
before any lane spawns. Items must expand to pairwise-distinct prompts; a
duplicate expansion is a refusal, never a silent dedupe. Refusals are typed —
`empty_wave`, `too_few_lanes`, `wave_too_wide`, `too_many_lanes`,
`impossible_band`, `duplicate_expansion`, `unknown_role`,
`resume_unknown_member`, `conflicting_assignment`, and (with route preflight
enabled) `route_unreachable` — and a refusal is a reason to fix the spec or
execute the work directly, never a reason to bypass validation.

Each new spawn carries one explicit taxonomy role: `scout`, `reviewer`,
`critic`, `connector`, `sentinel`, `executor`, `mutation-tester`, `revenger`,
`simplifier`, or `scribe`. Do not include frozen-topology seats (planner,
distiller, labrat, Main) as swarm roles. A spawn item may declare `axes` (1–8
distinct nonempty names, ≤256 bytes each) and a short `milestone`; spec-level
values are defaults, item-level wins, and a resume lane inherits the spawn
binding rather than supplying its own.

Resume assignments must name an owned member from the wave registry or the
spec's declared `priorRegistry`; unknown or conflicting agent ids fail closed
before any lane spawns. Keep and use the validator's registry and dispatch
output for continuity — the registry records each member's name, agent id, item,
and role, which is what lets a later wave resume by name across turns. A resumed
agent retains its existing identity and role; do not assign it a new role or a
replacement agent. OMP's one `task` call is the wave, so kimi's 5-per-700ms
launch ramp needs no porting: the harness queues lanes beyond its own
concurrency window, and the ramp constants are recorded in the plan as declared
pacing policy only.

## Lane shape: leaf by default

A swarm member is a leaf — no delegation and no background jobs. Omit the
`spawns:` key entirely for a leaf; `spawns: []` is a footgun, not the leaf
spelling, because an empty list collapses to undefined and yields a wildcard
when `task` is in the lane's tools. `agents/executor.md` is the one card that
permits a spawn (`labrat`), and the host's `task.maxRecursionDepth` (**2**) is
what bounds that chain. The host's `task.maxConcurrency` (**32**) is a separate
cap on lanes running at once; it is not the wave band and not the member
ceiling — a wave at the 32-lane ceiling fills that window exactly, while lanes
from the later waves of a 100-member round queue behind the earlier waves.

## Godspeed posture

Every fresh spawn lane carries `/skill:godspeed` as its leading line: the wave
renderer injects it and the OMP `task` hook
(`.omp/hooks/pre/ufo-godspeed-inject.js`) enforces it for every `task`
dispatch, batched or flat, idempotently. Resume `hub send` entries never carry
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
  and `run`) flags a wave whose lanes all resolve into one route family as
  `singleFamily`, so you can split it or record the accepted risk; never edit
  or override global routing from this skill.
- Use `scripts/ufo-sighting open` to open the operator wall (tmux session
  `ufo_sighting`, window 1); `status` and `overview [--watch]` to inspect it;
  `peek --mission <id> [--lines N]` to read a pane back; and
  `steer --mission <id> --text "<one line>"` to send operator input to a
  registered mission. These are UFO Sighting display and interaction controls
  for registered missions, not swarm orchestration: the wall never dispatches,
  judges, or owns a wave. A `task` worker or swarm lane is **not** automatically
  a wall mission or titled pane. `launch … --fleet NAME` opens a separate
  titled tmux window whose missions share it as panes — use it only when
  launching registered fleet missions is explicitly required, and do not claim
  it exposes task workers. Per-window pane ceilings
  (`sighting.windowPaneCeiling`) are display capacity, not the global runner
  ceiling (`sighting.dispatch.globalRunnerCeiling`).

The planner, taxonomy, registry, route authority, and Sighting behavior above
follow the project UFO skill, `scripts/ufo-swarm-wave.mjs`, `config/ufo.json`,
and the repository routing authority; defer to their current validator, config
values, and operator-bound global configuration rather than to any number or
verb restated here.
