# policy-load-defaults — loadSwarmPolicy key by key

Asked: what the hub loader does with each swarm key.
Source: `scripts/ufo-mission-result.mjs:2412-2530`. Lane `SwarmPolicyLoad` (29 read-only probes). Constants re-read by the L1 at `:2412-2420`.

Constants: `MAX_SWARM_LANES = 100` (`:2415`), `MIN_SWARM_LANES = 2` (`:2416`), `SWARM_RAMP_BATCH_SIZE = 5` (`:2417`),
`SWARM_RAMP_INTERVAL_MS = 700` (`:2418`), `MAX_SWARM_POLICY_BYTES = 1 MiB` (`:2420`).
Comment `:2412-2414`: "the global per-L1 atomized-L2 swarm maximum is 100 — stricter than kimi's MAX_AGENT_SWARM_SUBAGENTS=128 … launch ramp 5 per 700 ms".

| key | default when absent | clamp | validation → error |
| --- | --- | --- | --- |
| `maxLanes` | 100 | `min(v,100)` (`:2469`) | positive safe int → `…maxLanes must be a positive integer` |
| `minLanes` | 2 (not clamped when absent) | `min(v,maxLanes)` (`:2496`) | positive int |
| `rampBatchSize` | 5 | none, **no upper bound** | positive int |
| `rampIntervalMs` | 700 | none, **no upper bound** | positive int |
| `waveMinLanes` | resolved `minLanes` (`:2503`) | `min(v,maxLanes)` (`:2508`) | positive int |
| `waveMaxLanes` | effective `maxLanes` (`:2510`) | `min(v,maxLanes)` (`:2515`) | positive int |
| band | — | compared **after** clamping | `waveMaxLanes < waveMinLanes` → `…wave band is inverted` (`:2517-2519`) |
| `dispatch.globalRunnerCeiling` | `null` (`:2521`) | none | positive int; JSON `null` refuses |

All failures are `invalid_policy`. ENOENT means `source:"default"` (the built-in band applies silently).

Divergences:
- `sync-ufo-contracts.mjs:1249-1256` clamps the band only to `maxLanes`, not to 100. It disagrees with the loader in both directions (lane `ContractSyncValidators`, a pure-JS replica that was not run through the real modules).
- `globalRunnerCeiling` may be null in the loader, but `ufo-sighting-lib/base.mjs:155-157` and `fleet-dispatcher.mjs:3731-3733` refuse a missing value.
