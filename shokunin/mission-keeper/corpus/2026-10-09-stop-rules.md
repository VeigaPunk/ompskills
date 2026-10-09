# stop-rules — The Stop section and its adversarial gaps

Item: `## Stop` (`sighting/l1-prompt.md:176-181`).

Observed three stop kinds: (1) saturation — a clean round accepts nothing; (2) blocked — blocked with a named cause; (3) the round ceiling — `{{roundLaneCeiling}}` lanes per round OR `{{roundCeiling}}` rounds, whichever first. Closing instruction: leave the TUI open with the final receipt on screen.
Adversarial gaps (honest grading): a wave that cannot be validated has NO named stop (only the refusal-handling rule + the cause-agnostic blocked branch); a wave that never settles is guarded against saturation-mislabel but has NO positive stop duty; contradictory lane evidence has no stop kind (AUD-18c was REFUTED as a stop hole — the cause-agnostic branch already exists; the accepted reconcile sentence has not landed in step 6); no wall-clock stop kind despite `--max-time` (spec 4h); "final receipt on screen" names an artifact no rule creates (AUD-17 residue).
Severity: no blocker-class stop hole — every adversarial path is exitable via the cause-agnostic blocked branch.

Evidence: `StopRules.md`.
Unknowns: plan/run not executed (source + rendered-artifact reading sufficed).
