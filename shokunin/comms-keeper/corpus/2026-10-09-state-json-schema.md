# 2026-10-09 — state.json schema and save/load

**Asked.** The full `state.json` shape, writers, and persistence semantics.
**Sources.** `protocol__store.ts.js:113-121` (init object), `:196-211` (load/save), `:244-296` (roster writers), `:305-327` (mission constructor), `tools__spawn__spawnTool.ts.js:184-195` (roster entry), zod enums in `kimi.strings` (~:1038361, :1038484, :1038746); `jq` over both hubs.
**Observed.**
- Top level: `version` (always `1`, never read), `base`, `mode` (always `"branch"`), `createdAt`, `sessionId` (optional; omitted when unset), `roster: {agents: []}`, `missions: []`. **No counters**: review seq/round are derived from `reviews/` files.
- `roster.agents[]`: `name, agentId, sessionId, kind ∈ {worker, reviewer}, spawnedAt` always; `missionId, worktree, branch` worker-only; `reviewTarget, reviewMissionId` reviewer-only; `diedAt, deathStatus ∈ {failed,timed_out,killed,lost}, deathReason` optional. **Survey is a mission kind, not a roster kind.** No `model` field (the spawn log line carries it).
- `missions[]`: `id (M<n>), title, slug, kind ∈ {build, survey}, scope[], branch (feat/<slug>), worktree (wt-<n>), deps[], status ∈ {planned, active, completed, blocked, paused, merged, abandoned}, context?, tasks[{text, done, dropped?}], notes[], blockers[], owner?, spawnBase?`.
- `load()`: `readFile` (missing → `TowerProtocolError "tower is not initialized in this repository — run TowerInit first"`), then **unguarded `JSON.parse`** (malformed → raw `SyntaxError`, rethrown by `runTowerTool`), then `kind ??= "build"` backfill — the only migration.
- `save()`: `writeFile(state.json.tmp)` + `rename` (atomic replace; fixed tmp name; no lock; read-modify-write not serialized).
- `teardown` never calls `save()` (hub A `state.json` mtime 19:14Z < teardown 19:49Z).
- Hub A: 7 agents (4 worker, 3 reviewer), 4 missions merged (3 build, 1 survey), 17/17 tasks done; `agent-6` absent everywhere. Hub B (`/home/vgpnk/.tower/comms/state.json`, exists): roster empty (adopt), 5 build missions merged, `spawnBase` on M4/M5, `sessionId` last key (release→adopt re-add).
**Changed.** Nothing — read-only research (seed entry).
**Unknown.** Why hub A skips `agent-6`; the runtime `agentId` format (observed `agent-N`).

**Lane.** StateJsonSchema (scout). Report: `.tower/fleets/shokunin3/reports/comms-keeper/StateJsonSchema.md`.
