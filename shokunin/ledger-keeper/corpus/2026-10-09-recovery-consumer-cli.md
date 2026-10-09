# recovery-consumer-cli — `scripts/primeagent-recovery-assess.mjs`

Asked: usage/flags, validation order, refusal codes, exit codes, and the package invocation.
Anchor: `ufo-fsd-alpha@5ace2559`. Source: `reports/ledger-keeper/<Lane>.md` (mission round 1, wave `ledger-keeper-r1-w1`). Lane: `RecoveryConsumerCli`. File sha256 `85e338c1600e4590…`.

Observed:
- Usage: `node scripts/primeagent-recovery-assess.mjs --run <successorRunId> --expect-parent-run <parentRunId> [--json]`
  (`--json` is a pure no-op; an unknown token → exit 64). Root defaults to `CHECKOUT_ROOT` (no `--root` flag).
- Validation order: ids (:213) → queue schema/rows (:220-231) → successor identity + lineage (:233-253) → parent located **only** via
  the successor row's `lineage.parentTaskKey` + `parentRunId` (:250-253) → wall matched on mission+run+session (:266-291) →
  completed-parent receipt path: prompt digest → report sha → receipt read + `expectedReceiptBag` + `validateTaskReceiptEitherBinding`
  (either-binding essential; snapshot-membership rebind) → `priorReceiptSha256` over the **normalized** receipt → `iteration.decision` →
  lifecycle projection → package `primeagentRecoveryAssessment` (:406-428).
- Refusal codes (15 named): usage-invalid, queue-schema-mismatch, source-unavailable, successor-not-found, lineage-mismatch,
  successor-identity-invalid, parent-not-found, parent-identity-invalid, wall-identity-mismatch, parent-prompt-digest-invalid,
  receipt-invalid, prior-digest-mismatch, observation-invalid, package-unavailable, queue-path-outside-root.
- Exit codes: 0 EXIT_OK (package success **and** package-level typed refusals), 2 EXIT_SOURCE_INVALID, 64 EXIT_USAGE.
- Envelope `ufo-primeagent-recovery-assessment-v1` with provenance `caller-supplied (not package-attested)`; one allowlisted JSON object.
- Probes: no-args/`--bogus` → exit 64; missing queue → exit 2 `source-unavailable`; out-of-root `UFO_PENDING_WORK_PATH` → `queue-path-outside-root`.

Changed: nothing. Unknowns: no end-to-end exit-0 success run; the doc comment at :114 names `prompt.md.sha256` but the code hashes `prompt.md` **bytes** (comment stale).

Report: `reports/ledger-keeper/RecoveryConsumerCli.md`.
