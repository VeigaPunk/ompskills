# runtime-recovery-api — `primeagentRecoveryAssessment`

Asked: provenance, options, enums, the success union, refusal codes, ordering, and the no-authority guarantee.
Anchor: `ufo-fsd-alpha@5ace2559`. Source: `reports/ledger-keeper/<Lane>.md` (mission round 1, wave `ledger-keeper-r1-w1`). Lane: `RuntimeRecoveryApi`.

Observed (`packages/substrate-runtime/src/primeagent-refinement.mjs`):
- `RECOVERY_PROVENANCE = "caller-supplied (not package-attested)"` (:439); a normalizer stamps it on **every** return incl. refusals (:445-447).
- Required (all caller-supplied): `missionId`/`runId`/`expectedParentRun`, `parentObservation` `{phase∈queued|working|suspended|completed|failed, terminal:boolean, blockerCode?}`,
  `successorLineage` `{runId,sessionId,missionId,parentRunId}`; optional `wallObservation` (only `stopped` decision-bearing),
  `continueEvidence` `{kind:"receipt", outcome}`.
- Success: `continuation-observed` (completed + terminal + receipt/continue) ; `interruption-review-required`
  (suspended + non-terminal + `acceptance_{receipt,evidence}_{missing,invalid}` + stopped wall), reason says "no resume or replay is implied".
- Refusals: `observation-invalid`, `identity-mismatch` (×4), `continuity-unproven` (×4), plus digest pass-throughs; ordering
  shapes → lineage cross-check (before any store read) → digest chain+role.
- No command/deadline/retry/liveness claim exists anywhere in the result (:431-433); the sole consumer is `scripts/primeagent-recovery-assess.mjs` (:406).

Changed: nothing. Unknowns: no live-store CLI exercise (pure reads sufficed for the API-surface question).

Report: `reports/ledger-keeper/RuntimeRecoveryApi.md`.
