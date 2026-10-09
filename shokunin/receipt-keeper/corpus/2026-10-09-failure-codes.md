# failure-codes — recordMissionFailure and every code that can land in a record

Source: r1 lane `FailureCodes` (fleet `shokunin3`, mission `receipt-keeper`, wave `receipt-keeper-r1-w1`); anchor launcher `sighting/tower-fleet.mjs` @ `ada7a90` (sha256 `80f0814e…`).
L1 re-verified: recordMissionFailure body read; RECONCILE count in shokunin = 40 via jq.

## Asked

The full set of per-mission failure codes and the first-wins rule.

## Observed

- `recordMissionFailure` :627-634: first call sets `record.failure={code,detail}` and pushes `{id,detail}` (no code) to run-local `failures`; later calls overwrite `record.secondaryFailure`, never re-push (so LAUNCH_PARTIAL cannot read "2 of 1").
- Call sites: :789 `RUN_ID_RESERVED` (retired wall row still reserves the run id; detail unsliced, includes remedy; flow continues to worktree/prompt steps, record pushed at :849); :815 `WORKTREE_ADD_FAILED` (`omp worktree add exited N: ` + 400-char slice; pushed :816); :883 `LAUNCH_FAILED` (wall exit≠0; raw 400-char slice or `CODE: message` from wall JSON, plus a `reconcile` hint when `staleCount>0`) or `WALL_OUTPUT` (exit 0, unparseable stdout, 200-char slice); :898 catch → `TypedError.code` (`INVALID_SPEC` from `assertSafeWriteTarget`, `COMMAND_MISSING`) else `MISSION_FAILED`.
- Every path pushes the record (:816, :849, :884, :891, :900) — fleet.json always lists every planned mission.
- Pre-loop throws record nothing and write no fleet.json: `INVALID_SPEC` :708, `RENDER_UNRESOLVED` (buildPlan), `WALL_OPEN_FAILED`, `WALL_STATUS_FAILED`/`WALL_OUTPUT` (wallRegistry), `STATE_DIR_UNAVAILABLE`.
- Real data: zero `missions[].failure` in all six fleet.json. The only `failure` keys are nested wall data (`launchResult.stopped[].failure.code = RECONCILE_UNATTESTED_STOP`: 40 in shokunin, 40 shokunin2, 50 shokunin3).

## Unknowns

- No real sample of first-wins/secondaryFailure.
- Wall error JSON shape at :859 inferred.
