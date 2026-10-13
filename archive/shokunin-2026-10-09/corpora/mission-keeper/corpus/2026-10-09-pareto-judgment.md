# pareto-judgment — Step-6 Pareto judgment and integration mechanics

Item: step 6 (`sighting/l1-prompt.md:126-138`) + integration, grounded in `tf-prompt-r1` §5 and `tf-band-r1` §6.

Observed six rules:
- R1 measuring stick = the round's axis set written in step 1 (`:126-128`), NOT `{{axis}}` and NOT a lane's own `axes`.
- R2 accept = improve ≥1 axis, regress none (`:128`).
- R3 unknown = an unmeasured claim is never an accept (`:129`).
- R4 out-of-scope = a move touching a path outside `{{scope}}` is rejected with that reason (`:129-130`).
- R5 re-score the surviving set after every accept (`:131`).
- R6 record every rejection with its evidence (`:131-132`; receipt field `:139-144`).

Integration: read-only finding re-applied by the L1 (`:132-133`); writer lane's change taken via `git checkout <lane-branch> -- <paths>` (`:134`); landing is `git add -- <paths> && git commit -- <paths>`, scope is what enters a commit, state-dir artifacts never do (`:136-138`).

Quoted accept (tf-band-r1 §6): commit `ba946bb` — hermetic band authority; improves A4/A5, regresses none. Quoted reject (tf-prompt-r1 §5): the `| L1 route | @{{l1Alias}} |` row — unimplementable, letters-only regex (shipped verbatim, exit 0).

Probes: `git add -- f.md` on the mission tree stages nothing after a lane-branch commit; `git checkout <lane-branch> -- f.md` exit 0; `git commit -qm -- f.md` exit 0, only f.md in the commit; `git add -- <path outside repo>` exit 128.
Evidence: `ParetoJudgeRule.md`.
Unknowns: no observed multi-accept round re-scoring (R5); prompt omits `run-logic.md`'s `INSUFFICIENT_EVIDENCE`.
