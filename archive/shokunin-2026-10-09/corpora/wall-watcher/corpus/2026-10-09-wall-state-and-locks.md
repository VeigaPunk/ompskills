# 2026-10-09 — wall state directory, manifest schema, and the operation lock

**Asked:** document where the wall keeps its state (paths, modes, schemas), what it prunes, and the
lock semantics.

**Sources (exact; `ufo` = `/home/vgpnk/Projects/ufo-fsd-alpha`)**

- `ufo/scripts/ufo-sighting-lib/base.mjs:17, 41, 49, 59, 65, 73, 75, 77, 301-307, 447-476` — `ROOT`,
  `MANIFEST_SCHEMA`, `MAX_MANIFEST_BYTES`, `MAX_LOCK_OWNER_BYTES`, `MAX_COMPLETED_MISSIONS`,
  `LOCK_TIMEOUT_MS`, `LOCK_STALE_MS`, `DISPLAY_REFRESH_LOCK_MS`, `stateDir`/`manifestPath`, advisory prune.
- `ufo/scripts/ufo-sighting.mjs:325-337` — `newManifest`; `:173-300` — `validateManifest` / `validateMission`;
  `:340-434` — `ensureStateDirectory` / `readManifest` / `loadManifest` / `peekManifest`;
  `:548-573` — `writeManifest`; `:1100-1131` — `ensureOwnedSession`.
- `ufo/scripts/ufo-sighting.mjs:577-779` — lock identity/acquire/reclaim; `:781-803` — `withOperationLock`.
- `ufo/scripts/ufo-sighting.mjs:3489-3509` — `appendSteerLog`; `:3203-3307` — retention prune.
- `ufo/scripts/ufo-sighting-lib/observe.mjs:493-525` — the read-only `observations.json` sidecar.
- Live: `ls -la ufo/.ufo/sighting/`, `stat -c '%a %n' …`, `node -e` reads of the live manifest.

**Observed**

- `stateDir = UFO_SIGHTING_STATE_DIR || <ROOT>/.ufo/sighting` (mode 0700, own-uid, no symlink; a loosened
  mode is repaired in place; the "must be beneath ROOT" check applies **only** when the override is
  absent). `UFO_STATE_DIR` (the fleet-wide var) is **not** read by the wall — only `UFO_SIGHTING_STATE_DIR`.
- `manifest.json` (file 0600, dir 0700): the sole durable registry. Atomic write
  (`tmp .manifest.<pid>.<uuid>.tmp` → write → fsync → rename → chmod 0600 → dir fsync) with a monotonic
  `registryRevision`. Cap `MAX_MANIFEST_BYTES = 1 MiB` (`MANIFEST_TOO_LARGE` on write; symlink →
  `UNSAFE_STATE`). `peekManifest` never creates state; `readManifest` returns `{state:null}` when absent
  (wall-absent, not an error).
- Top-level schema `ufo-sighting-wall-v1`: `schema, wallId, ownerRoot, target, registryRevision,
  nextSequence, profile, terminal, geometry, missions[]` (`target` = `ufo_sighting:1`, `ownerRoot` = `ROOT`;
  a mismatch is `FOREIGN_STATE`). Uniqueness: ids/runIds/sessionIds/sequences across **all** rows; paneIds
  only among live rows.
- Mission record: validated fields incl. `id` (`^m_[a-f0-9]{32}$`), `sequence`, `runId`, `sessionId`,
  `title` (≤64), `substrate` (≤32), `paneId` (`null` or `^%\d+$`), `panePid`, `cwd` (absolute),
  `status ∈ {starting,running,completed,stopped}`, `runnerReservation` (absent → 0 if completed else 1),
  `relay`, `fleet` (null or `^[a-z0-9][a-z0-9_-]{0,47}$`), `dispatch` (kind `inquiry|native-trial|argv`),
  `provenance` (`twinDepth ∈ {0,1}`, `ownerMissionId` required), optional `environment`, `retention`,
  `twinMissionId`, `steerCount`, `lastSteerAt`, `lastSteerBytes`; `createdAt`/`failure`/`completedCapture`/
  `finalNote` are written but not read-validated.
- `steers/<runId>.jsonl` (dir 0700, file 0600, append-only): one JSON line per steer
  `{ts, source:"l0", bytes, sha256, via}` — the steer **text is not stored**, only its sha256; `steers/`
  is created lazily; the log is **unbounded** (`MAX_STEER_FILE_BYTES` bounds only the `--text-file` input).
  One writer only (`appendSteerLog`, hardcoded `source:"l0"`); direct pane typing bypasses the store
  entirely, and L0 software daemons drive the same CLI, so `"l0"` is an unauthenticated class label.
- `operation.lock/` is a **directory** (`owner.json` `{pid, token, at, starttime, bootId}`, mode 0600);
  transient. `withOperationLock` is process-local re-entrant, waits `LOCK_TIMEOUT_MS = 10 s`
  (`UFO_SIGHTING_LOCK_TIMEOUT_MS` override; expiry → `WALL_BUSY`); a dead/foreign owner (or
  `starttime`/`bootId` mismatch — PID-reuse guard) is reclaimed immediately, else a 30 s mtime fallback
  (`LOCK_STALE_MS`); stale quarantine dirs GC after 60 s. `DISPLAY_REFRESH_LOCK_MS = 250` is a short wait
  bound on that same lock, not a second lock. `scripts/ufo-night-watchdog.sh` reaps a dead-holder lock.
- Read-only sidecar: `observations.json` is dispatcher-owned (not the wall); the wall reads it with
  fail-open bounds (≤4 MiB, ≤2048 rows, ≤8 KiB/row) and falls back to `statusPhase` per mission when
  absent/corrupt (absent in the live tree).
- Prune: advisory caches `<ROOT>/.ufo/cache/{status-view,transcript-scan}` keep the 32 newest `*.json|*.tmp`
  by mtime, pruned on each write (`UFO_SIGHTING_STATUS_CACHE=off` disables status-view);
  `pruneStoppedMissions` evicts the oldest `stopped` rows above `MAX_STOPPED_MISSIONS = 100` on reconcile;
  completed rows are not pruned from the manifest by reconcile. **Nothing prunes the ephemeral L1 root.**
- Live: `.ufo/sighting/` 0700 with `manifest.json` 0600 (42 KB) and `steers/` (18 per-run `.jsonl`, 0600);
  no `operation.lock`, no `observations.json`; `.ufo/cache/{status-view,transcript-scan,node-compile}`
  populated; `/scratch/tmp` absent so scratch session dirs fall to `$TMPDIR`/`os.tmpdir()`.
- Ownership binding: tmux session options `@ufo_sighting_{wall_id,owner,protocol}` attest that a live
  `ufo_sighting` session owns this manifest (mismatch → `FOREIGN_SESSION`); read-only verification is
  `tmux show-options -t ufo_sighting -v <opt>`.

**Changed:** nothing.

**Unknown:** the dispatcher's exact `observations.json` write cadence/schema (owned by
`fleet-dispatcher.mjs`); whether `.manifest.<pid>.<uuid>.tmp` litter is ever pruned (nothing in the wall
does).