# 2026-10-09 — boundary with existing cards and errata to their hub claims

**Asked.** Where comms-keeper stops, and which existing claims about the hub the source contradicts.
**Sources.** `.omp/agents/{harness-scout,worktree-keeper,evidence-auditor,wall-watcher,mission-keeper,fleet-warden}.md`, `shokunin/evidence-auditor/corpus/2026-10-09-hub-state-receipts.md` (+ r2 errata).
**Observed.**
- Only evidence-auditor touches `.tower/comms` (card :64-67 + corpus). Delineation: comms-keeper owns the hub's writers, naming, schemas and message flow; evidence-auditor owns whether a record is admissible proof; worktree-keeper/fleet-warden own `.tower/worktrees/**`, `.tower/fleets/**` and git; mission-keeper owns omp `hub send` resume lanes; wall-watcher owns wall `steers/`; harness-scout owns omp/kimi session stores.
- Contradicted claims in `hub-state-receipts.md`: "generator string occurs nowhere" (it is in the kimi binary; no *tracked* code emits it); `Type ∈ {bug, improve}`, `Severity ∈ {low, medium, high}` (actually + `vuln, idea`; + `critical`); reviews "hand-authored" with checks carrying observed results (written by `TowerReview`; checks are free text rendered `- [x]`); hub "regenerated on each state transition" (6 render sites; not on adopt/release/rebase/died/teardown); activity.log "the only place a sequence is recorded" (task_done ticks and resumes are unlogged; init truncates it).
- evidence-auditor card: only `MISSIONS.md` says "do not edit by hand" (mission files say "update via the TowerMission tool"); "never artifact hashes" holds but `reviewed_commit`/`merge_commit` are git SHAs.
- These are reported, not edited — the other cards are outside this mission's scope.
**Changed.** Nothing — read-only research (seed entry).
**Unknown.** None material.

**Lane.** BoundaryWithCards (connector). Report: `.tower/fleets/shokunin3/reports/comms-keeper/BoundaryWithCards.md`.
