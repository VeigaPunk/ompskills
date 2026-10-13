# ufo-cli verb surface and ownership

Asked: every verb `ufo` owns, what it calls, exit codes, what
`tests/cli_contract.rs` pins. Substrate `5ace2559` (lanes CliVerbs,
VerbsOwned, CliStateFiles).

## The 11 verbs (main.rs:22-95 `enum Command`, dispatch :177-216)

| verb | does | calls | mutating? |
| ---- | ---- | ----- | --------- |
| `status` | canonical runtime/contracts/command surface | runtime, in-process | read-only |
| `titanium [--seat]` | validate+print tracked machine map | `titanium.rs` | read-only |
| `plan <task>` | write WWKD Round-0 plan | `LoopDriver::open` (takes writer lease) | writes `.ufo/` |
| `gates` | seated ParetoGate mutation smoke | `gate::ParetoGate` | writes `.ufo/rs-paper-gates.json` |
| `judge-handoff --input` | validate wave, emit Rust Pareto verdict | `native::judge_handoff` | read-only |
| `self-iter [--rounds --concurrency --substrate]` | canonical loop to saturation | `LoopDriver::open().run_dry_until_halt()` (main.rs:482-488); spawns `node scripts/sync-ufo-contracts.mjs --check` (main.rs:651-657) | writes `.ufo/` |
| `local-ship --request` | verify/rollback file apply | `local_ship` | mutates workspace |
| `route-plan --role` | print compiled OMP chains | generated `omp_role_chains` (main.rs:1119-1151) | read-only |
| `receipt-digests` | hash receipts from bounded stdin | canonical serializer | read-only (stdin) |
| `routing-health [--since]` | aggregate `.ufo/routing-health.jsonl` | display-only by declaration | read-only |
| `charter sign <run_id>` | operator membrane sign-off; TTY-only; Phase 0 re-pass | spawns `cargo build` + `node scripts/ufo-drills.mjs` (main.rs:956-975); unlink seal :1099 | unseals `.ufo/` |

## Ownership split vs scripts

- Authoritative in-process Rust (no spawn): status, titanium, plan, gates,
  judge-handoff, local-ship, route-plan, receipt-digests, routing-health.
- Rust verb that spawns a script: `self-iter` (contracts `--check` child
  inherits ambient env unsanitized, main.rs:621-630), `charter sign`.
- Thin shims over the binary: `scripts/self-iter.sh:285` `exec $UFO
  self-iter`; `packages/substrate-runtime/src/self-iter-delegate.mjs:302`.
- Script-only operator verbs with NO Rust counterpart: `ufo-sighting`
  (15 verbs), `ufo-swarm-wave` plan/run/record, `ufo-mission-result`,
  `ufo-swarm-collect`.
- Script callers of Rust verbs: `ufo-drills.mjs` → judge-handoff;
  `collect-omp-native-handoff*` → receipt-digests/status;
  `run-omp-native-trial.mjs` → judge-handoff (verdict persisted verbatim,
  :4140-4144) and status.

## Exit codes

`fail_local` (main.rs:780-791): `{ok:false,kind,error}` JSON, exit 2
(49 call sites; phase0=1, local-ship rollback=3). Errors escaping `run()`
→ `ufo: <Display>` + exit 1. Clap arg errors: clap's own text, exit 2.
A Pareto reject verdict is `Ok` + exit 0 — only malformed input is `Err`.
`--concurrency` accepts 1..=64 (`SELF_ITER_WORKER_CONCURRENCY_DEFAULT`)
while `NATIVE_CONCURRENCY_MAX = 32` — unpinned divergence.

## Bounds

`read_bounded_regular` with O_NOFOLLOW + size caps; 1 MiB local-ship
request; 16 MiB evidence inputs; `reject_excessive_json_depth`.
