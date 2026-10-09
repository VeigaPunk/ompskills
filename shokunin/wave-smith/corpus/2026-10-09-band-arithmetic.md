# band-arithmetic — how the wave band is derived, and which refusal fires first

Asked: the band arithmetic in `planSwarmWave` (floor/ceiling/cap) and the refusal precedence.
Source: `scripts/ufo-swarm-wave.mjs:794-808, 853-863, 976-1008, 982-983`;
`ufo-mission-result.mjs:2415-2416, 2464-2516`; `config/ufo.json:88-94`. Lane: `BandArithmetic`.

Derivation:

```
policyMaxLanes = min(policy.maxLanes ?? 100, 100)          // tighten-only, hard ceiling 100
policyFloor    = waveMinLanes → minLanes → MIN_SWARM_LANES(2), clamped to policyMaxLanes
policyCeiling  = waveMaxLanes → policyMaxLanes,                 clamped to policyMaxLanes
cap            = min(policyMaxLanes, spec.maxLanes)        // spec tightens only
laneFloor      = policyFloor                               // NEVER clamped to cap
laneCeiling    = min(policyCeiling, cap)
```

Precedence (first failure wins), all before any lane spawns:

| order | code | condition | spawn-gated? |
| --- | --- | --- | --- |
| 1 | `invalid_policy` | malformed config/injected knob, inverted band | — |
| 2 | `empty_wave` | `total === 0` | no |
| 3 | `impossible_band` | `spawns > 0 && laneCeiling < laneFloor` | yes |
| 4 | `too_many_lanes` | `total > cap` | **no** (binds resume-only too) |
| 5 | `too_few_lanes` | `spawns > 0 && total < laneFloor` | yes |
| 6 | `wave_too_wide` | `spawns > 0 && total > laneCeiling` | yes |

Live ladder observed against `config/ufo.json` (band 16–32, cap 100), `plan`:

| lanes | kind | exit | code |
| --- | --- | --- | --- |
| 15 | spawn | 1 | `too_few_lanes` |
| 16 / 32 | spawn | 0 | — (`policy` echoes 100/16/32, `source: config`) |
| 33 / 100 | spawn | 1 | `wave_too_wide` (cap is 100, so 100 lanes is still too wide) |
| 101 | spawn | 1 | `too_many_lanes` |
| 1 | resume-only | 1 | `resume_unknown_member` — band gates skipped |
| 4 + `maxLanes:8` | spawn | 1 | `impossible_band` |
| 25 + `maxLanes:24` | spawn | 1 | `too_many_lanes` |

- `impossible_band` is reachable only through a per-spec `maxLanes`: a policy
  `maxLanes` collapses both band ends to itself, so the feasibility-before-size check
  is what names the right fix (raise the cap, or dispatch resumes only).
- The floor is deliberately never clamped to `cap` (`:979-981`) — clamping would make
  `impossible_band` unreachable.
- A spec `maxLanes` above the hard ceiling is clamped and the raw value is recorded as
  `declaredMaxLanes` so the clamp is visible.
- Fallbacks: policy without a wave band → the swarm band (observed 16..100); empty
  swarm block → built-ins 2..100; inverted band → `invalid_policy`.

## Not carried by the source

- No round-level accumulation: the validator bounds **one wave**; "100 lanes per round"
  is L1 discipline, not a validator refusal.
- `globalRunnerCeiling` has no arithmetic coupling to the band.

## Unknowns

- The config-layer `minLanes > maxLanes` collapse was read from source, not probed.
- An admitted resume (ownership-resolved) PASS path was not exercised by this lane.
