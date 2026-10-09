# Gate 3 — dispatch delta bounds

**Asked.** The numeric/l1Alias bounds gate 3 enforces on the delta, and where
each is re-enforced at runtime.

**Observed.** `host/apply.mjs dispatchGate` L351–397.

- `positiveInt` (L275–279): `!Number.isSafeInteger(value) || value <= 0` →
  `must be a positive safe integer`. Called on `maxConcurrentL1` L377,
  `swarm.waveMinLanes` L379, `swarm.waveMaxLanes` L380, `swarm.maxLanes` L381
  (`delta.swarm ?? {}` L378 makes a missing block an `undefined` refusal, not a
  TypeError).
- Inverted band L382–385 (strict `<`, equal accepted): refuses with a message
  naming the runtime arm; runtime throws `invalid_policy`
  (`ufo-swarm-wave.mjs:806-808`, `ufo-mission-result.mjs:2517-2519`).
- `MAX_SWARM_LANES = 100` (L65; canonical `ufo-mission-result.mjs:2415`)
  enforced L386–388 — refuses `waveMaxLanes > 100 || maxLanes > 100`.
  `waveMinLanes` is bounded transitively (positive + non-inversion + waveMax ≤
  100). The runtime *clamps* oversized bands silently (L2469/L2508/L2515); gate 3
  is strictly stricter.
- `l1Alias` L392–396: bare non-empty, no leading `@`, read from the **delta**
  (not live `ufo.json`, comment L404–406); bound to the candidate at L974–980.

**Delta keys** (`host/ufo-sighting-dispatch.json`, 12 lines): leaves
`sighting.dispatch.maxConcurrentL1=16`, `.missionFormat.l1Alias="m_strong"`,
`.swarm.maxLanes=100`, `.swarm.minLanes=16`, `.swarm.waveMinLanes=16`,
`.swarm.waveMaxLanes=32`. Only leaves are merged. All six report `unchanged`
because `config/ufo.json:79/85/88-89/93-94` already carries them.

**Defect found (F2, medium).** `swarm.minLanes` is one of the six written keys
but the **only numeric gate 3 never bounds-checks**, and gate 6 cannot backstop
it (the injected `postPolicy` spreads `livePolicy`, L640–646). A delta with
`"minLanes": 0` passes the dry run and `--apply` would install a value
`loadSwarmPolicy` refuses for every wave (`invalid_policy`,
`ufo-mission-result.mjs:2492-2494`).

**Added.** 2026-10-09 · lane `DispatchDeltaBounds` (reviewer)