# swarm validator surface (`ufo-swarm-wave.mjs`)

**Asked:** document the exact CLI + output contract of the swarm wave validator.
**Source:** `/home/vgpnk/Projects/ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs` (1907 lines). Lines are that file's.

## Observed

- Verbs: `plan` / `run` / `record` (`main` L1801; `record` -> `mainRecord` L1628; anything
  else -> usage). Exit codes: 0 ok, 1 invalid spec/plan, 64 usage (L116, `emitUsageError` L1349).
- Spec sources: exactly one of `--spec <file>` / `--spec -` (stdin) / `--spec-json <json>`
  (L1822-1829); both or neither -> usage. `--emit-tasks` is plan-only (run + it -> usage,
  L1831-1832). `readSpecSource` L1401; spec bound `MAX_SPEC_BYTES` 1 MiB (L153).
- Schemas (module constants): `ufo-swarm-wave-v1` L143, `ufo-swarm-wave-error-v1` L144,
  `ufo-swarm-wave-dispatch-v1` L145, `ufo-swarm-registry-v1` L146.
- `plan` payload: `schema`, `wave`, `context`, `policy` (source/maxLanes/minLanes/waveMinLanes/
  waveMaxLanes/declaredMaxLanes/hardCeiling/rampBatchSize/rampIntervalMs/globalRunnerCeiling),
  `counts{spawn,resume,total}`, `compaction`, `dispatch{calls,kind,note}`, `registry`, `priorRegistries`,
  `tasks` (L1230-1301).
- Task entries: spawn `{name, agent: <role>, task}` (L1183); resume `{name, resume, member, item, message}`
  (L1127/L1142). Lane names default `Swarm<camelRole>NN`, must match
  `TASK_NAME_PATTERN /^[A-Z][A-Za-z0-9]{1,31}$/u` (L271, L1108-1114).
- `run` payload: `ufo-swarm-wave-dispatch-v1`; `taskCall = spawns.length > 0 ? {context, tasks: spawns} : null`
  (L1334-1335, resume-only is null with zero task calls) plus `resumeSends: resumes` (L1336).
- `run` persists the registry at `reportDir/swarm-registry.json` (else
  `.ufo/scopes/<wave>/swarm-registry.json`, `registryRelPath` L420) via `persistWaveRegistry`
  L1464, before emit (L1875), under `withRegistryLock` (L670); root-gated by `gatedRegistryPath`
  L431. Doc shape `buildRegistryDoc` L640: `{schema,wave,createdAt,updatedAt,[reportDir],[priorRegistries],members}`;
  spawn member `{kind:"spawn",agentId:null,role,item,[axes],[milestone]}` (L1145), resume
  `{kind:"resume",agentId:null,member,item,...}` (L1123).
- `record --registry <relative path> --assignments <json>`: registry must already exist
  (`required:true` L1653); `--assignments` is a `{memberName: agentId}` JSON object <= 1 MiB;
  ids must match `RESUME_ID_PATTERN /^[A-Za-z0-9][A-Za-z0-9._:/-]{0,255}$/u` (L272); same-id
  re-record is idempotent (L1781).

## Refusals seen in this file (validator-side)

`invalid_spec`, `invalid_policy`, `invalid_report_dir`, `invalid_registry_path`,
`invalid_registry`, `invalid_assignments`, `invalid_agent_id`, `empty_wave`, `too_many_lanes`,
`too_few_lanes`, `wave_too_wide`, `impossible_band`, `duplicate_name`, `duplicate_resume_id`,
`duplicate_expansion`, `role_required`, `unknown_role`, `message_with_prompt`,
`spawn_message_forbidden`, `resume_role_forbidden`, `resume_item_forbidden`,
`resume_meta_forbidden`, `resume_unknown_member`, `unknown_member`, `conflicting_assignment`,
`wave_registry_collision`, `registry_lock_timeout`, `registry_lock_unsafe` (plus
`route_unreachable` / `prior_refinement_refused` from imported modules).

## Remaining unknown

Exact band provenance (`loadSwarmPolicy`) and the route-preflight/refinement codes live in
imported modules (`ufo-mission-result.mjs`, `ufo-route-preflight.mjs`, `ufo-refinement-context.mjs`).
