# t33-stop-reasons — T33's scope and authority_boundary's taxonomy

Asked: what T33 names; its relation to authority_boundary; where the
loop-stop taxonomy is enumerated in code.

Observed (wave r1-w1 lane T33StopReasons):

- T33 names the separation of **wall-clock budget expiry** (`honesty_brake`)
  from **watcher-deadline** `lane_timeout` — cited at
  03-cost-ledger-and-stop-reasons.md:98-99 and
  16-amendments-to-specs-00-09.md:102-104,110-112,284. T33 does not mention
  `authority_boundary`; it is a different stop class (operator-owned vs
  budget/deadline).
- `authority_boundary` is simultaneously: a `LoopOutcome` variant
  (state.rs:57), a `CheckpointStopReason` variant (state.rs:25), and the
  verdict `loop_stop` value (lib.rs:630). `membrane_accepts` is non-empty
  exactly when `loop_stop == authority_boundary`. Not a standalone field.
- Emission: native.rs:343-345; loop_driver_dry.rs:463-465;
  loop_driver.rs:561-617 (`boundary_stop`); refusal prefix `authority_boundary:`
  at loop_driver_publish.rs:145-147.
- `lane_timeout` is never a `LoopOutcome`/`CheckpointStopReason` — a lane
  deadline lands as `budget_halt` or `running` (loop_driver_tests.rs:2181).
  Spec 13's "join loop_stop" claim landed (13:41-42; LoopOutcome carries both).
- Native wall-clock gap: `NativeBudgets` (lib.rs:355) has no wall-clock field;
  native.rs:235-242 checks `tokens_per_mission` only — the T33 honesty_brake
  taxonomy exists for the fixture loop, not the native path.
- Divergences: spec 03 body still says "declared-but-unemitted" for two of
  three stop reasons (:27-28,124-125,129-134) while status :9 and code say all
  three emit; stale cites everywhere (03:9, 06:9, DECISIONS.md:14); self-iter
  exits 2 on non-saturated (main.rs:531-532) while the native launcher exits
  0 for any parsed verdict (run-omp-native-trial.mjs:4145;
  run-logic.md:1163-1167).

Confidence: high for enum/emission sites and T33 scope; medium for whether
the native wall-clock gap is intentional. Unknown: no T33 drill exists;
tier-2 cases NOT_RUN.
