# 2026-10-09 — worked example: a 3-round review loop (hub B M4)

**Asked.** How does round N+1 actually happen?
**Sources.** `/home/vgpnk/.tower/comms/reviews/review-feat-kimi-sighting-swarm-substrate-reviewer-kimi-r{1,2,3}.md`, matching inbox and log lines, kimi wire for agent-9.
**Observed.**
- r1 seq 5 `p1-1items` / `fix-then-merge` → r2 seq 6 `p2-1items` / `fix-then-merge` → r3 seq 7 `clean` / `merge`; seq 1–4 belonged to other branches (seq is global).
- After each non-clean verdict: `mission.rework id=M4` (the worker had marked `completed`), then the tower manually resumed the worker and later the **same** reviewer (`Agent(resume=agent-9)`), not a new `TowerSpawn`. **That dispatch is invisible in `activity.log`** (only in the kimi wire).
- Resumed reviewers get no review-history section (that is injected only at `TowerSpawn`: `REVIEW_HISTORY_ROUNDS=5`, `REVIEW_EXCERPT_MAX_CHARS=8e3`).
- The status string shows one priority + count: r1 listed 1 P1 + 1 P2 but reads `p1-1items`.
- The r1 review-result message body cites a wrong file name (missing `swarm-`) — message bodies are free text, unchecked.
- Doctrine "stop when two consecutive rounds report the same findings" exists only in the tower-mode reminder text; no code enforces it.
**Changed.** Nothing — read-only research (seed entry).
**Unknown.** Trigger causality inferred from wire timing (medium-high confidence).

**Lane.** ReviewRoundsKimi (revenger). Report: `.tower/fleets/shokunin3/reports/comms-keeper/ReviewRoundsKimi.md`.
