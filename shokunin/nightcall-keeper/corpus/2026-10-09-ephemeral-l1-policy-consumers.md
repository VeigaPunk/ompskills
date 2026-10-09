# ephemeral-l1-policy-consumers — who reads `config/ephemeral-l1.machine.json`

Lane `EphemeralL1PolicyMap` (scout). L1 re-read `ufo-sighting-lib/base.mjs:209-239`.
Internals belong to isolation-keeper; this entry covers the consumer level.

Three independent loaders of one file (sha `9d0184a4…`, 1373 bytes, 11 top keys,
no model key):
1. `scripts/prepare-ephemeral-l1.mjs` `readPolicy` :92 (`POLICY_PATH` :30). Full
   validation; used by create :659, destroy :814, and the CLI :920.
2. `scripts/ufo-sighting-lib/base.mjs` `readEphemeralPolicy` :209-239. A
   **subset** check (schema, `pathVariables` array, truthy
   `flagVariables`/`childEnvironment`/`sandbox`, `maxEnvironmentBytes ≥ 1`, two
   schema strings, `marker`). It reads unbounded and does not check `root` or
   `sandbox.executable`. Refusal: `config/ephemeral-l1.machine.json is invalid`.
   It is frozen into `boot` (:241).
3. `scripts/the-tick-config.mjs` `resolvePolicyRoot` :311-357. Reads `schema` and
   `root` only. It requires a non-symlink regular file owned by the euid, which
   the-tick's `pathPing.allowedPathRoots.ephemeralL1 = {policy, schema,
   field:"root"}` points at (`the-tick.machine.json:33-37`).

- `sync-ufo-contracts.mjs:1814` runs `readPolicy` as the validator, and
  :1847-1848 rejects a `model` key. The gate is stronger than the runtime loader.
- Correction to `shokunin/isolation-keeper/corpus/2026-10-09-machine-config-keys.md`:
  "root is prepare-only" is wrong once the-tick is counted (the-tick reads
  `root`). Its base.mjs schema line is :211, not :209.
