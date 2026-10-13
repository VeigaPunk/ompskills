# dispatch-payload — the `ufo-swarm-wave-dispatch-v1` payload and its spawn/resume split

Asked: `planToDispatchPayload` and the exact dispatch payload an operator executes.
Source: `scripts/ufo-swarm-wave.mjs:1307-1343, 143-146`; observed on a 2-lane spec.
Lane: `DispatchPayload`.

Top level: `schema`, `wave`, `policy`, `counts`, `registry`, `taskCall`,
`resumeSends`, `note` — plus, only when set, `handlesReset`, `compaction`,
`routePreflight`, `priorRefinement`. On plain `plan` the payload does not exist at
all (plan emits the plan object, whose `compaction` key is **unconditional** — the
inert all-zero block); still, in the payload only `handlesReset`, `compaction`,
`routePreflight` and `priorRefinement` are conditional spreads. Round-2 correction:
the payload's top-level `note` has **no suite assertion at all** (neither wording nor
shape) — only `dispatch.note` in the plan is pinned, as a string.

Schema constants (values): `SWARM_WAVE_SCHEMA` `ufo-swarm-wave-v1`,
`SWARM_DISPATCH_SCHEMA` `ufo-swarm-wave-dispatch-v1`, `SWARM_REGISTRY_SCHEMA`
`ufo-swarm-registry-v1`, `SWARM_WAVE_ERROR_SCHEMA` `ufo-swarm-wave-error-v1`.

- `taskCall` is `null` iff there are **no** spawn entries (`spawns.length === 0`);
  otherwise `{context, tasks}` carrying spawn lanes only.
- The two filter arms are independent `!== undefined` tests on `entry.agent` /
  `entry.resume` (`:1312-1316`): an entry carrying both lands in **both** lists
  (preserved deliberately — an exported boundary).
- `resumeSends` entries: `{name, resume, member, item, message}`.
- Mapping onto the harness: one `hub send --to <entry.resume> --message
  <entry.message>` per resume entry; `entry.name` is bookkeeping (the resume row's
  dispatch key), not a hub field.
- Observed: 2-spawn `plan` → no `taskCall`/`resumeSends` keys, `dispatch.calls: 1`;
  2-spawn `run` → `taskCall` non-null with 2 tasks, `resumeSends: []`;
  resume-only `run` → `taskCall: null`, `resumeSends.length: 2`.
- Both `note` strings are operator prose, deliberately **unpinned** by the suite
  (shape-only: `typeof string`). Structural invariants are pinned instead via
  `dispatch.calls` plus the `taskCall`/`resumeSends` split.

## Not carried by the source

- `priorRegistries` does **not** ride the payload — it rides the plan object and the
  persisted registry doc. A consumer needing the declared priors must read those.
- No per-lane model key: spawn entries are exactly `{name, agent, task}`.

## Unknowns

- `routePreflight` / `priorRefinement` value shapes were read from source and pinned by
  sibling suites, not probed end-to-end from this lane.
