# 2026-10-09 — TowerStatus as the hub's read view

**Asked.** What TowerStatus renders and reads.
**Sources.** `tools__status__statusTool.ts.js` (`:70-79` constants, `:91-143` flow), `status.md__raw.js`.
**Observed.**
- Reads `state.json`, `inbox/*.md`, `reviews/*.md`, `log/activity.log`, git refs. No arguments.
- Sections: header (`# Tower status — base …, you are …`), `## Missions` (survey rows marked 🔍; plus `## Awaiting spawn` for planned/unowned, `## Dead workers` for owners with `diedAt`), `## Roster`, `## Review gate (unmerged branches)` (per open mission `latestReview(branch)`: round/status and whether `reviewed_commit` still equals the tip), `## Done` (all merged/abandoned), `## Inbox` (count of caller-visible messages, `INBOX_COUNT_LIMIT=1e3`; no unread notion), `## Concurrency (adaptive)`, `## Recent activity` (last `RECENT_LOG_LINES=10` lines).
- Status's review gate uses unfiltered `latestReview(branch)`; merge uses the mission-filtered review — they can disagree on a branch shared by two missions.
- `STATUS_EMOJI`: planned 🟡, active 🔵, completed 🟢, blocked 🔴, paused ⏸️, merged ✅, abandoned 🚫 (same as the index legend).
**Changed.** Nothing — read-only research (seed entry).
**Unknown.** None material.

**Lane.** StatusTool (scout). Report: `.tower/fleets/shokunin3/reports/comms-keeper/StatusTool.md`.
