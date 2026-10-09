# swarm-band-gates — the four planner gates

Asked: where the wave-band numbers are enforced, in what order, and with which operators.
Source: `scripts/ufo-swarm-wave.mjs` (sha `cd8247af…`). Lane `SwarmBandGates`, verified by the L1 ladder (see band-ladder-probes).

Derivation (`:794-808`):
- `policyMaxLanes = min(policy.maxLanes ?? 100, MAX_SWARM_LANES)`
- `policyFloor = min(waveMinLanes ?? minLanes ?? MIN_SWARM_LANES, policyMaxLanes)`
- `policyCeiling = waveMaxLanes ?? policyMaxLanes`
- inverted `policyCeiling < policyFloor` → `invalid_policy` (`:806-807`)
- `cap = min(policyMaxLanes, spec.maxLanes)`; `laneCeiling = min(policyCeiling, cap)`; `laneFloor = policyFloor` (`:982-983`)

Gates, in order:

| # | code | site | condition | applies to |
| --- | --- | --- | --- | --- |
| 1 | `impossible_band` | `:989-993` | `spawns>0 && laneCeiling < laneFloor` | spawn-bearing waves |
| 2 | `too_many_lanes` | `:995-997` | `total > cap` | **every** wave, including resume-only |
| 3 | `too_few_lanes` | `:998-1002` | `spawns>0 && total < laneFloor` | spawn-bearing waves |
| 4 | `wave_too_wide` | `:1004-1006` | `spawns>0 && total > laneCeiling` | spawn-bearing waves |

- `total` counts spawns plus resumes. A resume-only wave is bounded only by gate 2, so its widest legal size is 100.
- A per-spec `maxLanes` can only tighten. A spec cap below the floor gives `impossible_band` before any lane spawns.
- The plan echoes `policy.{maxLanes,minLanes,waveMinLanes,waveMaxLanes,hardCeiling,rampBatchSize,rampIntervalMs,globalRunnerCeiling}` (`:1241-1248`).
  The echoed values are **raw** policy values, not the enforced `laneFloor`. An injected `{minLanes:200,maxLanes:100}` enforces 100 but echoes 200 (lane `MinLanesSemantics`).
- `globalRunnerCeiling` is range-checked (`:809-811`) and echoed. The validator never enforces it.

Cite, don't own: spec shape and resume semantics are wave-smith's domain.
