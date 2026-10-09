# 2026-10-09 — the observation pipeline behind `status`

**Asked:** document where the status observation pipeline reads from disk, how phase counts derive, and
its constants.

**Sources (exact; `ufo` = `/home/vgpnk/Projects/ufo-fsd-alpha`)**

- `ufo/scripts/ufo-sighting-lib/observe.mjs` — `ompSessionsRoot`/`encodedOmpCwd` (22-26),
  `missionOmpSessionDirectory` (35-48), `MAX_WALK_DEPTH`/`MAX_WALK_FILES` (50-52), `collectTranscriptFiles` (56+),
  `readTranscriptHeadTail` (119), `boundChildSessionCount` (184), `spawnedTaskIds` (203),
  `settledTaskIds` (228), `scanMissionTasks` (270), `observeMissionTasks` (384), `sparkStateRoot` (411),
  `countActiveSparks` (415), `loadObservations` (493-525), `derivePhaseCounts` (536), `levelStatus` (561),
  `statusPhase` (606-609).
- `ufo/scripts/ufo-sighting-lib/base.mjs:79, 81, 83, 85` — `MAX_OMP_TRANSCRIPT_BYTES`, `MAX_SPARK_META_BYTES`,
  `DEFAULT_SPARK_STATE_ROOT`, `ACTIVE_SPARK_STATES`, `SETTLED_TASK_STATES`.
- `ufo/scripts/ufo-sighting.mjs:1789-1798` — the session/window phase options the status writer sets.
- Live: the manifest's 27 rows / 8 running / 17 stopped / 2 completed vs `statusPhase`.

**Observed**

- Three on-disk sources feed `levelStatus`:
  - **(A) mission transcripts** under `$UFO_OMP_SESSIONS_ROOT/<encodedOmpCwd>` (walk ≤8 deep, ≤512 files;
    head ≤64 KiB for the `session` record, tail ≤2 MiB): `spawnedTaskIds` from `task` toolResult progress /
    async jobIds, `settledTaskIds` from async-result/hub job lists, `boundChildSessionCount` from the
    parentSession chain — their difference is the known unresolved-delegate count (`levels.l2`), or
    `null` "opaque" with a typed reason (`task_id_bound`, `transcript_tail_window`, `transcript_walk_bound`,
    `host_children_without_task_oracle`, `session_directory_unreadable`, `untrusted`, `unreadable`).
  - **(B) spark state root** `$UFO_XBRD_SPARK_ROOT` (default `DEFAULT_SPARK_STATE_ROOT`): `countActiveSparks`
    counts `<batch>/<spark>/meta.json` with `status ∈ ACTIVE_SPARK_STATES`, `finished_at == null`, within a
    grace window, size-bounded → `levels.l3`.
  - **(C) `observations.json` sidecar** under `stateDir`: a dispatcher-written `m_<hex> → {phase, …}` map,
    read with bounds (≤4 MiB, ≤2048 rows, ≤8 KiB/row) and **fail-open** (missing/corrupt → empty Map;
    `phaseCounts` then derives from the raw `statusPhase` per mission).
- `levels.l1 = liveMissions(state).length`; `phaseCounts` **primarily** from `observations.get(id).phase`
  with the raw `statusPhase(mission)` fallback; both are surfaced as status fields and as the session
  options `@ufo_l1/l2/l3`, `@ufo_phase_{queued,working,suspended,completed,failed}` and the per-pane
  `@ufo_phase`.
- Live corroboration: 8 running / 17 stopped / 2 completed in the manifest equals the live
  `@ufo_phase_working 8 / @ufo_phase_suspended 17 / @ufo_phase_completed 2`, and `@ufo_l2`/window
  `@ufo_fleet_l2` render `?` — the declared unavailable-count placeholder, not corruption.
- Two advisory caches back this pipeline: `<ROOT>/.ufo/cache/transcript-scan/<sha256(dir)>.json` (head/tail
  scans) and `<ROOT>/.ufo/cache/status-view/<sha256(manifestPath)>.json`, both 32-entry mtime-pruned;
  a corrupt entry falls through to a fresh parse.

**Changed:** nothing.

**Unknown:** `observedChildSessions` is 0 (a floor, not a census) on most opaque reasons; whether any
consumer depends on the advisory cache file names (the status-view digest keys on the absolute manifest
path, so it moves with a `UFO_SIGHTING_STATE_DIR` override).