# 2026-10-09 — worked example: hub A lifecycle (4 missions, base main)

**Asked.** Reconstruct the canonical hub from its records.
**Sources.** `/home/vgpnk/Projects/ompskills/.tower/comms/` — `log/activity.log` (77 lines), `state.json`, `missions/M1-4`, inbox, reviews.
**Observed.**
- Span init 16:17:54Z → teardown 19:49:11Z (3h31m). Counts: inbox.send 21 (22 files), finding.file 11, review.write 3, mission.update 19, merge 3, merge.noop 1, merge.blocked 1, worktree.add/remove 4/4, spawn 7, teardown 1; 0 rework/release/died/adopt/rebase.
- M1 survey (worker-audit): 4 survey messages + summary, 4 findings, completed, `merge.noop` — no review (34m).
- M2 build (worker-hostcfg): tower amendments A1–A3 + correction via inbox; worker marked `completed` on unreviewed `16bf44d` and sent review-request; tower replied `rework-required` and set status `active` itself (a `mission.update status=active`, **not** `mission.rework`); round-2 review-request on `3fc5abd`; reviewer-hostcfg r1 clean (seq 2); merge `db4ab07` (1h08m).
- M3 build (worker-skills): number-conflict question answered in 72 s; review-request → reviewer-skills r1 clean (seq 1) → merged `7b683c8` 51 s after the verdict.
- M4 build (worker-wavetest): review clean on `7fab95b` → `merge.blocked reason=out-of-scope` (`test/evidence/.gitignore` not matched by `test/**`) → tower scope patch to `test/**,test/evidence/.gitignore` → merge `d035dee` 35 s later, no re-review.
- After teardown no `release` line: `state.json.sessionId` still names the creator session.
- Contradictions worth knowing: M4's review text says "scope test/** only" while the gate refused out-of-scope; the 19-keys/6-chains figure the hostcfg review calls stale came from the tower's own rework message.
**Changed.** Nothing — read-only research (seed entry).
**Unknown.** Hub A `agent-6` gap; wt-4 evidence for M4's executed checks is gone (removed at teardown).

**Lane.** HubATimeline (scout). Report: `.tower/fleets/shokunin3/reports/comms-keeper/HubATimeline.md`.
