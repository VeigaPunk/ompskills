# Gate 6 — injected-policy band edges (mutation-tested)

**Asked.** The injected-policy edge assertions and which edges actually bite.

**Observed.** `host/apply.mjs:640-646` builds `postPolicy = {...livePolicy,
source:'config', maxLanes:delta.swarm.maxLanes(100), waveMinLanes:16,
waveMaxLanes:32}`; observed `livePolicy` = `{source:'config', maxLanes:100,
minLanes:16, waveMinLanes:16, waveMaxLanes:32, declaredMaxLanes:100,
hardCeiling:100, rampBatchSize:5, rampIntervalMs:700, globalRunnerCeiling:1056}`.
Edges: `admittedAt(16)` L680, `refusedAs(15,'too_few_lanes')` L681,
`admittedAt(32)` L684, `refusedAs(33,'wave_too_wide')` L686,
`refusedAs(101,'too_many_lanes')` L689 (cap test precedes ceiling test).

**Observed lines** (dry run, exit 0): `16 lanes admitted (exactly at the new
floor)`; `15 is refused as too_few_lanes`; `32 is admitted (exactly at the wave
ceiling)`; `33 is refused as wave_too_wide — one wave carries at most 32`; `101
are refused as too_many_lanes — the 100-member per-L1 round ceiling holds`.

**Mutation probes (isolated `/tmp` copy of the delta; repo hashes unchanged):**

| mutation | result | meaning |
| -------- | ------ | ------- |
| `waveMinLanes 16→17` | KILLED (exit 1, `16 … refused as too_few_lanes`) | the floor literal is pinned |
| `waveMaxLanes 32→31` | **SURVIVED** (exit 0) | ceiling probes are parameterized by `waveMaxLanes`; the gate proves self-consistency, not that the ceiling is 32 |
| `maxLanes 100→33` | **SURVIVED** (exit 0) | the 101 probe only proves `cap ≤ 101`; `100-member ceiling` is the printed constant `MAX_SWARM_LANES`, not the delta value |

**Takeaway.** The floor assertion is a real pin; the ceiling/cap "proofs" are
self-consistency checks over whatever the delta declares. Read gate 6 as
"the band admits its own endpoints and refuses ±1", not as evidence that the
band is 16–32.

**Added.** 2026-10-09 · lane `WaveBandEdges` (mutation-tester)