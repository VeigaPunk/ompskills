# Substrate — scripts/ufo-swarm-wave.mjs (planner policy + refusals)

**Asked.** Policy resolution, the band keys, the refusal taxonomy, and the plan
counts shape.

**Observed.** `scripts/ufo-swarm-wave.mjs`.

- `ROOT = resolve(process.env.UFO_PROJECT_ROOT || <scriptDir>/..)` L122–124.
  `defaultConfigPath` L135–137 → hub `gatedConfigPath`
  (`ufo-mission-result.mjs:2143-2159`): `UFO_CONFIG_PATH` must stay beneath ROOT
  else `EXEC_PATH_OUTSIDE_ROOT`, escaped only by `UFO_FLEET_ALLOW_EXTERNAL_TOOLS=1`.
  With the escape flag and a missing file, the loader falls back to
  `source:"default"` built-ins (observed: minLanes 2 / waveMaxLanes 100).
- `loadSwarmPolicy` (`ufo-mission-result.mjs:2431-2530`): reads
  `sighting.dispatch.swarm`; `maxLanes` default 100 tighten-only (`Math.min`
  with `MAX_SWARM_LANES` L2415); `minLanes` default 2; `waveMinLanes` falls back
  to `minLanes`; `waveMaxLanes` falls back to `min(maxLanes,100)`; inverted wave
  band → `invalid_policy` L2517–2519; `globalRunnerCeiling` comes from
  `sighting.dispatch`, not `swarm`.
- `planSwarmWave` re-validates injected policies identically: positive-integer
  loop L781–785, `policyMaxLanes` L794–795, `policyFloor =
  min(waveMinLanes ?? minLanes ?? 2, policyMaxLanes)` L796–800, `policyCeiling =
  min(waveMaxLanes ?? policyMaxLanes, policyMaxLanes)` L801–805, inversion
  refusal L806–808. Lane gate: `laneFloor = policyFloor`,
  `laneCeiling = min(policyCeiling, cap)`, `cap = policyMaxLanes` tightened only
  by `spec.maxLanes` L853–864/979–983.
- **Refusal precedence:** `empty_wave` L978 → `impossible_band` L989–993 →
  `too_many_lanes` L995–996 → `too_few_lanes` L998–1002 → `wave_too_wide`
  L1004–1008 → `duplicate_expansion` L1012–1018 → `duplicate_resume_id`
  L1019–1025 → `resume_unknown_member` L1063–1066. Resume-only waves are
  floor-exempt.
- `SPEC_KEYS` L273: `wave,context,template,reportDir,maxLanes,items,priorRegistry,
  axes,milestone,hoist`. `ITEM_KEYS` L274.
- `counts:{spawn,resume,total}` L1250; `policy:{source,maxLanes,minLanes,
  waveMinLanes,waveMaxLanes,declaredMaxLanes,hardCeiling,rampBatchSize,
  rampIntervalMs,globalRunnerCeiling}` L1234–1249. `apply.mjs` reads
  `counts.total`/`counts.spawn` L630–631 and quotes `policy.waveMinLanes/
  waveMaxLanes` L629/634.

**Live config.** `config/ufo.json:87-95` swarm
`{maxLanes:100,minLanes:16,rampBatchSize:5,rampIntervalMs:700,waveMinLanes:16,
waveMaxLanes:32}`, `:78 globalRunnerCeiling:1056`.

**Refusals observed live:** `too_few_lanes` (15), `wave_too_wide` (33),
`too_many_lanes` (101), `duplicate_expansion`, `role_required`, `unknown_role`
(labrat), `resume_unknown_member`, `invalid_report_dir` (`../escape`),
`invalid_spec`, `invalid_policy`. `wave_registry_collision` L1484–1506 is
code-grounded only (needs a registry write).

**Added.** 2026-10-09 · lane `SubstrateWavePlanner` (revenger)