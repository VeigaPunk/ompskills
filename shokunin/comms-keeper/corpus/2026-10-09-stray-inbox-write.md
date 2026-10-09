# 2026-10-09 — the one hand-written inbox file (hub A)

**Asked.** Is every inbox file a TowerSend artifact?
**Sources.** `/home/vgpnk/Projects/ompskills/.tower/comms/inbox/20261008-stray-hub-probe-tower-omp-hub-list-spawns-stray-sessions.md`; omp transcript `~/.omp/agent/sessions/-Projects-ompskills-.tower-worktrees-tower1-tf-prompt/2026-10-09T01-55-29-546Z_01a11e5f-…jsonl`.
**Observed.**
- `from: stray-hub-probe` (not a roster name; TowerSend derives `from` from the caller), `sent_at: 2026-10-09T02:01:16.944Z`, `scope: tf-prompt (stray)`; filename subject segment `omp-hub-list-spawns-stray-sessions` is not derivable from its subject (`stray session alive — \`omp hub list\` …`).
- No `inbox.send` line: 22 inbox files vs 21 log lines — the only unlogged hub artifact in either hub (findings 11/11, reviews 3/3, hub B 15/15).
- Written by a bare omp `write` tool call from an omp tower-fleet session (transcript ~lines 309–311, call at 02:01:31Z), i.e. an omp agent imitating kimi's frontmatter.
- `TowerInbox` (tower) would still read it — `readInbox` trusts any `type: inbox` frontmatter — and the tower could not reply (`unknown recipient`).
- Detection recipe: for each `inbox/*.md`, require a log line with `ref=.tower/comms/inbox/<file>`; for each review, a `review.write` with its `ref=`; flag senders not in `state.json` roster and not `tower`.
**Changed.** Nothing — read-only research (seed entry).
**Unknown.** Other omp-side hand writes were searched only by the comms/inbox patterns.

**Lane.** OmpSideCoupling (connector). Report: `.tower/fleets/shokunin3/reports/comms-keeper/OmpSideCoupling.md`.
