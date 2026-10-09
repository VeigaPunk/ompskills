# wall-integration — the wall CLI contract the launcher depends on

Asked: every wall invocation, the liveness-sourcing rule, and the wall fields relied on.
Source: `sighting/tower-fleet.mjs` @ b251c5a + the wall CLI (`<ufoRoot>/scripts/ufo-sighting`,
`ufo-sighting-lib/*.mjs`). Lane: `WallIntegration`.

All four wall calls funnel through `wallCli` (:519-521) `run(["bash", <ufoRoot>/scripts/ufo-sighting,
...subArgs])` — argv array, environment inherited:
1. `open` — :714 `wallCli(spec, "open")`; non-zero → `WALL_OPEN_FAILED` (:715-717).
2. `status --lite` — :537 inside `readWall` (:536-542); non-zero → `WALL_STATUS_FAILED` (:538-540);
   stdout → `parseJsonOutput`. Used by every verb that reasons about an existing mission.
3. `launch …` — :852 `wallCli(spec, ...row.launchArgv.slice(2))` (the `buildLaunchArgv` wall head
   minus `bash <script>`): `launch --run-id <id> --session-id <id> --title <title> --fleet <fleet>
   --cwd <worktreeRoot>/<id> --no-open --relay --runner-reservation 1 -- <omp argv>`. Non-zero →
   `LAUNCH_FAILED` (:855-870) with a `RUN_ID_CONFLICT`+stale-count reconcile hint (:862-866);
   zero-exit unparseable stdout → `WALL_OUTPUT` (:874-878).
4. `complete --mission <id> --note tower-fleet close` — :1195; non-zero → per-mission
   `COMPLETE_FAILED` (:1197-1203) and run-level exit 2 (:1226-1228).
Verbs the launcher only names, never spawns: `resume`, `remove`, `reconcile` (:786-787, :865,
:1142, :1185) — operator guidance strings.

Liveness sourcing (the rule the header states at :46-50):
- Only `missions[]` sources liveness: `wallRegistry` (:966) `active = wall.missions`, and
  `liveViewById` (:576-578) maps `registry.active` only.
- `wallRowLive` (:558-563): `levels.l1` decides; a live-view row with no numeric level reads LIVE
  (:562 `return true`); an absent row reads NOT-live.
- `phase` is a dispatcher observation (`obs?.phase ?? statusPhase(...)`) and is NEVER liveness;
  retired rows are tagged by their array (`completed`/`suspended`, :969-974) and are never passed
  to `wallRowLive` — retired rows carry no `levels`, so asking them would wrongly read live.
- An absent wall returns exit 0 with `status:"absent"` and empty arrays, so the launcher gates on
  the string, not the exit code (`close` → `WALL_ABSENT` :1164-1168).

Fields relied on (launcher → wall): `missions[]`, `completed[]`, `stopped[]`,
`completedMissionCount`/`stoppedMissionCount` (truncation warning :981-983),
`staleMissionCount` (:993), `status` (:995), `hatch` (:996), per-row `runId`/`missionId` (:544-546),
`levels.l1` (:559), `phase` (:566), `paneId`, `fleet`, `completedAt`/`stoppedAt`.

Retired lists are the wall's display slice capped at 50; the truncation warning tells the operator
a hidden retired row can still reserve a run id. The launcher's `wallStatus ?? "present"` fallback
is display-only — the wall emits `absent`/`attached`/`detached`/`invalid`.

Evidence: lane `WallIntegration` (stub-wall argv log; wall source line anchors).
