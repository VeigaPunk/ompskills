# loop_driver — the canonical self-iter loop in Rust

Asked: the loop_driver module family, stage map, and how the Rust loop
relates to scripts. Substrate `5ace2559` (lane LoopDriver).

## Entry and driver

`ufo self-iter` (clap main.rs:49-61; dispatch :208-214; body `self_iter`
:432-535) calls `LoopDriver::open(...).run_dry_until_halt()` (main.rs:
482-488). `run_dry_until_halt` (loop_driver_dry.rs:943) delegates to
`run_epoch_from` (loop_driver_resume.rs:528-584) looping rounds with a
membrane-seal check, a boundary stop, and `run_dry_iteration_vs`
(loop_driver_dry.rs:69-77) = dispatch → judge → persist.

## Stage map

open → `loop_driver_open.rs` (also default roster :26-43);
digest → `loop_driver_digest.rs`;
candidate → `loop_driver_candidate.rs`;
dispatch → `loop_driver_dispatch.rs` (+ `fixture_spawn.rs` spawn/decode);
judge → `loop_driver_judge.rs` (`judge_wave`);
dry (round orchestrator) → `loop_driver_dry.rs`;
publish (WWKD plan, lease-guarded writes, membrane seal) →
`loop_driver_publish.rs`;
resume (checkpoint persist/resume, epoch runner) →
`loop_driver_resume.rs`.
`loop_driver.rs` is the parent struct/state module (122 `#[test]` in
loop_driver_tests.rs); `report.rs`/`state.rs` are `#[path]` children.

## Script boundary

- The Rust loop spawns PROCESSES itself: fixture_spawn.rs:681-683 runs
  `python3 fixtures/loop_specialist.py <role>` as a bounded child per lane
  attempt, routed to local/fixture-primary. It does NOT spawn tower/swarm/
  OMP agents (targeted grep: only test substrate strings).
- `scripts/self-iter.sh:285` is a thin `exec` of the binary.
- Rust reads/writes `.ufo/` artifacts (rs-self-iter-report.json,
  loop-state.json, plan-r{N}.md, membrane-seal.json);
  `scripts/ufo-drills.mjs:666` consumes the report.
- A separate native path `ufo judge-handoff` (main.rs:226, native.rs:424)
  is invoked by `scripts/run-omp-native-trial.mjs:435,:4113`.
- No tower/swarm script invokes `ufo self-iter` or reads loop-state.json
  (bounded grep set — medium confidence negative).

## Caveats

`dispatch_specialists`, `judge_wave` scoring, and outcome precedence traced
by signature only. The Qwen HVM live route (live.rs:331-344) is reachable
only through the distiller seat; whether default self-iter reaches it is
unconfirmed.
