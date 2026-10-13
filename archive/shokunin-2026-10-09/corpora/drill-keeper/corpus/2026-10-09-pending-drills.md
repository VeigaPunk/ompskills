# pending-drills — the 11 `pending-mechanism` rows

Asked: for each pending row, its reason, whether the mechanism now exists, and whether it could be wired.
Anchor: `ufo-fsd-alpha@5ace2559` (read-only); `config/ufo.json` cited from the working copy (sha256 `0e416f0a…`, uncommitted swarm-band edit only). Lane: `PendingDrills` (one `unshare -rn` host probe; nothing else run).

| id | waits on | mechanism today | wire now? |
| --- | --- | --- | --- |
| d-alias-bypass (11/T18) | drillable resume-selector guard | partial: `fleet-dispatcher.mjs:1703-1709` `argvContainsForbiddenSelector` (`--continue`, `--twin`), UUID-only session ids | no; needs an exported entry point |
| d-directive-data (06/A-06, T24) | `directive_task_data` screening | **landed**: `config/ufo.json` screening class, `collect-omp-native-handoff-lib/screening.mjs:609-626`, test `tests/collect-omp-native-handoff.test.js:3748` | yes, node-test — reason stale |
| d-domain-kill (04) | Phase 0 dead-domain halt | **landed**: `run-omp-native-trial.mjs:3130` `runPhase0DomainProbes`, halt code `domain-probe` `:3221`, test `:2684` | yes, node-test — reason stale (test named devin_oauth, body kills cursor) |
| d-domain-partial (04) | partial-domain chain advance | partial; needs a configured domain (`xai_oauth`) absent from config | no |
| d-exitcodes (01/03) | suite-wide exit table | partial: typed outcomes landed (`state.rs:21-27`), no suite harness | only per verb |
| d-heartbeat (01) | `heartbeat_stale` telemetry | mostly landed (writer `run-omp-native-trial.mjs:2274`, freshness `ufo-ground-handler.mjs:296-302`) | stale/deadline arms yes |
| d-i10-no-remote (I10) | netns isolation | **reason contradicted**: `unshare -rn` gives "Network is unreachable" on this host | yes, env-dependent shell drill that must hard-fail when netns is unavailable [INFERENCE] |
| d-i2-planner-stall (I2) | planner-lane fixture route | accurate: planner is in-process (`loop_driver_dry.rs:97-99`) | no |
| d-i8-degraded (I8/07) | DEGRADED lane state | state absent (run-logic: READY or UNAVAILABLE); cleanliness input landed | maybe via self-iter [INFERENCE] |
| d-steer (01/A-01) | seq/ack/disposition steer protocol | partial: A-01-lite steer log (`ufo-sighting.mjs:3489-3510`) | log arm only |
| d-swarm-mix (09/A-09) | advisory-descendant validator | absent | no |

## Takeaway
Five pendingReasons are stale (directive-data, domain-kill, heartbeat, i8 second clause, exitcodes) and one is contradicted (i10). The coverage invariant cannot see this (see `coverage-ratchet`): staleness is a review finding, not a suite failure.
