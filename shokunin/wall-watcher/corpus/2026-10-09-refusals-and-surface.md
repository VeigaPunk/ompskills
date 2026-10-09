# 2026-10-09 — refusal codes, exit codes, and the `surface --json` manifest

**Asked:** enumerate the wall CLI's typed refusal codes and exit codes; document `surface --json` and the
surface digest.

**Sources (exact; `ufo` = `/home/vgpnk/Projects/ufo-fsd-alpha`)**

- `ufo/scripts/ufo-sighting-lib/base.mjs:105-112, 116-137, 247-249` — `SightingError`, `fail`, `emitFatal`.
- `ufo/scripts/ufo-sighting.mjs:4686, 4705` — unknown-verb refusal + the `main().catch(emitFatal)` bootstrap.
- `ufo/scripts/ufo-sighting.mjs:3839-3867` — `parseNamedOptions` usage refusals.
- `ufo/scripts/ufo-sighting-lib/surface.mjs:13-18, 24, 26-46, 48-57, 59-254, 303-325` — digest inputs,
  `SURFACE_KIND`, `surfaceScriptDigest`, `FAIL_CODE_PATTERN`/`surfaceErrors`, `surfaceManifest`, help/legacy.
- `ufo/scripts/sync-ufo-contracts.mjs:471-484, 534-571` — how `sighting.surfaceDigest` is computed/checked.
- `ufo/config/ufo.json:59` — `sighting.surfaceDigest`.
- Probes: `surface --help` (exit 0), bare `surface` (exit 2), `surface --json` (exit 0);
  `surfaceErrors()` count; `surfaceManifest().exitCodes`.

**Observed**

- `fail(code, message, details)` throws `SightingError`; `emitFatal` writes
  `{ok:false, code, message[, details]}` as one JSON line to **stderr** and sets `process.exitCode = 2`.
  So **every typed refusal exits 2**, stdout stays clean, and usage errors (unknown verb, bad flag,
  missing/duplicate value) are typed refusals too (`INVALID_ARGUMENT`) — **this CLI has no exit 64**.
- Exit 0 also covers: the verb help idiom `<verb> --help|-h` (first token only), the full-usage fallback
  for an unknown verb, `help`/`--help`, and idempotent no-ops (e.g. `remove` on an absent row). The one
  non-2 exception is the legacy native-direct path, which adopts the child's status with a 2 fallback
  (a fake `omp` exiting 7 yields 7).
- `surfaceErrors()` extracts every `fail("CODE"` literal by regex over the full source text of the six
  digest files, so the manifest's `errors` array is the authoritative refusal list: **73 distinct codes**
  from 247 sites. Unrecognized faults surface as `UNEXPECTED_ERROR` (not in the 73 — it is emitted, not
  `fail`-declared).
- `surface --json` requires `--json` (bare `surface` → `INVALID_ARGUMENT`); its top-level keys, in order:
  `kind`, `scriptDigest`, `digestInputs`, `exitCodes`, `verbs`, `extras`, `missionId`, `nonLiveOutcomes`,
  `bounds`, `caps`, `errors`. `kind = "sighting-surface-v1"`. `verbs` carries 12 verbs
  (open, launch, complete, remove, steer, peek, status, overview, reconcile, respawn-terminal, inquiry,
  resume); `extras` carries register, twin, help.
- Digest coverage (`surfaceScriptDigest`): the six files `scripts/ufo-sighting` →
  `scripts/ufo-sighting.mjs` → `scripts/ufo-sighting-lib/{base,argv,observe,surface}.mjs` in that fixed
  order, sha256 over their **concatenated bytes**; `digestInputs` carries each file's own sha256.
- The config's `sighting.surfaceDigest` is a **different** quantity: `sha256(canonicalJson(manifest))` over
  the whole manifest with sorted object keys (arrays not sorted, so `digestInputs`/`errors` order is
  charter-frozen), computed/checked by `sync-ufo-contracts.mjs` via a fresh `surface --json`.
  Observed in the live tree: `scriptDigest` = `sha256:e4f4d56f…` (reproduced by hashing the six files),
  canonical manifest digest = `sha256:8884924f…`, declared config value = `sha256:666cd0a1…` →
  **declared ≠ computed (drift)**. This is substrate config drift, operator-owned; the corpus must not
  compare `scriptDigest` to `sighting.surfaceDigest` — they are different algorithms.

**Changed:** nothing.

**Unknown:** whether the `surfaceDigest` drift is a pending operator sync or an unintended edit (the live
`config/ufo.json` also carries uncommitted swarm-band edits, so the working tree is dirty).