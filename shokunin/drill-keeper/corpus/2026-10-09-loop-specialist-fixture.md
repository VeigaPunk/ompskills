# loop-specialist-fixture — `drills/fixtures/loop_specialist.py` and its twin

Asked: the fixture route itself: scenario grammar, fault lanes, route names, and the two copies.
Anchor: `ufo-fsd-alpha@5ace2559` (read-only); `config/ufo.json` cited from the working copy (sha256 `0e416f0a…`, uncommitted swarm-band edit only). Lane: `LoopSpecialistFixture`. L1 re-verified hashes and the env-reader split.

## Two copies, two contracts
| copy | sha256 | scenario source | used by |
| --- | --- | --- | --- |
| `drills/fixtures/loop_specialist.py` (210 lines) | `92564755…` | env `UFO_DRILL_SCENARIO` only (3 refs) | drill harness self-iter (`UFO_LOOP_SPECIALIST_FIXTURE`, `scripts/ufo-drills.mjs:63,651`) |
| `fixtures/loop_specialist.py` (224 lines) | `2c547b45…` | request JSON `scenario` field (0 env refs) | bare `ufo self-iter` (resolver default) and Rust tests |

Both were added in `72ab84a8`. The drill copy's "Superset of fixtures/loop_specialist.py" docstring is **false**: they are forks. The committed copy keeps `codex-scout-capacity`, `partial-failure`, `refine`, `lane-stall[-once]-<role>`, `route_receipt`/usage; the drill copy adds env-driven faults and drops those paths.

## Seating
`resolve_loop_fixture` (`crates/ufo-core-runtime/src/fixture_spawn.rs:275-294`): `UFO_LOOP_SPECIALIST_FIXTURE` if set (must be a file), else `<root>/fixtures/loop_specialist.py`, else BLOCKED; no checkout climb; memoised per driver (`loop_driver_dispatch.rs:113-122`). Production scenario is always `"basic"` (`loop_driver_open.rs:98`; `with_scenario` has no non-test caller). Spawn: `python3 <fixture> <role>` with `sanitize_fixture_environment` (`:299-329`): `env_clear` plus PATH, HOME, TMPDIR, LANG, LC_ALL, UFO_LOOP_LANE_LOG, UFO_LOOP_FIXTURE_STALL_SECS, UFO_DRILL_SCENARIO.

## Drill-copy scenario grammar (comma-separated clauses, colon fields)
`fail:<class>:<role|*>:<count|all>` (primary route only) · `fail-route:<class>:<route>:<role|*>` · `crash:<role|*>` (self-SIGKILL → ProcessExit -1) · `garbage:<role|*>` (non-JSON stdout) · `stall:<role>` / `stall-once:<role>` (exact role; sleep `UFO_LOOP_FIXTURE_STALL_SECS`, default 30) · `reroute:<role>` (to `local/fixture-recovery`) · `theater:<role|*>` · `quiet:<role|*>`. Any route other than `local/fixture-primary` → `refuse: unimplemented specialist route`, exit 3. Malformed clauses are ignored silently; a non-integer count raises `ValueError` [INFERENCE]. Default: round 0 proposes, later rounds `no_proposal`.

Scenarios used by the eight self-iter drills that set one: d-herd `fail:usage_limit:*:all`, d-i3-lane-dies `crash:labrat`, d-i3b-all-down `garbage:*`, d-i4-telemetry `fail:usage_limit:labrat:all`, d-timeout `stall:labrat` (+ `UFO_LOOP_FIXTURE_TIMEOUT_SECS=1`, `STALL_SECS=5`), d-i8-theater `theater:*`, … No drill uses `stall-once` or `fail-route`.

## Routes
`local/fixture-primary` (`live.rs:38`; default route for every non-distiller role, `lane_overlay.rs:40-43`) and `local/fixture-recovery` (`live.rs:42`; reroute target). The distiller defaults to **`hvm/qwen-hvm`**, a live route (see `fixture-route-rule`).

## Gaps
`stall-once` claims a D1a retry, but the wave path returns `LaneTimeout` without retrying (`loop_driver_dispatch.rs:474-485`). `reroute:*` never matches anything.
