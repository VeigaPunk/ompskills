# 2026-10-09 — `complete` verb and completion retention

**Asked:** document `complete` — flag contract, retention rule, the composite-envelope concurrency
caveat, and what completion does to the tmux pane.

**Sources (exact; `ufo` = `/home/vgpnk/Projects/ufo-fsd-alpha`)**

- `ufo/scripts/ufo-sighting.mjs:4648-4657` — the `complete` branch + envelope.
- `ufo/scripts/ufo-sighting.mjs:3192-3201` — `validateCompletionNote`; `:3339-3396` — `completeMission`.
- `ufo/scripts/ufo-sighting.mjs:3343-3359` — dry-run / idempotent branches.
- `ufo/scripts/ufo-sighting.mjs:3377-3386` — completed-row eviction; `:3013-3020, 3094-3095` — view caps vs totals.
- `ufo/scripts/ufo-sighting.mjs:3203-3307` — `planMissionRetention` / `applyMissionRetention`; `:3309-3337` — `validateRetentionRecord`.
- `ufo/scripts/ufo-sighting.mjs:3183-3188, 3392-3396, 1917-1958, 1155-1180` — completion capture off, settle, empty-fleet teardown.
- `ufo/scripts/ufo-sighting-lib/base.mjs:63, 65, 436-445, 488-490` — `MAX_TEXT_BYTES`, `MAX_COMPLETED_MISSIONS`, `applyStopped`, `sortMissions`.
- `ufo/scripts/ufo-sighting-lib/surface.mjs:97-115, 269` — surface descriptor + usage line.
- Tests: `ufo/tests/ufo-sighting.test.js:1648, 1695-1713, 1736-1756, 2875, 2894-2950, 3043-3068`.

**Observed**

- Flags: `--mission` (required), `--note TEXT` (optional, `null` default), `--dry-run` (bool). The
  machine-readable surface descriptor **omits** `--dry-run` while the parser and usage line carry it —
  take the flag contract from the parser + usage line, not `surface.complete.flags` alone. No env
  fallback for `--mission`, no `--force`.
- `--note` is validated **before** the lock and before mission resolution: must be a string, no control
  characters (`\x00-\x1f`, `\x7f-\x9f`), non-empty after trim, ≤ `MAX_TEXT_BYTES` (4096) — else
  `INVALID_ARGUMENT`. So `complete --mission <nonexistent> --note ""` is a note error, not
  `MISSION_NOT_FOUND`.
- Envelope per path (`output` = pretty JSON): fresh complete → `completedMission`, `alreadyCompleted:false`,
  `retention`, then the whole `getStatus` payload; repeat complete → `completedMission`,
  `alreadyCompleted:true`, status payload, no `retention`/`dryRun`; dry-run → `completedMission`,
  `alreadyCompleted` (current status), `dryRun:true`, `retention` (untouched plan), status payload.
- Idempotence: a repeat complete is a strict no-op — no `writeManifest`, unchanged `registryRevision`,
  first note/timestamp frozen.
- Retention (manifest row): `MAX_COMPLETED_MISSIONS = 50`. On completion, if completed rows exceed 50,
  the oldest by `sortMissions` (`sequence` then `id`) are evicted, **excluding** the just-completed row.
  `completedMissionCount`/`stoppedMissionCount` are true totals; `completed[]`/`stopped[]` are each a
  further `slice(-50)` view. Stopped rows are pruned at `MAX_STOPPED_MISSIONS = 100` but displayed at 50.
- Retention (session artifacts): inside the lock and before the manifest write, `planMissionRetention`
  scans `<ROOT>/.ufo/sessions/<runId>` (symlinked dir/entries skipped) and prunes every non-newest
  `dispatch-snapshot-<N>` plus `*.tmp`/`*.bak`/`core*` (`RETENTION_MAX_LISTED = 64`), re-measuring
  `bytesFreed` when deletions failed or the plan truncated; the record `{at, pruned[], kept[],
  bytesFreed[, errors[], truncated]}` is stored as `mission.retention` and validated on every manifest load.
- Composite envelope: the whole verb body runs under one lock, then the trailing `getStatus({env})` runs
  **after** release — verb fields are the locked result, status fields/counts/`registryRevision` are a
  later unlocked snapshot a concurrent launch/stop/remove can invalidate. Atomic consumers read the
  manifest. (Same caveat as `remove`.)
- `--dry-run` does not write the manifest or delete anything, but it still calls `getStatus`, whose
  non-lite path `set-option`s tmux display state under the lock — so it is not display-side-effect-free.
  `--dry-run` has zero test/doc coverage in the wall suites.
- Pane/window: `completedCapture` is always empty (`COMPLETED_CAPTURE_LINES = 0`); `settleWallGeometry`
  kills the stale-marked pane (or respawns one `__idle` keeper when the window empties), tears down an
  emptied fleet window (`killFleetWindowIfEmpty`), and the dying pane wrapper schedules a detached
  `__reconcile`. `complete` never calls `applyStopped`, so a `stopped → completed` row keeps its
  `failure`/`exitCode`/`stoppedAt` as frozen history.
- Only in-repo consumer: `tower-fleet close` →
  `wallCli(spec, "complete", "--mission", <id>, "--note", "tower-fleet close")`.

**Changed:** nothing.

**Unknown:** the retention-artifact path has no test coverage (source-read only); whether the launcher's
`--force` warning ("their panes keep running") matches the post-verb pane state was not traced to the end.