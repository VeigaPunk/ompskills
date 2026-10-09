# drill-census — `drills/*.drill.json`

Asked: a census of the matrix and which Spec 09 invariants lack a wired drill.
Anchor: `ufo-fsd-alpha@5ace2559` (read-only); `config/ufo.json` cited from the working copy (sha256 `0e416f0a…`, uncommitted swarm-band edit only). Lane: `DrillCensus`. Re-run `node scripts/ufo-drills.mjs --list` before trusting these numbers (read-only, exit 0).

## Aggregates (67 files + `drills/fixtures/loop_specialist.py`)
- Status: wired 51, pending-mechanism 11, referenced 5.
- Wired executors: cargo-test 25, self-iter 9, sync-check 8, node-test 7, judge-handoff 1 (`d-double`), shell 1 (`d-wall`).
- Invariant tag: I1 1, I2 1, I3 6, I4 1, I5 1, I6 5, I7 2, I8 3, I9 7, I10 2, none 38.
- `spec` field: absent on 13 files; compound values `11/T18`, `06/A-06`, `01/03`, `01/A-01`, `09/A-09`. The harness does not validate `invariant`/`spec`.

## By executor (wired)
- self-iter (9): d-herd, d-i1-second-l1, d-i3-lane-dies, d-i3b-all-down, d-i4-telemetry, d-i5-cache, d-i8-saturate, d-i8-theater, d-timeout.
- sync-check (8): d-closure-exec, d-closure-review, d-constants, d-docs-dates, d-equiv, d-i9-drift, d-surface, d-tier-resolve.
- node-test (7): d-health, d-idem, d-launch-record, d-ledger-gap, d-sanitize, d-screen, d-screen-clean.
- cargo-test (25): the rest of the wired set (axis, brake, digest, membrane, plan, saturation, lease, apply-journal, raw-evidence, settle, sign-auth, timeout-critical, i6/i7/i9-plan, interrupted).
- pending (11): d-alias-bypass, d-directive-data, d-domain-kill, d-domain-partial, d-exitcodes, d-heartbeat, d-i10-no-remote, d-i2-planner-stall, d-i8-degraded, d-steer, d-swarm-mix.
- referenced (5): d-t03-strict-hop … d-t07-effort (all spec 10).

## Invariant gaps
- **I2** has no wired drill (`d-i2-planner-stall` pending: the planner is in-process, so there is no fixture lane to stall).
- **I10** is covered only by proxy: `d-wall` is a tmux-PATH wall-probe halt, not a no-remote check; `d-i10-no-remote` is pending.
- I8's degraded arm is pending (`d-i8-degraded`); `d-sat-degraded` (cargo-test) covers the cleanliness half.
- I1 is a proxy: `d-i1-second-l1` proves that a second-judge config key is refused (`deny_unknown_fields`), not an adapter guard.
