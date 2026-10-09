# policy-load — where the band comes from and every `invalid_policy` trigger

Asked: `loadSwarmPolicy` and the band's config provenance.
Source: `scripts/ufo-swarm-wave.mjs:381-390, 773-812`;
`ufo-mission-result.mjs:2415-2418, 2431-2530, 2143-2159`. Lane: `PolicyLoad`.

Reads `sighting.dispatch.swarm.{maxLanes, minLanes, waveMinLanes, waveMaxLanes,
rampBatchSize, rampIntervalMs}` and `sighting.dispatch.globalRunnerCeiling` (the ceiling
lives on `dispatch`, **not** `swarm`). Constants: `MAX_SWARM_LANES = 100`,
`MIN_SWARM_LANES = 2`, `SWARM_RAMP_BATCH_SIZE = 5`, `SWARM_RAMP_INTERVAL_MS = 700`.

| key | default | clamp | `invalid_policy` trigger |
| --- | --- | --- | --- |
| `maxLanes` | 100 | to `MAX_SWARM_LANES` (tighten-only) | not a positive int |
| `minLanes` | 2 | to the effective maxLanes | not a positive int |
| `waveMinLanes` | falls back to `minLanes` | to the effective maxLanes | not a positive int |
| `waveMaxLanes` | falls back to `min(maxLanes, 100)` | to the effective maxLanes | not a positive int; band inverted |
| `rampBatchSize` / `rampIntervalMs` | 5 / 700 | none | not a positive int |
| `globalRunnerCeiling` | `null` | none | present and not a positive int |

Refusals: every malformed knob, every **non-`null`** non-plain-object block shape (a
`sighting`/`dispatch`/`swarm` set to JSON `null` falls back to the absent-keys defaults and
is **not** refused — the guards are `!== undefined && !== null && !isPlainObject`), config
bytes > 1 MiB, non-regular/changed-size reads, a **non-`null`** non-object root (a bare
`null` root is accepted as `source: "config"` with all defaults), unparseable JSON, and any
non-ENOENT read fault → `MissionResultError("invalid_policy")`. An **ENOENT** config is
**not** an error — it yields `source: "default"`.

The wave CLI wrapper (`:381-390`) maps `invalid_policy` through `fail()` so the class
changes but the code and message bytes ride through verbatim into the
`ufo-swarm-wave-error-v1` envelope at exit 1. `planSwarmWave` **re-validates an injected
policy** with the same positive-integer and band rules inline — an injected inversion is
typed `invalid_policy`, never `impossible_band` — with one divergence (round-2 correction:
an injected `globalRunnerCeiling: null` is **accepted** while a config `null` is refused).

Provenance: `plan.policy.source = policy.source === "config" ? "config" : "default"`; only
a successful config **file read** sets `"config"` **in the loader**, and `:1239` echoes
`policy.source` unvalidated — so a caller-injected policy reports `"default"` only when it
omits `source` (an injected `{source: "config"}` reports `"config"`). The CLI never injects,
so the doctrine holds there; through `planSwarmWave` directly it does not.

Observed: live config → `{source: config, maxLanes 100, minLanes 16, waveMinLanes 16,
waveMaxLanes 32, globalRunnerCeiling 1056}`; a scratch copy with `waveMaxLanes 8` →
exit 1 `invalid_policy` `sighting.dispatch.swarm wave band is inverted: waveMaxLanes <
waveMinLanes`; absent config → `{source: default, 100/2/2/100, ceiling null}`; an
outside-root `UFO_CONFIG_PATH` → `EXEC_PATH_OUTSIDE_ROOT`; a chmod-000 or malformed config
→ `invalid_policy` `cannot read …` (path not redacted here).

Of the three ceilings the skill names, the validator reads **only**
`globalRunnerCeiling` (echoed, type-checked, never enforced against lanes) and never
touches `windowPaneCeiling`/`maxConcurrentL1` — the launcher is the complement.

## Not carried by the source

- No round-level accumulation; the loader's "round" comment is policy framing.
- The config gate carries exactly one refusal (`EXEC_PATH_OUTSIDE_ROOT`); a missing config
  is the loader's business, not the gate's.

## Unknowns

- The too-large / not-regular / changed-size arms and the injected-policy default
  passthrough for omitted band keys were source-anchored only.
