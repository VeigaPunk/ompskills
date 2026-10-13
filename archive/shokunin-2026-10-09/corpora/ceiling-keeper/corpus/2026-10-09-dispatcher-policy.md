# dispatcher-policy — fleet-dispatcher.mjs numbers

Asked: the dispatcher's numeric policy and where it enforces ceilings.
Lane `DispatcherPolicy`. Lines `:120`, `:3736-3745`, `:5820-5827`, `:8160-8168`, `:9183-9190` re-read by the L1.

- `dispatchPolicy` (`:3725-3770`) reads `globalRunnerCeiling` (required), `windowPaneCeiling` (optional, **default 16**), `maxConcurrentL1` (required, never defaulted), and `missionFormat`.
  Accessors `runnerCeiling()`/`windowPaneCeiling()`/`maxConcurrentL1()` at `:4390-4402` honour `UFO_CONFIG_PATH`.
- `defaultIterateRounds` must be a safe int in 1..1024 (`:3570-3573`, `usageError`). Per-task `iterate.rounds > 1024` throws (`:5211`). The enqueue default applies only when `iterate` is absent (`:5833-5834`).
- Claim-side, never a refusal: `mission_headroom` defer when `min(l1.headroom, windowHeadroomFor(task)) < 1` (`:8162`); `requested_runners` defer (`:8166`);
  `queue_l1_capacity_hold` latch (`:9185-9189`). The wall's `CAP_EXCEEDED` is retryable and exempt from the launch-miss budget (`:141`, `:169`, `:8918`).
- `MAX_REQUESTED_RUNNERS = 1024` (`:120`) and `min(runnerCeiling(), 1024)` (`:5824`).
- Exit codes: dispatcher `usageError` → 1 (`:9799-9828`); wall `SightingError` → 2 (`base.mjs:116-137`); planner `SwarmWaveError` → 1.

Drift: the help text at `:5387-5393` says "a WAVE carries 16-100 L2 lanes". Live is 16–32 and HEAD is 32–100; the text matches only the 72ab84a8 band.
