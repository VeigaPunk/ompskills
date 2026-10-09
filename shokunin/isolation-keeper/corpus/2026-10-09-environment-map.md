# environment-map — the emitted record and the consumer's exact-key mirror

Asked: establish the emitted environment map, its attestation fields, and the
consumer's exact-key expectation. Source:
`scripts/prepare-ephemeral-l1.mjs:537-555,706-714`;
`scripts/ufo-sighting.mjs:34-80,111-112`; `config/ephemeral-l1.machine.json:15-29`.
Lane `EnvironmentEmission` (reviewer).

`environmentPaths(isolationRoot)` (:537-555) hardcodes the 8 path keys
(`HOME`→`home`, `XDG_CONFIG_HOME`→`config`, `XDG_DATA_HOME`→`data`,
`XDG_CACHE_HOME`→`cache`, `XDG_STATE_HOME`→`state`, `TMPDIR`→`tmp`,
`OPENCODE_CONFIG_DIR`→`config/opencode`, `OPENCODE_DB`→`data/opencode/opencode.db`,
all under the isolation root) and self-checks drift against `PATH_VARIABLES`
(:550-553).

The emitted file (`createEphemeralL1` :706-714) is exactly
`{schema, ephemeralRoot, environment}`:
`schema = policy.environmentSchema = "ufo-ephemeral-l1-environment-v1"`,
`ephemeralRoot = <configuredRoot>/<id>`, `environment = {...paths,
...policy.flagVariables}` — 8 path keys + 3 flags
(`OPENCODE_DISABLE_AUTOUPDATE|DEFAULT_PLUGINS|EXTERNAL_SKILLS = "true"`), **11
keys, no credential values**. `Buffer.byteLength > maxEnvironmentBytes` (16384)
throws **before** the write, unwinding into the create rollback — no partial
mission.

Consumer mirror:
- `assertExactKeys(value, ["schema","ephemeralRoot","environment","envFile"])`
  (ufo-sighting.mjs:34) applies to the **stored** 4-key shape; the disk file is
  3 keys (:111) and `envFile` is *injected* at :112 — never written.
- `assertExactKeys(value.environment, [...pathVariables, ...flagKeys])` (:46)
  equals the emitted 11-key set; flag values are pinned verbatim (:54-56).
- `schema !== environmentSchema` → `environment schema is unsupported` (:35).
- Every path: absolute + canonical + **beneath** the root (:47-53), then
  `assertRealPrivateDirectoryChain` per key (:68-80); `OPENCODE_DB` may be
  absent, but if present must not be a symlink (:70-76).

Producer and consumer both load `config/ephemeral-l1.machine.json` — producer
via `POLICY_PATH` (:30), consumer via `readEphemeralPolicy` (base.mjs:209-237).
A `pathVariables` duplicate fails the producer's length-inclusive exact-set rule
and would make every launch fail `INVALID_ENVIRONMENT` with a misleading
message — hence the length clause.

## Residual

- The consumer loader byte-bound floor is `1` (base.mjs:221) vs the producer's
  `1024` (prepare:118); a hand-shrunken policy fails `readPolicy`, so no
  compliant mission exists under the lower floor.

## Unknowns

- No live runtime capture of `environment.json` (create would write under the
  policy root; the nearest executed evidence is the test transcript).