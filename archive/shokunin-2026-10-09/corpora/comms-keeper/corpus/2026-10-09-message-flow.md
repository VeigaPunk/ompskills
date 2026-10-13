# 2026-10-09 — message families and flow between worker, reviewer and tower

**Asked.** Which messages flow where, under which subject conventions, in a real hub (hub A, all 22 inbox files).
**Sources.** `/home/vgpnk/Projects/ompskills/.tower/comms/inbox/*` (22), `log/activity.log`, kimi briefing texts.
**Observed.**
- Directions: tower → worker 7 (amendments ×4, correction, number-conflict resolution, rework-required); worker → tower 11 (survey 1/4…4/4, survey-summary, number-source conflict, review-request ×4, review-request-amendment); reviewer → **worker** 3 (review-result). Plus 1 stray → tower.
- Subject families are **conventions from briefing prose**, not parsed by code: `review-request` (worker → tower, mandatory build ending), `survey-summary` (survey ending), `review-result` (reviewer → author). Code only searches `review-request` when building a reviewer briefing (newest 50 tower-visible messages).
- `action:` frontmatter present on 8/22 (`survey-summary`, `number-source-conflict`, `review-request`, `review-result`, `review-request-amendment`); tower messages never set it; `consent_ref` never used; `scope:` holds the mission id (free text).
- Review results go to the worker, not the tower; the tower still sees them because tower `readInbox` is unfiltered, and the authoritative verdict is the `reviews/` file + `review.write` log line.
- Q/A pairing is by scope and time only — no reply-to field. Hub A row 18's "⚠️ Open question — please confirm" (M2 variant count) was never answered before merge.
- Findings never enter the inbox; reviews never write the inbox; merges write nothing but state/index/mission file and the log.
- Canonical flow: tower plans → spawns worker (worktree.add, spawn) → worker works, files findings, notes mission → worker `completed` + `review-request` → tower spawns reviewer → reviewer `TowerReview` + `review-result` → tower `TowerMerge` (or `merge.blocked` → fix → merge) → teardown.
**Changed.** Nothing — read-only research (seed entry).
**Unknown.** Nothing records tower resumes or which message prompted an action.

**Lane.** HubAInbox (scout). Report: `.tower/fleets/shokunin3/reports/comms-keeper/HubAInbox.md`.
