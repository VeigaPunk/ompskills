# relational-model — units, scopes, and which equal numbers are linked

Asked: one relational table across all limits. Which pairs does code link, and which merely coincide?
Lane `CeilingRelations` (connector, 39 knobs tabulated), cross-read with every other r1 lane.

Units:
| unit | knobs |
| --- | --- |
| live L1 missions (global) | `maxConcurrentL1` |
| live missions in one window | `windowPaneCeiling` (fleet), `layouts` cap (default wall) |
| runner reservations (global sum) | `globalRunnerCeiling`; per task `MAX_REQUESTED_RUNNERS` 1024 |
| lanes per wave | `waveMinLanes`, `waveMaxLanes`, `maxLanes` (in code), `MAX_SWARM_LANES`, `MIN_SWARM_LANES`, `minLanes` (fallback) |
| lanes per round (doctrine only, no gate) | `maxLanes` (label), `minLanes` (watchdog target) |
| rounds | spec `roundCeiling` (no comparator), `defaultIterateRounds` (1..1024) |
| concurrent children in a judged round | `omp-native-v1.concurrencyCeiling` 32, `PROPOSAL_WAVE_CEILING` 16 |
| concurrent subagents (omp session) | `task.maxConcurrency` (32 plain / 0 = unlimited for UFO runs) |
| nesting depth | `task.maxRecursionDepth` 2, `probe.depth` 2 |
| concurrent workers (self-iter / L3) | `hostCeiling` 64, `SELF_ITER…` 64, `l3Evidence` 64 |

Code-linked pairs: waveMin ≤ waveMax (4 sites); band ≤ maxLanes (loader clamp); maxLanes ≤ 100 (hub clamp; apply uses its own 100);
waveMin ← minLanes (fallback); runner per-task min(1056, 1024); omp-native concurrencyCeiling == Rust 32 (launch equality); probe.depth → projected maxRecursionDepth (generated);
`staleAfterMs > heartbeatIntervalMs` (advisory); `l3Evidence` == 64; `twinMaxDepth` == 1; projection `maxConcurrency` == 0.

Coincident (no code relates them):
- **16**: maxConcurrentL1, windowPaneCeiling, waveMinLanes, minLanes, devin concurrencyCeiling, the dispatcher's default windowPaneCeiling. The launcher checks two different counts against 16 independently.
- **32**: task.maxConcurrency, waveMaxLanes, omp-native concurrencyCeiling.
- **64**: hostCeiling, Rust self-iter default, `self-iter.sh`, l3Evidence.
- **100**: config maxLanes vs hub `MAX_SWARM_LANES` (clamped) vs apply's own copy (independent).
- **1024**: `MAX_REQUESTED_RUNNERS`, the defaultIterateRounds cap, the `runner-ceiling-1024` doc gate. These are three different units.
- **2**: maxRecursionDepth vs `MIN_SWARM_LANES` (different units).

Rule: before saying two knobs "agree", name the code that compares them. Equal values with no comparator are a coincidence, and moving one moves nothing else.
