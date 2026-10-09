# consumer-map — the producer→consumer graph for the ephemeral surface

Asked: build the consumer graph for the prepared environment and prove whether
the repo's own tower-fleet launcher touches it. Source: `prepare-ephemeral-l1.mjs`,
`ufo-sighting.mjs`, `config/ephemeral-l1.machine.json`,
`<worktree>/sighting/tower-fleet.mjs`. Lane `ConsumerMap` (connector).

Tower-fleet grep: **EMPTY (exit 1)** for both `ephemeral|env-file|environment.json`
and `EPHEMERAL|bwrap|environment` in `sighting/tower-fleet.mjs`;
`buildLaunchArgv` (tower-fleet.mjs:487-503) emits no `--env-file`/`--substrate`;
the consumer branches (ufo-sighting:4565,4580,2414,4352) all skip when
`environment === undefined`. **The repo's fleet launcher never touches the
ephemeral surface.**

Attestation boundary — four strings in `config/ephemeral-l1.machine.json`:

| string | value | writer | enforcer |
| --- | --- | --- | --- |
| policy schema | `ufo-ephemeral-l1-policy-v1` | config:2 | prepare:110; base:211; sync-ufo-contracts:1814 |
| environment schema | `ufo-ephemeral-l1-environment-v1` | prepare:707 | ufo-sighting:35 |
| marker schema | `ufo-ephemeral-l1-root-v1` | prepare:718 | ufo-sighting:127,4306; prepare:778,839 |
| marker name | `.ufo-ephemeral-l1.json` | prepare:729 | ufo-sighting:115,4292; prepare:765,829 |

Producer→consumer rows:
- `environment.json` content `{schema,ephemeralRoot,environment}` — producer
  prepare:706-715 → consumers ufo-sighting:111-112,35,46-55 (load/validate),
  :2090 (manifest revalidate), :4353-4355 (pane-start reload + byte-identity),
  :4182-4183,4286 (bwrap child env).
- `environment.json` path `<root>/isolation/environment.json` — producer
  prepare:711 → consumers ufo-sighting:129 (marker attestation), prepare:786,
  864-865 (destroy/force).
- marker `<root>/.ufo-ephemeral-l1.json` (state prepared, pids []) — producer
  prepare:717-737 → consumers ufo-sighting:115-133, transition :4291-4334;
  destroy :756-812; force identity :832-843.
- policy file — producer: committed config → consumers prepare:92;
  base:209-245 (`EPHEMERAL_POLICY`); `sync-ufo-contracts.mjs:21,1814`;
  `the-tick.machine.json:33-37` + `the-tick-config.mjs:246-249,386-389`
  (field must select root) → `the-tick-ping.mjs:660,685`,
  `ufo-ground-handler.mjs:145`.
- resolver snapshot — producer prepare:454-457 → consumer ufo-sighting:4214-4224,
  4227-4233, 4284 (`--ro-bind`).
- `childEnvironment` — producer config:30-39 → consumer ufo-sighting:4182-4183
  (overlay order: childEnvironment **then** environment), :4201-4204.
- lifecycle — `prepared` (create) → `registered` (launch :2415; rollback
  :2429/:2443) → pane start (`["registered"]` + byte-identity :4353-4355;
  substrate/argv/cwd guards :2393-2397) → `active` :4367 → `finished` :4391 →
  destroy accepts `prepared|finished` only.

Key-set traps: `PATH_VARIABLES` must exact-match policy `pathVariables` **with**
length or every launch fails `INVALID_ENVIRONMENT` (ufo-sighting:46); the disk
file is 3 keys (:111) while the stored shape is 4 with the loader-injected
`envFile` (:34,:112).

## Unknowns

- Non-scripts consumers of the policy/marker (audited within `scripts/`,
  `tests/`, `config/`, `docs/` only).