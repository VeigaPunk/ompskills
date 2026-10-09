# recovery-test-suites — what the two recovery suites pin

Asked: both suites' harnesses and pinned facts. Anchor: `ufo-fsd-alpha@5ace2559`. Source: `reports/ledger-keeper/<Lane>.md` (mission round 1, wave `ledger-keeper-r1-w1`). Lane: `RecoveryTestSuites` (reviewer).

Observed:
- `tests/primeagent-recovery.test.js` (package API, in-process): `continuation-observed` exact key set
  `[binding,digest,ok,parentRun,provenance,state,successorRun]` + store-byte identity; six `continuity-unproven` variants;
  `interruption-review-required` triple (suspended + acceptance blocker + stopped wall) with exact keys
  `[binding,digest,ok,provenance,reason,state]` and no resume/dead/replay fields; `identity-mismatch` (three crossed-lineage shapes + self-naming parent);
  five `observation-invalid` shapes; digest pass-through `parent-mismatch`/`no-ledger-state`/`chain-invalid`; required `expectedParentRun`;
  foreign-writer composition (r07 screen ∘ r06 provenance); r06 provenance totality across five refusal classes with exact keys `[code,ok,provenance,reason]`.
- `tests/primeagent-recovery-consumer.test.js` (CLI core, in-process over `assessRecoveryFromRows`): skeleton continuation with the
  allowlisted envelope + five-source byte identity + argv/title/body leak screens; `lineage-mismatch`; dangling `parentTaskKey` → `parent-not-found`;
  crossed wall identity → `wall-identity-mismatch`; either-binding receipt validation + r09 rebind-on-membership; `priorReceiptSha256`
  over the **normalized** receipt → `prior-digest-mismatch`; validated non-continue → exit 0 `continuity-unproven`; interruption triple;
  source-shape guards (`queue-schema-mismatch`, `successor/parent-identity-invalid`, `parent-prompt-digest-invalid`);
  `queue-path-outside-root` returned as a stdout envelope.
- `EXIT_USAGE=64` is **not** pinned by either suite (no CLI subprocess test); numerous codes/branches left unpinned (named in the report).

Changed: nothing (read-only). Unknowns: whether sibling suites cover the named gaps.

Report: `reports/ledger-keeper/RecoveryTestSuites.md`.
