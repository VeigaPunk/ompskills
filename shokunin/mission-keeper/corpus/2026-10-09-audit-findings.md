# audit-findings — tf-audit-prompt findings against the prompt (known defects)

Item: the `tf-audit-prompt` r1/r2 receipts.

Observed: r1 raised 8 blocker-class instructions (AUD-01..AUD-08) from 75 lane findings / 36 clusters. r2 keeps 5 blockers (AUD-01..AUD-05), downgrades AUD-06/07/08/13/15 to medium, and net = 5 blockers, 22 medium, 9 low. Value-side (AUD-31..AUD-36): 17 distinct tokens, none unsupplied; confirmed blind spot (letters-only class; `{{wave2}}` ships verbatim); dead `values.l1Alias`; AUD-24 line-94 `<path>` unsupplied; pseudo-placeholders `<spec.json>`/`<lane>` executable traps.
Refuted by r2: AUD-18c sub-claim (cause-agnostic "blocked with a named cause" stop already exists); AUD-10 headline ("not literally executable" — verbatim dispatch executes, `solutionSpace` silently defaults); the `tower/<fleet>/lanes/<lane>` branch alternative (re-collides across a fleet); the r1 "8 blockers" count → 5.
Provenance error corrected: AUD-04's r1 quote of the validator ("vocabulary, not an omp command") appears nowhere; the validator says the opposite (`ufo-swarm-wave.mjs:23`, literal at `:1341-1342`).

CRITICAL: the audit targets a superseded 106-line `l1-prompt.md`; the current file is 180 lines / sha256 `c9f10a44…f84f56e`. Audit line numbers MUST NOT be copied. Live in the current revision: AUD-02, AUD-03, AUD-04, AUD-05 (launcher absolute reportDir), AUD-13, AUD-07-soft. Already fixed: AUD-01, AUD-06, AUD-09/11/12/19/22/24-base/26/27.
Evidence: `AuditFindingsRule.md`.
Unknowns: refusals not re-run; applicability map is by symbol, not by re-execution.
