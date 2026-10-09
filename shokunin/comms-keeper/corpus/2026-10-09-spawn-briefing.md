# 2026-10-09 — spawn and the comms rules agents are briefed with

**Asked.** How agents join the hub and what they are told about comms.
**Sources.** `tools__spawn__spawnTool.ts.js` (`:36-38` constants, `:65-209` gates/registration/log, `:290-360` briefings), `tools__spawn__spawn.ts.js`, `tower-worker-overlay.md__raw.js`.
**Observed.**
- Only the main agent may `TowerSpawn`, and only in active tower mode. Spawn `kind` ∈ `worker | reviewer`; survey missions are spawned as `kind=worker`.
- Worker spawn: requires `mission_id`, creates/reuses the worktree (`worktree.add`), registers the roster entry, silently sets mission `active` + `owner`. Reviewer spawn: requires `review_target`; `reviewMissionId` from the branch.
- Names: non-blank, unpadded, not `tower`/`all`, unique roster-wide.
- Worker overlay (verbatim): "All collaboration protocol traffic (inbox messages, findings, reviews, mission updates) goes through the Tower* tools ONLY — never create, edit, or delete any file under `.tower/` by hand; the tools are the only writers, and hand-written protocol files break the merge gate."
- Communication protocol bullets: "Coordinate through tower tools ONLY: TowerSend / TowerInbox / TowerFinding / TowerMission / TowerStatus. Reach the tower and sibling agents with TowerSend; check TowerInbox regularly." / "Found something notable outside your scope? File it with TowerFinding instead of fixing it." / "Keep your mission current with TowerMission: task_done as you finish tasks, note for decisions, blocker when stuck."
- Mandatory endings: build worker → commit, `TowerMission status=completed`, `TowerSend(to="tower", subject="review-request", …)`, summary. Survey worker → completed, `survey-summary` to tower, summary. Reviewer → `TowerReview` (store-enforced) then send `review-result` (**briefing-only, unenforced**).
- Briefing feed: `REVIEW_REQUEST_SCAN_LIMIT=50` (newest tower-visible inbox items searched for the author's review-request), `REVIEW_HISTORY_ROUNDS=5`, `REVIEW_EXCERPT_MAX_CHARS=8e3` (truncated with `…(truncated)`).
**Changed.** Nothing — read-only research (seed entry).
**Unknown.** Whether the on-spawn `markAgentDied` branch (`:197`) ever fires.

**Lane.** SpawnBriefing (scout). Report: `.tower/fleets/shokunin3/reports/comms-keeper/SpawnBriefing.md`.
