# ledger-keeper corpus — index

Append-only. One row per entry `| entry | topic | added |`. Read this first,
then the entries relevant to the assignment.

Domain anchor: `/home/vgpnk/Projects/ufo-fsd-alpha` (`ufo-fsd-alpha@5ace2559`) —
`scripts/primeagent-refinement-ledger.mjs` sha256 `ae69c40c7e774161…`,
`config/primeagent-assimilation.json` sha256 `d6348cabfcbf3e81…`,
`packages/substrate-runtime/src/primeagent-refinement.mjs` sha256
`725cfc537c421474…`, `.omp/hooks/pre/primeagent-assimilation.js` sha256
`7247f8b0ec3d2b38…`. Re-hash before trusting a line number. Seeded from the
mission's round-1 research wave (30 lanes, `reports/ledger-keeper/`).

| entry | topic | added |
| --- | --- | --- |
| 2026-10-09-store-schema.md | store document: schema/version, the three key sets, kinds, unknown-key refusal | 2026-10-09 |
| 2026-10-09-entry-shape.md | `validateEntryShape`: ordered checks, reason strings, bounds, joint title+body screen | 2026-10-09 |
| 2026-10-09-ledger-validate.md | `validateLedger`: ordered checks, refusal precedence, writer-coherence, callers | 2026-10-09 |
| 2026-10-09-policy-floor.md | `loadPolicy`/`policyMeet`/`readPolicyFile`, `CONFIG_PATH`, trusted-caller boundary | 2026-10-09 |
| 2026-10-09-scope-resolution.md | scope pattern, `scopedLedgerPath`, the no-default-store rule, hook parallel rule | 2026-10-09 |
| 2026-10-09-secret-screening.md | the 11 canonical patterns, pattern-major screen, `\p{Cf}` strip, adversarial findings | 2026-10-09 |
| 2026-10-09-timestamp-canonical.md | `CANONICAL_UTC_RE`, `isCanonicalUtcTimestamp`, `canonical()`, `entryDigest` preimage | 2026-10-09 |
| 2026-10-09-chain-integrity.md | mutation proof of the sha256 chain, prune re-anchor, residual re-sign attack | 2026-10-09 |
| 2026-10-09-append-semantics.md | `appendEntry` order, genesis vs parent re-confirm, session/mission rules, CLI mapping | 2026-10-09 |
| 2026-10-09-successor-projection.md | `readForSuccessor` default vs `--include-bodies`, `SUCCESSOR_MAX_ENTRIES`, `omitted` | 2026-10-09 |
| 2026-10-09-successor-reset-archive.md | `successorReset` guards, stamped archive slots, `ARCHIVE_RETENTION`, byte basename bound | 2026-10-09 |
| 2026-10-09-archive-observability.md | `list-archives`/`read-archives` schemas, hash domains, fail-closed vs inventory | 2026-10-09 |
| 2026-10-09-prune-reap.md | `pruneLedger` identity parity, keep-0 fix, genesis re-anchor, `reapLedgerTemps` shapes | 2026-10-09 |
| 2026-10-09-atomic-write.md | `writeLedgerAtomic`, fd-bound read, no-fsync honesty, the residual TOCTOU window | 2026-10-09 |
| 2026-10-09-status-verb.md | the r25 `status` scrape: envelope, sections, degrade-vs-fatal, both modes | 2026-10-09 |
| 2026-10-09-cli-machine-contract.md | `primeagent-refinement-ledger-cli-v1`, one-line envelope, LS/PS escape, io.err seam | 2026-10-09 |
| 2026-10-09-cli-parser.md | `GLOBAL_FLAGS`/`VERB_FLAGS`/`BOOLEAN_FLAGS`, r24 global pre-pass, F1 allowlists | 2026-10-09 |
| 2026-10-09-cli-verb-inventory.md | the nine verbs, their flags, payload keys, and exit contract (0/2, no exit 64) | 2026-10-09 |
| 2026-10-09-ledger-test-suite.md | what the 105-case ledger suite pins and deliberately leaves unpinned | 2026-10-09 |
| 2026-10-09-digest-test-suite.md | what the 23-case digest suite pins; its doc-count drift | 2026-10-09 |
| 2026-10-09-hook-test-suite.md | what the 19-case hook suite pins; its unpinned live-host surface | 2026-10-09 |
| 2026-10-09-recovery-test-suites.md | what the recovery + consumer suites pin; exit-64 unpinned | 2026-10-09 |
| 2026-10-09-assimilation-config.md | the canonical config file: bounds, hook caps, the 10 invariants, the floor rule | 2026-10-09 |
| 2026-10-09-hook-intake.md | the session_start hook: paths, classifier roles, step-0 parent binding, ring | 2026-10-09 |
| 2026-10-09-runtime-digest-api.md | `primeagentRefinementDigest`, sync seams, caps, containment, read-only proof | 2026-10-09 |
| 2026-10-09-runtime-recovery-api.md | `primeagentRecoveryAssessment`: options, union, refusals, no-authority guarantee | 2026-10-09 |
| 2026-10-09-wave-context-block.md | `ufo-refinement-context-v1` and the swarm validator's `--prior-refinement` path | 2026-10-09 |
| 2026-10-09-doc-history.md | `docs/PRIMEAGENT-ASSIMILATION.md` reconciled: mechanism map, r11-r17 gap, drifts | 2026-10-09 |
| 2026-10-09-recovery-consumer-cli.md | `primeagent-recovery-assess.mjs`: order, refusal codes, exit codes 0/2/64 | 2026-10-09 |
| 2026-10-09-type-surface.md | `primeagent-refinement.d.mts` declared contract and its runtime disagreements | 2026-10-09 |
| 2026-10-09-verify-dispatch-probes.md | creation-verification dispatch: scratch-root CLI probes (append/read-successor/validate), refusal exit 2, no exit 64 | 2026-10-09 |
| 2026-10-09-r2-corrections.md | round-2 falsification ledger — every corrected claim with its verifier, plus the card-side fixes | 2026-10-09 |
| 2026-10-09-persistence-invariants.md | the five persistence guarantees (bounds, shape, chain, screening, parent-scoping) each cited into the module with fresh anchors | 2026-10-09 |