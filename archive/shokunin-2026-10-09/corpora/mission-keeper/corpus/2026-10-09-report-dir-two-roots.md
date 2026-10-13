# report-dir-two-roots — The reportDir two-root collision

Item: spec-level reportDir vs the payload's relative `Report:` line.

Observed collision: one string, two bases. The launcher renders the pane prompt with an ABSOLUTE reportDir (`renderPrompt:438` = `path.join(stateDir,'reports',mission.id)`, stateDir absolute) and states it (`mission-keeper.prompt.md:51,116,119`). The wave spec's reportDir MUST be relative (`validateReportDir:412-414` → `invalid_report_dir`). The validator resolves it under `UFO_PROJECT_ROOT=stateDir` for the registry/collect. But the payload's per-lane instruction (`reportInstruction:215-217`) is emitted as the raw relative string with no base, appended verbatim to every spawn task; the lane's cwd is the worktree, so a lane following only the tail writes `<worktree>/reports/<id>/<Name>.md` (Root B). `<worktree>/reports/` is tracked, so the stray is silent and out of scope.
Fix stated by the prompt: step 5 (`:115-119`) — declare reportDir relative, state its absolute form in the spec shared context BEFORE dispatch, create the absolute dir before dispatch. Live evidence: `tf-audit-prompt-r1.md`/`r2.md` §4 reproduced the split both rounds; the shokunin sibling spec `test-smith-r1-w1.spec.json` does exactly this and 5 lane reports landed under the absolute root.
AUD-05 standing-but-unimplemented: the corrected fix is emitting-side (emit an absolute instruction or state the base); `reportInstruction` still emits the raw relative string.

Evidence: `ReportDirTwoRoots.md`.
Unknowns: neither `skill://swarm` nor `skill://tower` mentions reportDir — the hazard is carried only by the prompt steps 3+5 and the tower1 receipts.
