# orchestration-config-struct — `config/orchestration.json`

Asked: the Rust contract behind the file, defaults when absent, validation, and which verbs read it.
Anchor: `ufo-fsd-alpha@5ace2559` (read-only); `config/ufo.json` cited from the working copy (sha256 `0e416f0a…`, uncommitted swarm-band edit only). Lane: `OrchestrationConfigStruct`.

## Observed
- **The file is absent** from the working tree and HEAD (not gitignored). Historic blobs `b2696a13`/`0c190b66` live only on `refs/remotes/cursor/*` and use an incompatible legacy shape. `reports/nc6/substrate/substrate-review.md:78`: "intentionally absent (fixture-loop optional surface)".
- Loader: `load_config` (`crates/ufo-core-runtime/src/loop_driver.rs:506-516`): `if path.is_file()` → bounded read (`MAX_CONFIG_BYTES = 4 MiB`, `:111`) → serde → `validate()`; else `OrchestrationConfig::default()`.
- Struct `OrchestrationConfig` (`config.rs:307-340`, `deny_unknown_fields`, snake_case top level): required `task, max_rounds, concurrency, axes, enable_godspeed`; `substrate` defaults `"omp"`; optional `recovery, budgets, membrane, rounds` (each `Option`, `skip_serializing_if`, so absent blocks keep digests byte-identical). Nested blocks are camelCase and `deny_unknown_fields`.
- Default (`config.rs:342-357`): task `"UFO-FSD self-iteration"`, `max_rounds 6`, `concurrency 64`, `axes = AxisSet::self_iter_default()` (implementation/testing/adaptability/portability, all subjective), `enable_godspeed true`, all optional blocks `None`.
- `validate` (`config.rs:364-408`): `unsupported substrate`, `task must be non-empty`, `max_rounds must be ≥1` / `≤10000`, `concurrency must be 1..=64`, axis-set errors, `axis '<id>' declares kind 'evidence': fixture loops cannot produce handoff evidence (spec 05)`, then nested validators.
- Only `ufo plan` (`crates/ufo-cli/src/main.rs:363`) and `ufo self-iter` (`:482`) reach `load_config` (via `LoopDriver::open`). `self-iter` then **overwrites** task/max_rounds/concurrency/substrate from CLI flags (`:479-486`); only `plan` honours the file's values.

## Drift
- `enable_godspeed` required by serde though `Default` sets `true` — a file omitting it fails to parse.
- A non-regular path (dir, FIFO, dangling symlink) fails **open** to defaults (`is_file()` false).
- Loader errors exit 1 with `ufo: parse <path>` — the serde reason and the file name (for validate errors) are dropped; `main.rs:15` after_help promises exit 2 + `{ok:false,kind}` for validation.
- This is the surface drills write into their shadow (`setup.write` `config/orchestration.json` in `d-herd`, `d-i1-second-l1`).
