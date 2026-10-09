# 2026-10-09 — wave validator CLI contract

**Asked.** What is the contract of `ufo-swarm-wave.mjs` — verbs, spec shape,
schemas, band gates, resume rules, registry, env gating? (Lane
`WaveValidatorCli`, scout; substrate read-only.)

**Observed.** Source: `/home/vgpnk/Projects/ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs`
(1907 lines; shared hub `ufo-mission-result.mjs`).

- Verbs: `plan` validates the spec and emits the `ufo-swarm-wave-v1` plan (or
  `plan.tasks` with `--emit-tasks`, or `{context,tasks}` when compaction
  applied); `run` validates, persists the registry via `persistWaveRegistry`,
  and emits the `ufo-swarm-wave-dispatch-v1` payload
  `{schema, wave, policy, counts, registry, handlesReset?, compaction?,
  routePreflight?, priorRefinement?, taskCall: {context,tasks}|null,
  resumeSends[], note}`; `record --registry <path> --assignments <json>` fills
  agent ids and emits `{path, …ufo-swarm-registry-v1 doc}`.
- Spec keys: `wave, context, template, reportDir, maxLanes, items,
  priorRegistry, axes, milestone, hoist`. Item keys: `item, prompt, role,
  resume, message, name, axes, milestone`.
- Schemas: plan `ufo-swarm-wave-v1`; dispatch `ufo-swarm-wave-dispatch-v1`;
  registry `ufo-swarm-registry-v1`; error `ufo-swarm-wave-error-v1`.
- Band gates: `empty_wave` (total 0); `impossible_band` (spawns > 0 and
  laneCeiling < laneFloor); `too_many_lanes` (total > cap); `too_few_lanes`
  (spawns > 0 and total < laneFloor); `wave_too_wide` (spawns > 0 and total >
  laneCeiling); `invalid_policy` (bad/inverted policy band, non-integer keys,
  `globalRunnerCeiling`); `duplicate_expansion` (identical expanded prompts);
  `duplicate_resume_id`; `duplicate_name`; `resume_unknown_member`;
  `wave_registry_collision` (cross-wave overwrite of assigned handles).
- Resume rules: forbidden keys — `role` → `resume_role_forbidden`, `item` →
  `resume_item_forbidden`, `axes`/`milestone` → `resume_meta_forbidden`,
  `message`+`prompt` together → `message_with_prompt`, `message` on a spawn →
  `spawn_message_forbidden`. Ownership: the `agentId` must be in this wave's
  registry or a declared `priorRegistry`; the own registry wins on collision;
  revalidated under the registry lock at persist. Spawns require `role`
  (`role_required`) inside `SWARM_ROLES` (`unknown_role`).
- Registry: path `reportDir/swarm-registry.json`, else
  `.ufo/scopes/<wave>/swarm-registry.json` (scope segment `wave` when
  unnamed); locked via `<registry>.lock` dir (`withDirLock`) and written
  atomically; doc `{schema, wave, createdAt, updatedAt, reportDir?,
  priorRegistries?, members{name → {agentId, item, role, kind, member?, axes?,
  milestone?}}}`.
- Env: `UFO_CONFIG_PATH` (gated via `gatedConfigPath`; refusal
  `EXEC_PATH_OUTSIDE_ROOT`), escape `UFO_FLEET_ALLOW_EXTERNAL_TOOLS=1`
  (`ALLOW_EXTERNAL_TOOLS`), root `UFO_PROJECT_ROOT`. Exit codes: 0 ok; 1
  invalid spec/plan (JSON on stderr); 64 usage.

**Changed.** Nothing — read-only research.

**Unknown.** The CLI was not executed; the effective
`config/ufo.json` `sighting.dispatch.swarm.*` values were not read by this
lane; the test-suite assertions were not run.
