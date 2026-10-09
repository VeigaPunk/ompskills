# launch-partial-policy — per-mission failure, LAUNCH_PARTIAL, fleet.json either way

Asked: the partial-failure policy, adversarially.
Source: `sighting/tower-fleet.mjs` @ b251c5a. Lane: `LaunchPartial` (critic) + header :33-35.

- Every mission runs inside a per-mission try in the `verbLaunch` loop (:893-901 catch): a failure
  is recorded on that mission via `recordMissionFailure` (:627-634) and the loop continues — an
  `omp worktree add` failure (:812-817 `WORKTREE_ADD_FAILED`), a wall launch failure
  (:855-870 `LAUNCH_FAILED`), an unparseable zero-exit wall stdout (:874-878 `WALL_OUTPUT`), a
  reserved run id (:789 `RUN_ID_RESERVED`), or any typed error raised inside the mission (the
  catch relabels a `TypedError` by its own code, anything else `MISSION_FAILED`).
- `recordMissionFailure` is first-wins: the first failure sets `record.failure` and pushes to the
  summary list; a second becomes `record.secondaryFailure`, so a mission is never counted twice
  (verified: a mission that is both `RUN_ID_RESERVED` and `WORKTREE_ADD_FAILED` yields one
  `failures[]` entry, `failures.length` 1). Note `failures[]` entries are `{id, detail}` with no
  `code`; the code lives only in `missions[].failure.code`.
- `fleet.json` is written after the loop (:904-928), `ok: failures.length === 0`; then, if failures
  exist, the run throws `LAUNCH_PARTIAL` (:945-947) — exit 2.
- Human mode prints `FAILED ${record.id} · ${record.failure.code} · worktree ${path}` (:935), a
  secondary "also hit" line (:937), and `launched <id>` for the rest (:940).

Critic seams (reproduced):
- (a) **fleet.json "either way" is not absolute** — the write at :907 is in no try; an fs error
  there escapes as `UNEXPECTED_ERROR` and no `fleet.json` is written (see `fleet-state-artifact`).
- (c) the per-mission catch does swallow a `TypedError` from the in-loop `assertSafeWriteTarget`
  (:797) into a per-mission `INVALID_SPEC` failure — proven by a TOCTOU fixture that plants a
  symlink during the wall call; a *static* symlink instead aborts the whole fleet, because the
  pre-loop `assertLaunchWriteTargets` (:708) runs before the wall opens.
- (d) the FAILED branch (:933-938) never prints pane state while the adopted/live branch does, so a
  live adopted pane is not visible on the failure line and the :946 wording ("missions failed to
  launch") can be read as liveness without a wall re-read.

Whole-run aborts that DO fire before any record (by design): `CONFIG_UNREADABLE` (:136-162),
`INVALID_SPEC`/`SCOPE_OVERLAP`/ceilings in `loadSpec`, `assertLaunchWriteTargets` (:708),
`WALL_OPEN_FAILED` (:716), `STATE_DIR_UNAVAILABLE` (:730).

Evidence: lane `LaunchPartial` (fixtures `/tmp/lp/*`, md5-pinned source, hashes restored).
