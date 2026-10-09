# fleet-warden corpus — index

Append-only. One entry per researched item; read the rows relevant to the assignment
before starting, then append a new row after finishing. Never rewrite or delete a row
or an entry file.

The launcher source `sighting/tower-fleet.mjs` is the single source of truth. The revision
audited is worktree `b251c5a` (sha256 `80f0814e…`); the file content is byte-identical at
its parent `6206db3` — the last commit to touch the file, so `b251c5a` does not touch it —
and at the current deliverable HEAD `14062b4`. Most rows cite the launcher; the
test-coverage row cites the suite. `.omp/skills/tower/SKILL.md` and the committed audit
reports are data that may lag — the source wins.

| entry | topic | added |
| --- | --- | --- |
| 2026-10-09-verbs-and-usage.md | verb set, default `plan`, per-verb flags, usage errors (exit 64) | 2026-10-09 |
| 2026-10-09-exit-envelope-taxonomy.md | exit constants 0/2/64, typed envelope, COMMAND_MISSING, precedence | 2026-10-09 |
| 2026-10-09-fleet-spec-schema.md | spec fields, required/optional, every default | 2026-10-09 |
| 2026-10-09-spec-validation-refusals.md | the INVALID_SPEC census and its CLI reachability | 2026-10-09 |
| 2026-10-09-scope-overlap-gate.md | SCOPE_OVERLAP truth table, canonicalization, mutation probes | 2026-10-09 |
| 2026-10-09-l1-pane-ceilings.md | L1_CEILING_EXCEEDED / PANE_CEILING_EXCEEDED, gate order, boundaries | 2026-10-09 |
| 2026-10-09-band-authority-config.md | keys read/not read from config/ufo.json; CONFIG_UNREADABLE arms | 2026-10-09 |
| 2026-10-09-ceiling-relational-model.md | the limit model: which limit is which and who reads each | 2026-10-09 |
| 2026-10-09-write-confinement.md | write-root validation and symlink refusal | 2026-10-09 |
| 2026-10-09-write-site-inventory.md | every fs write, its guard, and the absent removal primitive | 2026-10-09 |
| 2026-10-09-argv-integrity.md | spawnSync argv arrays, quoteArg, unvalidated `base` option slot | 2026-10-09 |
| 2026-10-09-interactive-guard.md | INTERACTIVE_GUARD vocabulary, the tautological --cwd assert | 2026-10-09 |
| 2026-10-09-prompt-rendering.md | l1-prompt.md placeholder ledger and the two unresolved gates | 2026-10-09 |
| 2026-10-09-worktree-lifecycle.md | branch, `omp worktree add`, silent reuse, skill copy order | 2026-10-09 |
| 2026-10-09-launch-idempotence.md | wall-run-id adoption, RUN_ID_RESERVED, prompt reuse | 2026-10-09 |
| 2026-10-09-launch-partial-policy.md | per-mission failure, LAUNCH_PARTIAL, the fleet.json caveat | 2026-10-09 |
| 2026-10-09-fleet-state-artifact.md | `<stateDir>/fleet.json` keys and record fields | 2026-10-09 |
| 2026-10-09-status-reconciliation.md | both-direction reconciliation, sources, rounds column | 2026-10-09 |
| 2026-10-09-close-policy.md | PANE_LIVE/--force, WALL_ABSENT, COMPLETE_FAILED, two holes | 2026-10-09 |
| 2026-10-09-wall-integration.md | the four wall invocations, liveness-sourcing rule, wall fields | 2026-10-09 |
| 2026-10-09-l1-pane-binding.md | the pane's omp argv, the `@<alias>` bucket, bound configs | 2026-10-09 |
| 2026-10-09-test-coverage-map.md | block→surface map, fixture discipline, proven gaps | 2026-10-09 |
| 2026-10-09-skill-source-drift.md | SKILL.md vs source: 3 DRIFT, 11 SILENT | 2026-10-09 |
| 2026-10-09-safety-invariants.md | the six header invariants + prior-audit open/closed table | 2026-10-09 |
| 2026-10-09-launcher-history.md | the 20-commit contract evolution and header-bullet map | 2026-10-09 |
| 2026-10-09-evidence-digest.md | round-1 objective gates (node --check, suite 967 ok) | 2026-10-09 |
