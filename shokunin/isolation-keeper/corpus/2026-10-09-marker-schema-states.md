# marker-schema-states — the marker document and its reader reconciliation

Asked: establish the marker's field set as writers and readers require it, and
reconcile writer/reader expectations. Source:
`scripts/prepare-ephemeral-l1.mjs:717-737,774-810`;
`scripts/ufo-sighting.mjs:127-133,4291-4334`. Lane `MarkerSchema` (scout).

File: `<root>/.ufo-ephemeral-l1.json` (machine config:4); schema
`ufo-ephemeral-l1-root-v1` (:5).

Writer fields (10, `createEphemeralL1` :717-737): `schema`, `root`, `clone`,
`isolationRoot`, `envFile`, `sourceRoot`, `sourceHead`, `snapshotDigest`,
`state: "prepared"`, `activePids: []`. Written `O_EXCL|O_NOFOLLOW`, 0600,
`flush:true`, bounded by `maxEnvironmentBytes` (:733-735).

Reader expectations:
- `readValidatedMarker` (prepare:774-810) requires all 10 keys; it
  semantically checks `schema, root, clone, isolationRoot, envFile, sourceHead,
  snapshotDigest, state, activePids` and carries `sourceRoot` **presence-only**.
- `loadMissionEnvironment` (ufo-sighting:127-133) checks `schema`, `root`,
  `envFile`, `activePids` (array + length 0), `state` ∈ `allowedMarkerStates`.
- `transitionEphemeralMarker` (ufo-sighting:4306,4315-4323) checks `schema`,
  `root`, `state`, `activePids`, and preserves all others via `{...marker}`
  spread.

Not read by `ufo-sighting`: `clone`, `isolationRoot`, `sourceRoot`, `sourceHead`,
`snapshotDigest`. `sourceRoot` is **never value-checked anywhere** — presence
only. `load` does **not** apply `assertExactKeys` to the marker (only to the env
file at :111), so no exact-key contract may be asserted for the load reader.

State set: `prepared`, `registered`, `active`, `finished`. Writers:
`prepared` at create (:726) and on rollback (ufo-sighting :2429/:2443/:4361);
`registered` at :2415; `active` at :4367; `finished` at :4391.

## Unknowns

- No producer outside the scanned checkout was found for the marker fields
  `ufo-sighting` ignores (absence asserted only within scan scope).