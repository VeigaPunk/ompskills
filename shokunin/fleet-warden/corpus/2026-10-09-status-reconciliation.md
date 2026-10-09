# status-reconciliation — what `status` reconciles (read-only, one wall call)

Asked: the reconciliation outputs and the liveness/round columns.
Source: `sighting/tower-fleet.mjs` @ b251c5a (`verbStatus` :1006-1148). Lane: `StatusReconcile`
(22 probes).

- `status` writes nothing and makes exactly one wall call: `readWall` (:536-542) →
  `wallCli(spec, "status", "--lite")`; `wallRegistry` is called once per verb (status :1007). Proven
  three ways: the stub call log shows exactly one `status --lite` per invocation (incl. the
  `WALL_STATUS_FAILED` path); a byte manifest of the fixture tree is unchanged across a run; and
  `node --permission` with **no** `--allow-fs-write` exits 0 with the full payload.
- `reconciliation` fields: `fleetStatePath`, `fleetStatePresent` (`state !== null` :1114),
  `onWallNotInState` (:1037), `inStateNotOnWall` (:1038), `foreignFleetRows` (:1117 — only ever
  populated from live `missions[]`, never retired arrays), `retiredRows` (:1118 — owned ids only),
  `staleMissionCount` (:1119, safe-integer-guarded).
- Per-row `source` precedence: `wall` (live, :1048) > `wall-retired` (:1072, display status =
  `wallRowDisposition`, `retired:true`, `retiredAt` = `completedAt ?? stoppedAt`) > `state` > `spec`
  (:1092 ternary; `stateMissions` iterated before `spec.missions`). A `"wall"` row carries
  `fleet`/`foreignFleet`/`inFleetState`/`inSpec`; `"wall-retired"` drops `fleet`/`foreignFleet` and
  adds `retired`/`retiredAt`; `"state"`/`"spec"` rows are `live:false, status:"not-on-wall",
  missionId:null, paneId:null`.
- Liveness: live-view rows get `live: wallRowLive(row)`; retired/not-on-wall rows are hard-coded
  `live:false` — a retired row's `phase` is never treated as liveness (see `wall-integration`).
- `rounds` column: `roundReceipts` (:951-958) reads `<stateDir>/rounds/<id>-r*.md`, sorted
  **numerically** (r1, r2, r10), basenamed (:1056/:1084/:1099). Always this fleet's `stateDir`, even
  for a foreign-fleet row. Quirk: the filter is prefix+suffix only and the numeric regex is used
  only for the sort key with a `?? 0` fallback, so a matching file without a trailing `r<digits>.md`
  (e.g. `-rnotes.md`) sorts as 0 and is still listed.
- Missing state file → `fleetStatePresent:false`, the `no fleet state at …` line, exit 0.
  Unreadable state file → `warn(...)` + `null`, exit 0. Wall `status:"absent"` with empty arrays →
  exit 0 and the absent reconcile line. A wall payload lacking `status`/`hatch` → `wallStatus:
  "present"` (the `?? "present"` fallback), `hatch: null`.

Two-direction probe (real): state-only mission + a wall-only live row → `onWallNotInState:
["probe-wall-only"]`, `inStateNotOnWall: ["probe-state-only"]`, sources `wall` / `state` / `spec`.
Retired+foreign+stale fixture → `foreignFleetRows:["probe-state-only"]`, `retiredRows:
["probe-spec-only"]` (the non-owned stopped row correctly omitted), `staleMissionCount:2` and the
stale reconcile line. `wall-retired` beats `state` for the same id.

Evidence: lane `StatusReconcile` (field table, 22 probes, verbatim transcripts).
