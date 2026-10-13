# wave-context-block — the bounded prior-refinement digest an L1 injects

Asked: the `ufo-refinement-context-v1` block and how `ufo-swarm-wave.mjs` consumes it. Anchor: `ufo-fsd-alpha@5ace2559`. Source: `reports/ledger-keeper/<Lane>.md` (mission round 1, wave `ledger-keeper-r1-w1`). Lane: `WaveContextBlock` (connector).

Observed (`scripts/ufo-refinement-context.mjs`):
- `REFINEMENT_CONTEXT_SCHEMA "ufo-refinement-context-v1"` (:24); caps `MAX_REFINEMENT_ENTRIES` 16 (:25) and `MAX_REFINEMENT_BYTES` 1024 (:26);
  fixed `REFINEMENT_INSTRUCTION`; BEGIN/END delimiters repeat the warning; entry projection keys exactly `[seq,kind,title,createdAt,sha256]`
  (any extra key, e.g. a smuggled `body`, → `prior_refinement_refused "not the titles-only projection"`); `<`/`>` escaped so a stored title
  cannot forge END; overflow `prior_refinement_overflow` **rejected, never truncated**; `binding.sha256` hashes the exact escaped bytes.
- `readPriorRefinement` (:91-103): unreadable → refused; missing/validated-empty → explicit EMPTY digest; else the shipped `readForSuccessor`
  path — never a fallback to an unbound/different ledger.
- Wire-up (`scripts/ufo-swarm-wave.mjs`): `--prior-refinement <ledger> --expect-parent-run <runId>` declared together (pairing = usage exit 64);
  `gatedRegistryPath` root-gate (outside → `EXEC_PATH_OUTSIDE_ROOT`); `withPriorRefinement` (:1362-1378) appends the block **after** the
  byte-identical context head; `plan.priorRefinement` binds its sha256; a refusal aborts before `persistWaveRegistry` (no registry, no payload).
- Exercised: parent mismatch → exit 1 `prior_refinement_refused`; overflow 16-entry store → exit 1 `serialized block is 2802 bytes; the cap is 1024`.
  **The byte cap is the live law** (the count cap is unreachable through the shipped path): ~5 minimal entries = 1013 B pass, 6 = 1166 B refuse;
  a passing block always reflects the whole store digest. Remediation: `prune --keep 5 --expect-parent-run` then plan.

Changed: nothing (bounded proposal only). Unknowns: none material.

Report: `reports/ledger-keeper/WaveContextBlock.md`.
