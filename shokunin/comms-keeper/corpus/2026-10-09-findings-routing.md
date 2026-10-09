# 2026-10-09 — worked example: what happened to hub A's 11 findings

**Asked.** Were findings routed, and what does the protocol require of the tower?
**Sources.** `/home/vgpnk/Projects/ompskills/.tower/comms/findings/*` (11), inbox, log, `git log --all`; `injection__tower-mode-full-reminder.md__raw.js:13,38`.
**Observed.**
- All 11 worker-filed (worker-audit 4, worker-hostcfg 2, worker-skills 1, worker-wavetest 4); 7 bug, 4 improve. **0** triage/route/disposition records; no `plan`/`mission.update` names a finding.
- Outcome (content-matched): 1 disposed on record (F2, via tower amendment A3), 5 acted on without a record, 3 workaround-only, 2 open.
- Doctrine (full reminder): tower duties "relay wake-ups, triage findings, untangle conflicts, and merge"; "Finding — triage: assign to a mission, plan a new one, or backlog; the disposition is your call; tell the human." The reminder also says teardown needs "no unactioned inbox items remain" — teardown code never checks inbox or findings.
- The store has no finding status, no disposition verb, no backlog location: a disposition can only exist as a later `TowerPlan`, `TowerMission` note, inbox message, or chat — so "was this finding handled?" is answered by cross-reference, never by a field.
- Reviewers cited tower instructions ("per tower instruction", "accepted-context note") that do not exist in the hub — unpersisted dispositions.
**Changed.** Nothing — read-only research (seed entry).
**Unknown.** Content-level acted-on matches are coincidence-based (medium confidence).

**Lane.** HubAFindings (scout). Report: `.tower/fleets/shokunin3/reports/comms-keeper/HubAFindings.md`.
