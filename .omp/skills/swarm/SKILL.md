---
name: swarm
description: >
  Kimi-style swarm toggle and bounded parallel task waves for OMP. Uses the
  repository wave validator and global OMP role routing; never mutates routing
  configuration or turns child tasks into UFO Sighting missions.
metadata:
  axis_family: orchestration
  language: match-repo
  substrate: omp
---

# `/swarm` — OMP session mode and task waves

Invoke as `/skill:swarm`, `/swarm on`, `/swarm off`, or `/swarm <task>`.

## Session toggle

- `/swarm on` enables swarm-wave behavior for this conversation only; confirm
  the session state. `/swarm off` disables it and confirm. This is conversational
  state only: do not write OMP configuration or claim a persistent toggle API.
- When enabled, consider a validated wave for a large set of independent,
  similarly shaped, unjudged tasks with disjoint ownership. It is not a general
  replacement for ordinary `task` delegation. Use normal delegation for a small
  set, one-off task, overlapping edits, work requiring one shared writer, or any
  request that cannot meet the wave validator's shape and bounds. Never split a
  wave into several `task` calls to evade a refusal.
- `/swarm <task>` requests one wave attempt; `/skill:swarm` without a task
  explains the toggle and asks for an actionable task specification. Never
  manufacture work or split one user's task into artificial lanes merely to hit
  the minimum.

## Validate, then dispatch exactly once

1. Declare a spec with distinct per-item prompts or a template containing
   `{{item}}`; use a saved spec, stdin, or inline JSON. Validate/render it with
   `node scripts/ufo-swarm-wave.mjs run --spec-json '<JSON>'` (or `--spec PATH`
   / `--spec -` for a file/stdin). Do not dispatch if validation refuses it.
2. Read the `ufo-swarm-wave-dispatch-v1` result. Make **one** OMP `task` tool
   call using its `taskCall.context` and complete `taskCall.tasks` array as-is.
   If `taskCall` is `null`, there are no new spawn tasks: send each
   `resumeSends` entry through its stated `hub send` to the recorded parked
   agent. Resume is continuity to an existing agent, not a fresh spawn or a
   second wave. Do not invent, omit, or rewrite lanes, roles, bindings, or
   resumes after validation. Every fresh worker receives `/skill:godspeed`;
   the wave renderer and OMP task hook enforce the invocation.
3. Integrate and report only observed results. Workers advise the parent; keep
   one L1, no second judge, honest evidence, and no concurrent overlapping-file
   assignments.

The validator is normative. Current configured wave band is 16–100 total
members (spawns plus resumes); the maximum is 100, and a spec cap may only
reduce it. The configured `minLanes: 64` is a declared swarm-round floor, not a
planner gate; a band-less policy has a built-in minimum of 2. Resume-only waves
are exempt from the floor. A cap below the floor is impossible; too few or too
many lanes are refusals, not reasons to bypass validation. Items must expand to
pairwise-distinct prompts. Each new spawn has one explicit taxonomy role:
`scout`, `reviewer`, `critic`, `connector`, `sentinel`, `executor`,
`mutation-tester`, `revenger`, `simplifier`, or `scribe`. Do not include
frozen-topology roles (planner, distiller, labrat, Main) as swarm roles.

Resume assignments must name an owned member from the wave registry or the
spec's prior registry; unknown or conflicting agent IDs fail closed. Keep and
use the validator's registry/dispatch output for continuity. A resumed agent
retains its existing identity and role; do not assign a new role or replacement
agent. OMP's one `task` call is the wave; no Kimi-specific launch ramp is needed.

## Routing and observation

- The taxonomy role selects its `@m_*`/role alias bucket through the operator's
  bound global OMP `~/.omp/agent/config.yml` (`task.agentModelOverrides`,
  `modelRoles`, and `retry.fallbackChains`). Any alias and ordered fallback
  chain may be used **only through OMP routing and authentication already
  configured by the operator**. The global config is the sole routing/auth
  authority. Never hardcode a provider/model, credentials, or per-task model;
  never edit or override global routing from this skill.
- Use `scripts/ufo-sighting open` to open the operator wall; `status`,
  `overview`, and `peek` to inspect it; `steer` to send operator input to a
  visible mission. These are UFO Sighting display/interaction controls, not
  swarm orchestration. A `task` worker is not automatically a wall mission or
  titled pane. Use `launch --fleet NAME` only when launching separate titled
  mission panes is explicitly required; do not claim it exposes task workers.

The planner, taxonomy, registry, route authority, and Sighting behavior above
follow the project UFO skill, `scripts/ufo-swarm-wave.mjs`, `config/ufo.json`,
and the repository routing authority; defer to their current validator and
operator-bound global configuration rather than stale prose.
