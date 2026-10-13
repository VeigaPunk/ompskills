# collect-settle — Step 5: reportDir, settle, counts, and the record argv

Item: step 5 (`sighting/l1-prompt.md:115-125`).

Observed seven obligations: declare reportDir relative to the state dir AND state its absolute form in the spec shared context (`:115-116`); the relative rationale (`:117-119`); create the absolute report dir before dispatch (`:119`); settle = every dispatched lane has a recorded terminal outcome (`:119-120`); count reports against `counts.total` (`:120-121`); a lane's exhaustion or a missing report is telemetry, never saturation (`:121-122`); `record` the handles so a later wave can resume (`:122-125`).
Two-root hazard: the payload's `Report:` tail is the raw relative string with no base (`ufo-swarm-wave.mjs:215-217`, `:1156-1158`), and a lane's cwd is the mission worktree (pane `--cwd` `tower-fleet.mjs:472`; task agents are not worktree-isolated), so a lane following only the tail writes `<worktree>/reports/<id>/` (Root B), not `<stateDir>/reports/<id>/` (Root A). `<worktree>/reports/` is a TRACKED path here, so the stray dirties the deliverable surface. Live evidence: `tf-audit-prompt-r1.md`/`r2.md` §4 (both rounds split roots).
Settle/counts: terminal statuses completed|failed|timeout|cancelled|canceled|aborted; `counts.total` = spawn+resume.
Record argv DEFECT: the template line 123 has NO env preamble and the `<reportDir>` token is ambiguous. Both readings fail live: absolute → `invalid_registry_path`; relative without `UFO_PROJECT_ROOT=<stateDir>` resolves against the validator's own root → reads/creates a registry under the substrate scope. Canonical form: `UFO_PROJECT_ROOT=<stateDir> node <validator> record --registry <relative registry.path> --assignments …`.

Evidence: `CollectSettleRule.md`.
Unknowns: dropped-UFO_PROJECT_ROOT re-basing consequences [INFERENCE].
