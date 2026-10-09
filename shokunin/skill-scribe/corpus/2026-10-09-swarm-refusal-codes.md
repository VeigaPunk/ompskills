# swarm validator refusal codes: 32 typed strings vs the skill's 24

**Asked:** the complete typed refusal inventory and how `.omp/skills/swarm/SKILL.md` compares.
**Source:** `/home/vgpnk/Projects/ufo-fsd-alpha/scripts/ufo-swarm-wave.mjs` (all `fail(` sites),
`scripts/ufo-mission-result.mjs`, prose at `.omp/skills/swarm/SKILL.md:76-86`.

## Observed

- **32 distinct typed codes**; every `SwarmWaveError` exits 1 (`reportError` 1432-1455),
  CLI `usage` exits 64 (`emitUsageError` 1349-1352) — with one duality:
  `RoutePreflightError("usage")` rethrown at :1392 exits **1**, so `usage` is not exit-stable
  across origins.
- Wave-band gates are spawn-guarded: `too_few_lanes` (:998-1001), `wave_too_wide` (:1005-1007),
  `impossible_band` (:990-992); `too_many_lanes` (:996) is **unguarded** and bounds resume-only
  waves by the member cap.
- `run`-only refusals: `wave_registry_collision` (:1504) and the merge-loss
  `resume_unknown_member` (:1613, under the registry lock after merge); `registry_lock_timeout`/
  `registry_lock_unsafe` (:690/:693) fire on run and record.
- `invalid_registry` fires at plan, run **and** record (loadRegistry :518-594,
  assertConsistentPriorClaims, inheritedJudgment, lock-owner :681).
- Prose comparison: the skill's refusal list names 24 real codes with **no fabricated names**
  (and honestly disclaims completeness); it omits 16 — `invalid_name`, `invalid_resume_id`,
  `spawn_message_forbidden`, `prompt_with_template`, `item_required`, `prompt_required`,
  `invalid_report_dir`, `wave_registry_collision`, `registry_lock_timeout`,
  `registry_lock_unsafe`, `route_config_unavailable`, `prior_refinement_refused`,
  `prior_refinement_overflow`, `EXEC_PATH_OUTSIDE_ROOT`, `usage`, `internal`.
  Three attribution errors: `invalid_registry` filed under "plan/run before any lane spawns";
  the route-preflight clause presents `route_unreachable` as the only preflight code (it also
  refuses `route_config_unavailable` and probe `usage`); `resume_unknown_member` described as
  purely pre-spawn though :1613 fires after plan admission.

## Remaining unknown

Passthrough-module codes were grep-confirmed, not full-file read; byte-pinned message forms were
not executed.
