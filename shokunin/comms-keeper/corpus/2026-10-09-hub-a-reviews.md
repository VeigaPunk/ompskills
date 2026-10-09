# 2026-10-09 — worked example: hub A review → result → merge chains

**Asked.** Pair each review with its request, result message and log lines; find contradictions.
**Sources.** `/home/vgpnk/Projects/ompskills/.tower/comms/reviews/*` (3), review-result inbox files (3), `log/activity.log`, git history.
**Observed.**
- M3: review-request 17:22:09Z → reviewer spawn 17:23:30Z → `review.write` 17:27:47Z (clean, `e3393d1`) → result msg 17:28:06Z → merge 17:28:38Z `7b683c8`.
- M2: round-2 request 17:54:02Z (tip `3fc5abd`) → spawn 17:55:41Z → `review.write` 18:04:19Z (clean) → result 18:04:40Z → merge 18:05:19Z `db4ab07`.
- M4: request 18:53:53Z (tip `7fab95b`) → spawn 18:55:02Z → `review.write` 19:13:04Z (clean) → result 19:13:26Z → `merge.blocked out-of-scope` 19:14:13Z → scope patch 19:14:31Z → merge 19:14:48Z `d035dee`.
- Verified consistent: `reviewed_commit` = review-time tip = merge-time tip = merge commit's second parent for all three; frontmatter `tokens` = `review.write tokens=`; merge commits chain onto main.
- Records that contradict each other: M4 review says "scope test/** only" yet the gate found `test/evidence/.gitignore` out of scope and the tower widened scope without re-review; `merge.blocked` logs only `{branch, reason}`, so the offending file is not in the log.
- A review's `## Checks` are reviewer claims; evidence that lived in a kimi worktree (`wt-4`) vanished at teardown.
**Changed.** Nothing — read-only research (seed entry).
**Unknown.** None material.

**Lane.** HubAReviews (reviewer). Report: `.tower/fleets/shokunin3/reports/comms-keeper/HubAReviews.md`.
