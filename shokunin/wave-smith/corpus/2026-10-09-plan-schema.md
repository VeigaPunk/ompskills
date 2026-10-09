# plan-schema — the `ufo-swarm-wave-v1` plan object and its policy provenance

Asked: the plan object `planSwarmWave` returns, field by field.
Source: `scripts/ufo-swarm-wave.mjs:1232-1294, 794-863, 1195-1218`;
`ufo-mission-result.mjs:2415-2527, 2431-2448`. Lane: `PlanSchema`.

| field | shape / producer |
| --- | --- |
| `schema` | `ufo-swarm-wave-v1` (`:143`) |
| `wave` | spec label or `null` |
| `context` | explicit context, else `DEFAULT_WAVE_CONTEXT`; a hoist **appends** the frame + verbatim template after the explicit head (the head stays byte-identical) |
| `policy` | `{source, maxLanes, minLanes, waveMinLanes, waveMaxLanes, declaredMaxLanes, hardCeiling, rampBatchSize, rampIntervalMs, globalRunnerCeiling}` (`:1236-1249`) |
| `counts` | `{spawn, resume, total}` (`:1250`) |
| `compaction` | `{applied, mechanism, reason, savedBytes, payloadBytesBefore, payloadBytesAfter}` (`:1195`, `:1211-1218`) |
| `dispatch` | `{calls, kind: "task", note}` — `calls` is 1 iff spawns exist |
| `registry` | `{schema, path, reportDir?, members}` (`:1268-1278`) |
| `priorRegistries` | normalized relative paths (`:1286`) |
| `tasks` | spawn `{name, agent, task}` / resume `{name, resume, member, item, message}` |

- `policy.source` is `"config"` iff the loader actually read the config file, else
  `"default"` (`:1239`); the expression is an unvalidated passthrough, so a caller-
  **injected** policy that declares `source: "config"` is reported as `"config"`
  (observed by direct `planSwarmWave` call). Through the CLI the doctrine holds — the
  CLI never injects a policy — but the blanket "injected reports default" is a
  comment, not behavior. [round-2 correction]
- `policy.maxLanes` is the effective **cap** (`min(policyMaxLanes, spec.maxLanes)`);
  `declaredMaxLanes` records the raw spec value so a clamp is visible;
  `hardCeiling` is the constant 100.
- `compaction.savedBytes` is the **NET** wave payload delta (shared context counted
  once). The source explicitly warns it is **not** `omp-wave-context`'s
  `hoistedBytes` (a per-seat shrink sum; there net = `hoistedBytes − contextBytes`).
  Reconciling one against the other "misreads both".
- `plan` is **pure**: it never writes the registry (`run` does). Pinned by
  `plan_does_not_create_registry`.

Observed probes: a 2-lane plan under a scratch policy; a resume-lane plan against a
hand-seeded registry (resume task shape confirmed); the live-config policy echo
(`source: config`, 100/16/16/32, `globalRunnerCeiling: 1056`); a missing-config run
(`source: default`, 2/2/100, ceiling null); a hoist with `savedBytes 1082`.

## Not carried by the source

- No round-level counters, no cross-wave accounting, no timestamp on the plan.
- An injected `options.policy` omitting band keys emits them as `undefined`
  (passthrough, no default at that layer) — not probed.

## Unknowns

- A mixed spawn+resume hoisted wave's compaction was exercised only through the suite,
  not by this lane's probes.
