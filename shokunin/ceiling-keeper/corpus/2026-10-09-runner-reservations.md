# runner-reservations — globalRunnerCeiling

Asked: how runner reservations are counted and refused.
Source: `scripts/ufo-sighting.mjs:2103-2138` (re-read by the L1). Lane `RunnerReservations`.

- `parseRunnerReservation` (`:2103-2113`): absent → **1**. Otherwise an integer in `[1, ceiling]`; anything else → `INVALID_ARGUMENT` "--runner-reservation must be an integer from 1 to 1056".
- `reservedRunners` (`:2115-2123`): sum of `runnerReservation` over **live** rows (starting|running), with a missing or invalid value counted as 1. Stopped and completed rows count 0.
- `assertRunnerCapacity` (`:2125-2138`): `reserved + request > ceiling` → `RUNNER_CEILING_EXCEEDED` "global runner ceiling is N" with details
  `{ceiling, reserved, requested, headroom, fleet}`. Equality admits. The sum is **global across fleets**; `fleet` appears only in the details.
- Call sites: launch `:2354`, resume `:3703` (stored reservation), twin `:3995` (flag, default 1, not inherited), register `:4092`.
- Manifest validation: `:209`/`:211` → `MALFORMED_MANIFEST`.
- Dispatcher: queue `requestedRunners` default 1 (`fleet-dispatcher.mjs:5814`), bounded by `min(runnerCeiling(), MAX_REQUESTED_RUNNERS=1024)` (`:120`, `:5824-5826`, re-read by the L1).
  Above that bound it throws "queue requestedRunners exceeds 1024". The claim defer is `requested_runners` when `> runnerHeadroom` (`:8166-8167`).
  The result is that **1056 never binds a single task**; only the wall-wide sum can reach it.

Drift:
- The CLI gate uses `reserved` only. Status and the dispatcher use `max(reserved, observed)` (see runner-accounting-display).
- Lowering the ceiling never re-validates existing reservations.
- `sync-ufo-contracts.mjs:933-943` doc gate `runner-ceiling-1024` allowlists the literal **1024** as "global runner ceiling" prose (re-read by the L1). The live value is 1056.
- `tests/sync-ufo-contracts.test.js:109` uses a 1024 fixture. The `CHANGELOG.md:352` derivation from 32 L1s is stale [INFERENCE].
