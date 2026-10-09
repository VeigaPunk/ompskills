# drill-schema — the `ufo-drill-v1` load contract

Asked: what `loadDrills` (`scripts/ufo-drills.mjs:793-1127`) enforces per key, per status, per executor.
Anchor: `ufo-fsd-alpha@5ace2559` (read-only); `config/ufo.json` cited from the working copy (sha256 `0e416f0a…`, uncommitted swarm-band edit only). Lanes: `DrillSchema`, `CoverageRatchet`.

## Key sets (`:95-131`, all closed)
- `DRILL_KEYS`: schema, id, status, executor, invariant, spec, summary, notes, pendingReason, references, retain, setup, run, expect, test.
- `SETUP_KEYS`: env, mutate, pathExclude, refreshContractHash, scenario, transcriptPatch, write. `RUN_KEYS`: argv, concurrency, cwd, realRepo, review, rounds, substrate, task, timeoutSecs. `TEST_KEYS`: file, name, package, suite. `PATCH_KEYS`, `WRITE_KEYS` (json, path, text), `MUTATE_KEYS` (append, delete, jsonSet, path).
- `DRILL_STATUSES` = wired + `PLACEHOLDER_STATUSES` (pending-mechanism, referenced). **There is no `completed` status** — the two `"status":"completed"` hits are nested transcript data in `drills/d-double.drill.json:65,71` (a prior substrate-keeper count of "completed 2" was a grep false positive).
- `EXECUTORS`: self-iter, sync-check, cargo-test, node-test, judge-handoff, shell.

## Per status
| key | wired | pending-mechanism | referenced |
| --- | --- | --- | --- |
| schema / id / status | `ufo-drill-v1`; id == filename stem, single safe segment | same | same |
| executor | required | forbidden | forbidden |
| expect | ≥1 counted assertion (vacuous pass refused) | forbidden | forbidden |
| setup / run / test / retain | optional | forbidden | forbidden |
| references | forbidden | forbidden | required, each resolves to a regular file inside root |
| pendingReason | allowed, unchecked | required non-empty | allowed, unchecked |

## Per executor (load time)
cargo-test: `test.name`; node-test: `test.name` + `test.file`; shell: `run.argv` non-empty string array; self-iter, sync-check, judge-handoff: nothing required. cargo-test/node-test forbid `setup.write|mutate|transcriptPatch`; judge-handoff forbids `write|mutate`; `realRepo` shell forbids all three; `run.realRepo` may only be `true`.

## Containment
`assertContainedPath` (`:175-181`, lexical: no `.`/`..` segments, no leading `/`, no drive letter, no NUL) on test.file, retain, expect.artifacts(+Absent), transcriptPatch.file, write.path, mutate.path, run.cwd. `transcriptPatch` cannot target `handoff.json`. Runtime twin `assertShadowPath` + `beneath` in `buildShadow`.

## Exit codes
`fail()` throws `DrillFormatError` → `ufo-drills: <msg>` on stderr, **exit 2** (`:1718-1724`). Exit 2 also covers argv refusals, `no drill <id>`, and a failed `cargo build`. A drill file containing `null` throws `TypeError` at `:806` → uncaught, exit 1 (escapes the typed path). `--list` runs the full loader, so it is a cheap corpus validator.

## Gaps
- `invariant`, `spec`, `summary`, `notes` are type-unchecked; 38 files omit `invariant`, 13 omit `spec`; compound spec values (`11/T18`, `06/A-06`, …) exist.
- Foreign-executor optional keys (e.g. `scenario` on cargo-test) are accepted and ignored; `setup.pathExclude` is not array-checked.
