# watchdog-and-host-64s — the watchdog's numbers and the three 64s

Asked: the numeric use in `scripts/ufo-stale-watchdog.mjs`, and the 64-valued ceilings.
Lane `WatchdogBand`, corroborated by `RustSightingMirror` and `CeilingRelations`.

Watchdog: it reads `waveMinLanes` live (`:799-801`); `l2 < waveMin` (`:861`) gives an **advisory steer** with no exit.
Constants: `POLL_MS` 300000 (`:132`), `STALE_MS` 1200000 (`:133`, `age >= STALE_MS`), `MAX_NUDGES` 2 (`:134`, `<`), `MAX_REFIRE_ATTEMPTS` 3 (`:135`, `>=`),
`MAX_REPEND_ATTEMPTS` 12 (`:136`, `>=`), `L2_TARGET` 16 fallback (`:142`). `minLanes` → `roundTarget` (`:803`) is steer text only.
Header text "16-100 / 64-lane round" matches neither HEAD nor the working tree. The test comment `ufo-stale-watchdog.test.mjs:306` says 16/100.

The 64s are unrelated units that share a literal:
| knob | where | enforced |
| --- | --- | --- |
| `waves.hostCeiling` 64 | `packages/substrate-lib/schemas/substrate-capabilities.json:28` | `lane-cli.mjs:202` reads with a silent `?? 64`; `self-iter-delegate.mjs:271-281` `--concurrency` 1..=bound, exit 5 |
| `SELF_ITER_WORKER_CONCURRENCY_DEFAULT` 64 | `crates/ufo-core-runtime/src/config.rs:20` | `config.rs:377-380`; `ufo-cli/src/main.rs:57` clap `range(1..=64)` (exit 2, `cli_contract.rs:815-838`) |
| `self-iter.sh` 64 | `scripts/self-iter.sh:68` | wrapper reject |
| `l3Evidence.concurrencyCeiling` 64 | cfg:164 | `l3_swarm.rs:351-354` equality |

The only config 64 is `l3Evidence`. The JS `hostCeiling` and the Rust default are linked by a comment, not a test (`self-iter-delegate.mjs:274-276`).
