# swarm-registry — swarm-registry.json census and record gaps

Source: r1 lane `SwarmRegistryShape` (fleet `shokunin3`, mission `receipt-keeper`, wave `receipt-keeper-r1-w1`); anchor launcher `sighting/tower-fleet.mjs` @ `ada7a90` (sha256 `80f0814e…`).

## Asked

Registry format and which waves were never recorded.

## Observed

- Writer: `ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs` (:146, :628-654, `record` :1628-1791). Schema `ufo-swarm-registry-v1` in 48/48 registries.
- 48 registries, 1555 members: 1183 recorded `agentId`, 372 null; 0 resume rows; 12 all-null (record never ran); `tower1/reports/tf-audit-routing` partial (3/51 null).
- 1082 entries have `agentId == member name` — in this runtime the job id is the lane name, so a recorded id is not proof of a distinct runtime handle.
- `tf-wavetest-priors` holds 101 `agent-r1prior` fixture ids; 20 agentIds duplicate across registries.
- A reportDir reused across rounds overwrites or accumulates members — per-round counts need prefix subsets.

## Unknowns

- Cause of cross-registry duplicate ids.
