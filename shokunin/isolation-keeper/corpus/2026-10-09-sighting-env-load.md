# sighting-env-load — the consumer's environment reader

Asked: establish the exact-key set, containment rules, marker gate, and error
code of the sighting env reader. Source: `scripts/ufo-sighting.mjs:31-135`;
`scripts/ufo-sighting-lib/base.mjs:105-112,247-249,327-329,332-374,480-486`. Lane
`SightingEnvLoad` (reviewer).

Error code: `environmentFail` names **`INVALID_ENVIRONMENT`**
(base.mjs:327-329 → `fail`, 247-249 → `SightingError` 105-111); live transcript
confirms `{name:"SightingError", code:"INVALID_ENVIRONMENT"}`.

Exact key sets: stored shape `[schema, ephemeralRoot, environment, envFile]`
(:34); the disk file is `[schema, ephemeralRoot, environment]` (:111) with
`envFile` **injected** at :112; the inner map is exactly
`pathVariables ++ flagVariables` — 11 keys (:45-46).

Policy values: `environmentSchema "ufo-ephemeral-l1-environment-v1"` (:6),
`markerSchema "ufo-ephemeral-l1-root-v1"` (:5), `marker ".ufo-ephemeral-l1.json"`
(:4), `maxEnvironmentBytes 16384` (:7).

Rules:
- `value.schema !== environmentSchema` → `environment schema is unsupported`
  (:35).
- `ephemeralRoot`: string, absolute, `resolve(x)===x`, no NUL → `ephemeral root
  must be an absolute canonical path` (:36-39); then private-owned + realpath
  canonical (:66-67).
- `envFile` and every pathVariable: absolute + canonical + **beneath** the root
  (:40-43, :47-53). `beneath` is strict (`candidate === root` is false, base:
  345-348), so an envFile directly under the root fails the dirname chain check
  (:113) with `environment file must be beneath the declared ephemeral root`.
- `OPENCODE_DB` filesystem arm (:70-76): chain-validates `path.dirname(candidate)`,
  not the file; if it exists, `lstat` → `OPENCODE_DB must not be a symlink` (:74)
  → `assertPrivateOwned(..., "file")` (:75). A **missing** DB file is legal.
- Marker gate (:127-134): six predicates → one refusal `ephemeral marker does
  not attest the required inactive root state`: `schema === markerSchema`,
  `root === stored.ephemeralRoot`, `envFile === envFile`, `Array.isArray
  (activePids)`, `activePids.length === 0`, `allowedMarkerStates.includes
  (state)`. Default `allowedMarkerStates = ["prepared"]` (:84); `runPane` passes
  `["registered"]` (:4353) plus a structural-equality recheck `environment file changed
  after mission registration` (:4354-4356); `main` (:4567) uses the default.

Helpers: `assertExactKeys` → `<label> contains unsupported fields` (base:341);
`assertPrivateOwned` → `is owned by another user` (:352) / `must be owner-only`
(mode `& 0o077 !== 0`, :354) / `must be a directory|regular file` (:355-356);
`assertRealPrivateDirectoryChain` → `must be beneath the declared ephemeral root`
(:360) / `directory is missing` (:369) / `must not traverse symlinks` (:371) /
`must be canonical` (:374).

Observed nuance: `readBoundedUtf8` (base:480-486) throws a **plain Error**, so
its bound trip is retyped to `environment file is not valid JSON` (:108) /
`ephemeral marker is missing or malformed` (:125) — the `instanceof SightingError`
rethrow preserves only typed failures raised inside the same try. Typing stays
`INVALID_ENVIRONMENT`; the message is inaccurate.

## Unknowns

- Whether called out of scope (`prepare` places the env file one directory deep
  under the root — confirmed by the create-layout lane; the reader's strict
  `beneath` is satisfied).