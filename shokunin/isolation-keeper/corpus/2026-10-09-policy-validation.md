# policy-validation — `readPolicy` and its helper guards

Asked: quote every validation `readPolicy` performs and the exact error string
each raises. Source: `scripts/prepare-ephemeral-l1.mjs` lines 1-180 +
`config/ephemeral-l1.machine.json`. Lane `PolicyValidation` (scout).

Constants: `MAX_POLICY_BYTES = 256*1024` (:33), `SIMPLE_NAME`
`/^[A-Za-z0-9][A-Za-z0-9._-]{0,95}$/u` (:39), `SCHEMA_TOKEN`
`/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/u` (:40), `ENV_KEY`
`/^[A-Za-z_][A-Za-z0-9_]*$/u` (:41), `PATH_VARIABLES` frozen 8 keys (:42-54).

Helpers: `plainObject` (`${label} must be an object`), `exactKeys`
(`${label} has unsupported fields`), `policyRelativePath` (`must be a relative
path` / `must be a canonical relative path`), `environmentMap` (`contains an
invalid variable name` / `values must be NUL-free strings`).

Rule → error table (line → message):

| rule | line | message |
| --- | --- | --- |
| lstat not symlink and isFile | 93-95 | `ephemeral policy must be a real regular file` |
| pre/post-read size > 256 KiB | 97-104 | `ephemeral policy exceeds 262144 byte bound` |
| exact 11-key set | 106-109 | `ephemeral policy has unsupported fields` |
| `schema === "ufo-ephemeral-l1-policy-v1"` | 110 | `unsupported ephemeral policy schema` |
| root absolute + `resolve(root)===root` + no NUL | 111-112 | `ephemeral policy root must be absolute and canonical` |
| marker `/^\.[A-Za-z0-9][A-Za-z0-9._-]{0,95}$/u` | 114 | `ephemeral policy marker is invalid` |
| `SCHEMA_TOKEN(markerSchema) && SCHEMA_TOKEN(environmentSchema)` | 115-116 | `ephemeral policy schema names are invalid` |
| `maxEnvironmentBytes` safe int ≥ 1024 | 118-119 | `ephemeral policy environment bound is invalid` |
| `pathVariables` exact set **including length** | 121-129 | `ephemeral policy path variables must name exactly the emitted path keys` |
| `flagVariables` env map | 131 | env-map messages |
| flag keys ∩ `PATH_VARIABLES` = ∅ | 132-135 | `ephemeral policy flags must not shadow path variables` |
| `childEnvironment` env map | 137 | env-map messages |
| `childEnvironment.PATH` non-empty string | 138-140 | `ephemeral child environment must define PATH` |
| sandbox exact 4-key set + shapes | 142-160 | `ephemeral sandbox policy ...` variants |
| opencode exact 5-key set + `SIMPLE_NAME` names | 162-174 | `ephemeral OpenCode ...` variants |

The r13 duplicate-length clause (:121-127) exists because a duplicated
`pathVariables` entry satisfies a `Set` size check yet emits an
`environment.json` whose key list the consumer rejects with a misleading
`INVALID_ENVIRONMENT` — so equality is checked *with* length.
`flagVariables` must not shadow a path variable or an operator string would
silently replace an isolation path (:132-135). `childEnvironment.PATH` is
load-bearing: `ufo-sighting` resolves `bwrap` through it.

Real probes (module import, read-only): a duplicate `pathVariables` entry and a
flag shadowing a path variable both throw the messages above.

## Unknowns

- Whether a policy with `maxEnvironmentBytes` between 1 and 1023 passes
  `base.mjs` (floor 1) but fails `readPolicy` (floor 1024) matters only for a
  hand-shrunken policy; no compliant mission exists under either.