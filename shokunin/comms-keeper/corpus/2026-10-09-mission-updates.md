# 2026-10-09 — mission mutation: TowerMission patches and authority

**Asked.** Patch kinds, who may do what, the completed gate, and what is logged.
**Sources.** `protocol__store.ts.js:368-448` (`updateMission`, `assertCompletable`), `tools__mission__*.js`; 36 `mission.update` lines across both hubs.
**Observed.**
- Authority: tower → any mission; worker → only its own (`kind=worker && missionId==id`), else `agent "<n>" does not own mission <id> — workers update only their own mission file`. Reviewers can read but every patch is refused.
- Tower-only fields: `scope` (**replaces** the list, despite "widen" wording), `owner`, `spawnBase`, and `status=abandoned`.
- Patches: `status`, `note`, `blocker` (forces `blocked`), `clear_blockers` (does not restore status), `task_done` (substring match on first open task), `task_drop` (+ mandatory reason → note + log), `owner`, `scope`, `spawnBase`.
- **No transition table**: any authorized caller may set any of the 7 statuses; only `completed` is gated (`assertCompletable`: zero open tasks; then, for build missions only, the branch exists and has a diff vs `diffBase`). A worker can set its own mission to `merged` without review [source-verified, not exercised].
- Log: one `mission.update id=<id> …` per non-silent patch with keys `status=`, `note=added`, `blocker=added`, `task_drop=`, `owner=`, `scope=`, `spawn_base=`. **`task_done`-only patches are not logged**; spawn's status/owner flip is `silent`; review-driven completed→active appears only as `mission.rework`.
- Counts: hub A 19 + hub B 17 `mission.update` (note=added 29, status= 13, scope= 1), hub B 2 `mission.rework`.
**Changed.** Nothing — read-only research (seed entry).
**Unknown.** None material.

**Lane.** MissionUpdate (scout). Report: `.tower/fleets/shokunin3/reports/comms-keeper/MissionUpdate.md`.
