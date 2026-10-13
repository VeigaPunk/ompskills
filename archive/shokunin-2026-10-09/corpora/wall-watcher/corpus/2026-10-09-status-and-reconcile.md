# 2026-10-09 — `status` verb, `--lite`, and the `reconcile` delta

**Asked:** document the `status` verb and its `reconcile` alias: flags, envelope, liveness derivation,
and exactly what reconcile changes that status does not.

**Sources (exact; `ufo` = `/home/vgpnk/Projects/ufo-fsd-alpha`)**

- `ufo/scripts/ufo-sighting.mjs:4461-4467` — `status` branch (only flag `--lite`, boolean).
- `ufo/scripts/ufo-sighting.mjs:4506-4510` — `reconcile` (`requireNoArgs`).
- `ufo/scripts/ufo-sighting.mjs:2965-3145` — `getStatus` (present + absent envelopes).
- `ufo/scripts/ufo-sighting.mjs:3027-3040, 3065, 3113-3115, 2621-2635` — the `--lite` delta.
- `ufo/scripts/ufo-sighting.mjs:3005-3012` — the pane-verified live filter (ghost rule).
- `ufo/scripts/ufo-sighting-lib/base.mjs:428-434, 488-490` — `isLiveStatus` / `liveMissions` / `sortMissions`.
- `ufo/scripts/ufo-sighting.mjs:3798-3813` — `reconcileWall`; `:1976-2025` — `reconcileLocked`.
- `ufo/scripts/ufo-sighting-lib/surface.mjs:256-262, 274-280` — the shared usage line (help alias only).
- Live: `tmux show-options -t ufo_sighting …` (ownership triad), `status --help`, `peek --help`.

**Observed**

- `status` accepts exactly `--lite`; a positional is rejected earlier as `unexpected argument: <arg>`;
  `status -- x` is the only route to `"status takes no command"`; `--lite=yes` → `--lite takes no value`.
- `reconcile` takes **no** flags or args (`reconcile --lite` → `INVALID_ARGUMENT "reconcile takes no
  arguments"`), yet `reconcile --help` prints the status usage line. "Alias" here is a **help-usage
  alias** only: `reconcile` runs extra work. Its output is a **full (non-lite) `getStatus`**.
- Present-wall envelope fields: `status` (client-attachment: `attached|detached|invalid`), `terminalPid`,
  `terminal`, `tmux`, `wallId`, `registryRevision`, `missionCount`, `completedMissionCount`,
  `stoppedMissionCount`, `levels`, `levelDetails`, `phaseCounts`, `hatch`, `autoOpenWall`,
  `autoOpenWallSource`, `attachedClientCount`, `geometry`, `profile`, `staleMissionCount`,
  `observationsUnavailable`, `capacity`, `runners`, `l1Missions`, `missions[]`, `completed[]`,
  `stopped[]`, `windows[]`.
- Absent-wall envelope (`ufo-sighting.mjs:2977-3001`): `status:"absent"`, `hatch:"closed"`, counts 0,
  `tmux`, `registryRevision`, `runners`, `l1Missions`, `windows:[]` — and **no** `wallId`, `terminal`,
  `geometry`, `profile`, `capacity`, `observationsUnavailable`. Exit 0.
- `--lite` skips: the display-refresh critical section (and with it the lock + `WALL_BUSY` swallow);
  the hyprland terminal observation (`terminal.matchingClassProcessCount` → 0); and the `/proc`
  descendant walk (`runners.provenance.observed.processDescendants` → `null`, `liteBound: true`).
  It does **not** change the read path (manifest, pane-verified `missions[]`, `levels`, `l1Missions`,
  `staleMissionCount`, `windows`, ownership gate).
- Liveness: `isLiveStatus` = `starting|running`. `missions[]` additionally requires a live **attesting**
  pane (`!pane.dead && pane.missionId === mission.id && (panePid == null || pane.pid === panePid)`); a
  manifest-live row failing it is a **ghost** — excluded from `missions[]` but still counted by
  `staleMissionCount` (and by `l1Missions.active`, which can exceed `missionCount`). `liveOwnedPane`
  (`:3409-3425`) applies the identical rule to `steer`/`peek`, refusing `DEAD_PANE`.
- `status` reports; `reconcile` repairs. `reconcileLocked` (`:1976-2025`): stop-marks every unevidenced
  live row with `failure.code: "RECONCILE_UNATTESTED_STOP"` (`"mission row was live but no pane attested
  its exit"`); prunes `stopped` rows to `MAX_STOPPED_MISSIONS = 100`; writes the manifest; per-fleet
  `settleWallGeometry(..., {killEmptyFleetWindow:true})` (kill reaped/stale panes, re-lay the grid, kill
  emptied fleet windows); second write + `updateSessionStatus`. Non-lite `status` only repaints display
  metadata; it never stops a row, prunes, settles panes, or writes the manifest (it may write only the
  advisory `.ufo/cache/status-view` file).
- Counts vs views: `completedMissionCount`/`stoppedMissionCount` are true manifest totals;
  `completed[]`/`stopped[]` are each capped at `MAX_COMPLETED_MISSIONS = 50` (`slice(-50)`).
- Launcher contract: `readWall` calls `wallCli(spec, "status", "--lite")`; `wallRowLive` treats a numeric
  `levels.l1 > 0` as live and a **missing** `levels.l1` as LIVE (fail-safe). Fields read:
  `missions[]`, `levels.l1`, `completed[]`+`completedMissionCount`, `stopped[]`+`stoppedMissionCount`,
  `staleMissionCount`, `status`, `hatch`, and per row `fleet`/`runId`/`missionId`/`paneId`/`phase`.
- Live corroboration (read-only): session ownership triad on `ufo_sighting` equals
  `wallId`/`ROOT`/`MANIFEST_SCHEMA`; one attached client.

**Changed:** nothing.

**Unknown:** the exact per-sub-object shape of `missionView`/`completed[]`/`stopped[]` is source-derived
(not exhaustively asserted by tests) — treat with medium confidence.