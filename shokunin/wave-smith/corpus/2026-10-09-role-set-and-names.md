# role-set-and-names — the ten roles, the frozen seats, and how names are minted

Asked: the taxonomy role surface — the role set, name minting, the two regexes, and
whether the validator carries any routing binding.
Source: `scripts/ufo-swarm-wave.mjs:256-269, 271-272, 367-372, 1108-1114, 937-939`. Lane: `RoleSet`.

`SWARM_ROLES` (`:258-269`) is a closed `Set` of exactly ten: **scout, reviewer,
critic, connector, sentinel, executor, mutation-tester, revenger, simplifier,
scribe**. Membership is tested once, on a spawn lane: a missing role is `role_required`
(`:934-935`); a role outside the Set is `unknown_role` (`:937-939`) (observed verbatim:
`items[0].role "planner" is not a swarm role`, exit 1).

Frozen-topology seats — **planner, distiller, labrat, Main** — are named at
`:27-30`/`:256-257` as seats that "can never be swarm lanes"; they are excluded by
plain absence from the Set. Same for generic `task`, `security-reviewer`, `sonic`,
and any other roster agent not in the ten: legality is a property of the validator's
Set, not of agent discoverability.

Default dispatch name (`:1108-1114`): `lane.name ??` (`kind === "resume"` ?
`SwarmResume` : `Swarm${camelRole(role)}`) + `String(laneIndex + 1).padStart(2, "0")`
— **width-2, 1-based lane index**. `camelRole` (`:367-372`) splits on `-` and
uppercases each segment, so `mutation-tester` → `SwarmMutationTester01`. An explicit
`name` wins outright. A repeat across lanes is `duplicate_name` (`:1113`).

Patterns (verbatim, `:271-272`):

- `TASK_NAME_PATTERN = /^[A-Z][A-Za-z0-9]{1,31}$/u` — 2..32 chars, CamelCase start.
  Applied to `items[N].name` (`invalid_name`) and to registry member names at load
  (`invalid_registry`).
- `RESUME_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:/-]{0,255}$/u` — 1..256 chars.
  Applied to `items[N].resume` (`invalid_resume_id`), registry `agentId` at load,
  and `--assignments` values (`invalid_agent_id`).

**No-pin proof (local).** The validator resolves no model itself: the emitted spawn
task entry is exactly `{name, agent: lane.role, task}` (`:1187`), and a default
`plan`/payload carries zero model bytes (`model|provider` hits are prose comments;
`routingOptions` at `:1384/:1390` is the opt-in preflight's own input). The role
string is the sole routing key it emits — OMP resolves the seat route at spawn time
from the operator's global config. **One nuance (round-2 correction):** the opt-in
route preflight is not model-blind — `plan --route-families` emits resolved hop
strings in `plan.routePreflight.families[].hops` (e.g.
`"alibaba-token-plan/deepseek-v4.1-flash:max"`). That is routing *reporting* from the
operator's config, never a per-lane pin the wave authors.

## Not carried by the source

- No per-role cardinality, alias, or model literal; no role-dependent resume naming.
- No role→band binding: the wave band lives in the band logic, not in the role Set.

## Unknowns

- Whether the harness accepts every legal role string at live dispatch (the validator's
  gate is Set membership; the roster used for cross-checking is the recorded one in the
  substrate's telemetry plus the harness's bundled-agent doc).
