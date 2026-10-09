# wall-l1-ceiling — maxConcurrentL1 on the wall

Asked: what the wall counts against `sighting.dispatch.maxConcurrentL1`, and when.
Source: `scripts/ufo-sighting.mjs`, `scripts/ufo-sighting-lib/base.mjs`. Lane `WallL1Ceiling`. Lines re-read by the L1 (`:2144-2175`).

- Load: `base.mjs:166-169` requires a safe int ≥1. Otherwise it throws a plain Error, `emitFatal` reports UNEXPECTED_ERROR, exit 2, and no verb runs.
- Counted: `liveMissions(state).length`, meaning rows with status starting|running **across every fleet and the default wall** (`:2146`, rule text `:2155`). Completed and stopped rows count 0.
- Gate `assertL1Capacity` `:2161-2175`: `active >= ceiling` → `L1_CEILING_EXCEEDED` "global L1 mission ceiling is N" with details `{ceiling, active, headroom, fleet}`. Exit 2.
- Callers, each followed by `assertCapacity` and then `assertRunnerCapacity`:
  `launchMissionLocked` `:2351`, `resumeMissionLocked` `:3698`, `twinMission` `:3992`, `registerCurrentPane` `:4089` (fleet = null).

Contrast with the launcher: the launcher counts **one spec's** missions with `>`. The wall counts **live rows globally** with `>=` before the add.
The result is the same (the 17th refuses), but the launcher cannot see other fleets' live missions.

Dispatcher: a claim-side defer `mission_headroom` when `min(l1.headroom, windowHeadroom) < 1` (`fleet-dispatcher.mjs:8162-8163`, read by the L1),
plus the `queue_l1_capacity_hold` latch with reason `l1_ceiling_exceeded` (`:9185-9189`). L1 saturation and window saturation share one defer reason.

Drift: `docs/BEHAVIOR-MATRIX.md:27,180,335` say 32. `tests/ufo-sighting.test.js:3705` pins `maxConcurrentL1` value **32** in `manifest.caps` (re-read by the L1; the suite was not run).
