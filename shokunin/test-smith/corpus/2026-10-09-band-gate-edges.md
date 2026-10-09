# 2026-10-09 — band gate edges

**Asked.** What band-edge matrix does `run-wave-test.mjs` step 6 exercise, how
are expectations derived, and how does the planner's own order validate the
derivation? (Lane `BandGateEdges`, scout.)

**Observed.** Sources: `test/run-wave-test.mjs:74-163,456-530,557-569,624-1006,1395-1413`;
`test/sighting-wave-smoke.md:24-50,570-603`; substrate
`config/ufo.json:71-95`, `scripts/ufo-swarm-wave.mjs:794-808,853-864,979-1009,1234-1248`,
`scripts/ufo-mission-result.mjs:2415-2416`; `host/ufo-sighting-dispatch.json`.

- Live band: `waveMinLanes 16`, `waveMaxLanes 32`, `maxLanes 100`, `minLanes 16`,
  `maxConcurrentL1 16`, `windowPaneCeiling 16`. The live file matches the delta
  on all three keys `resolveBand` compares (`waveMinLanes`/`waveMaxLanes`/`maxLanes`),
  so `--band live` would not refuse `apply_not_landed` on this substrate today;
  the smoke doc's pre-apply 32-100 caveat is stale for this checkout [INFERENCE,
  not executed].
- Size matrix 6a (`:726-748`): a Set of seven literals
  `[floor-1, floor, floor+1, ceiling, ceiling+1, cap, cap+1]` → `{15,16,17,32,33,100,101}`.
  Cells: 15 `too_few_lanes`; 16 admitted `{spawn 16, resume 0, total 16}`; 17
  admitted `{17,0,17}`; 32 admitted `{32,0,32}`; 33 `wave_too_wide`; 100
  `wave_too_wide` (sits exactly on the 100-lane round cap but a single spawn
  wave is still bounded by the 32 wave ceiling); 101 `too_many_lanes` (the cap
  is judged before the wave ceiling). Each cell: `code = bandVerdict(lanes,
  band)`; `null` → `admission` with `{spawn: lanes, resume: 0, total: lanes}`;
  else `refusal`. Specs land as `spec-band-<lanes>.json`; evidence as
  `band-<lanes>.json`. Doc gap: the smoke doc table names 15/16/32/33/101 only —
  17 and 100 are exercised but unlisted.
- Per-spec `maxLanes` matrix 6b (`:750-784`), four refusals as literals
  (`bandVerdict` cannot express `impossible_band`): lanes 16 / cap 15 →
  `impossible_band` (cap < floor ⇒ no spawn wave can satisfy the band,
  feasibility judged first); lanes 15 / cap 16 → `too_few_lanes` (band
  reachable, short count is the refusal); lanes 33 / cap 33 → `wave_too_wide`
  (a cap declared at 33 does not widen the wave ceiling); lanes 100 / cap 99 →
  `too_many_lanes` (tightened cap refuses what the policy cap would admit).
  Then two admissions pinning the clamp: `spec-cap-tight.json` (32 lanes, cap
  32) admitted with `policy.maxLanes === 32` and `declaredMaxLanes === 32`;
  `spec-cap-widen.json` (32 lanes, cap 101) admitted with `policy.maxLanes ===
  100` (clamped) and `declaredMaxLanes === 101` — tighten-only, declaration
  recorded. Planner side confirms (`ufo-swarm-wave.mjs:853-864`): `cap =
  Math.min(cap, spec.maxLanes)`.
- Resume exemption 6d (`:786-906`): `priorsFixture(cap + 1)` = 101 members
  (`FixturePrior001…101`), wider than any one legal wave. Measured at both ends:
  15 resume lanes admitted `{spawn 0, resume 15, total 15}` (below the floor);
  33 admitted `{0,33,33}` (above the wave ceiling); 101 refused
  `too_many_lanes` (one past the cap). Each case has a pool guard that fails
  rather than silently skipping. Stated rule: the exemption is from the band,
  never from the cap. Supporting assertions: 1-lane resume admitted; the plan
  row is `kind: "resume"`, `agentId: null`, `member === priors.names[0]`;
  `godspeedInvocations(lane.message) === 0`; `run` exits 0 with
  `payload.taskCall === null` and `resumeSends.length === 1` bound to
  `priors.ids[0]`. Mixed waves: 1 spawn + 14 resumes = 15 → `too_few_lanes`;
  1 spawn + 15 = 16 → admitted `{spawn 1, resume 15, total 16}` — a wave with
  even one spawn lane is a spawn wave, so the band applies to the total. Cap
  still binds resumes (`resumeOnlySpec(2, …, 1)` → `too_many_lanes`); the
  cap-clamp-only case (`resumeOnlySpec(101, …, 101)` → `too_many_lanes`) is the
  one lane count where the clamp alone decides admission.
- Assertion helpers: `refusal(id, result, code, why)` (`:657`) =
  `status === 1 && json.code === code && json.schema ===
  "ufo-swarm-wave-error-v1"`; `admission(id, result, expected, why)` (`:666`) =
  `status === 0` and the exact `counts.spawn/resume/total` triple; `planCase`
  (`:646`) writes raw stdout/stderr as evidence before judgment. Deriving the
  expected code from the band (not listing edges as literals) is what makes a
  band that moved without the script changing fail here instead of quietly
  measuring the old edges.
- The derivation is valid because the planner judges in this order
  (`ufo-swarm-wave.mjs`): `impossible_band` (`:989-994`, spawn-only) →
  `too_many_lanes` (`:995-997`, un-gated) → `too_few_lanes` (`:998-1003`,
  spawn-gated) → `wave_too_wide` (`:1005-1008`, spawn-gated), with `laneFloor =
  policyFloor`, `laneCeiling = Math.min(policyCeiling, cap)`, `policyFloor =
  min(waveMinLanes, policyMaxLanes)`, `policyCeiling = min(waveMaxLanes,
  policyMaxLanes)`, `policyMaxLanes = min(policy.maxLanes, MAX_SWARM_LANES)`
  (`:794-805`; `MAX_SWARM_LANES = 100`, `MIN_SWARM_LANES = 2`). Observed nuance:
  `bandVerdict`'s internal order (cap → wave ceiling → floor) is not the
  planner's order; `bandVerdict(lanes, band) === null` is the only derivation
  used for admission.

**Changed.** Nothing — read-only research.

**Unknown.** The suite was read, not run; the "`--band live` would not refuse
today" claim is an inference from the file contents, not an executed check.
