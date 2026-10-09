# ephemeral-fleet-policy — `config/ephemeral-fleet.machine.json`

Lane `EphemeralFleetPolicy` (scout). L1 re-read `prepare-ephemeral-fleet.mjs:84-105`.

- Schema `ufo-ephemeral-fleet-policy-v1`, sha `97683b26…`. Sole reader
  `readFleetPolicy` (`scripts/prepare-ephemeral-fleet.mjs:84`, path
  `FLEET_POLICY_PATH` :62). Also used by `scripts/land-fleet-run.mjs:27,50`.
- Validation:
  - regular file within `MAX_POLICY_BYTES`
  - exact top keys `schema, root, manifest, manifestSchema, receiptSchema,
    maxManifestBytes, home, childEnvironment`
  - exact `home` keys `allow, sanitize, deny, maxFileBytes, maxTotalBytes`
  - `home.allow` entries are clean relative paths
  - `home.sanitize` keys ⊆ `home.allow`
  - `maxManifestBytes ≥ 1024`; `home.max*Bytes ≥ 1`
  - `childEnvironment` keys are identifier-shaped with string values
- **Not type-checked**: `root`, `manifest`, `manifestSchema`, `receiptSchema`.
  `manifest` is `path.join`ed at :267/:280/:289 (`../x` would escape `runRoot`;
  low severity, needs a repo write).

| key | consumer |
| --- | --- |
| `home.allow` / `sanitize` / `deny` / `maxFileBytes` / `maxTotalBytes` | :188-192 / :159-165 / :156,:176 / :158 / :168 |
| `maxManifestBytes`, `manifest`, `manifestSchema`, `receiptSchema` | :266-289, :253, :361, :385 |
| `root` | :211 |
| `childEnvironment` | **test-only** (`prepare-ephemeral-fleet.test.mjs:137,148`); no production spawn uses it |

- `home.sanitize[".omp/agent/config.yml"] = ["auth"]`: `stripTopLevelKeys`
  (:139-150) strips top-level keys only. A probe showed it leaks a column-0
  sequence under a stripped key and misses quoted keys. On this host the global
  config has no top-level `auth`, so it is a no-op.
- Never a `--config`; zero references in `sync-ufo-contracts.mjs`.
