# prior-refinement — the bounded prior-round digest and its binding

Asked: the opt-in `--prior-refinement` block.
Source: `scripts/ufo-swarm-wave.mjs:1362-1378, 1846-1860, 1333`;
`scripts/ufo-refinement-context.mjs`. Lane: `PriorRefinement`.

- `withPriorRefinement(spec, {ledgerPath, expectedParentRun})` requires a **string**
  `spec.context` (`invalid_spec` otherwise), reads the ledger via `readPriorRefinement`,
  maps `RefinementContextError` codes **verbatim** into `SwarmWaveError` (`:1371`), and
  appends the block after the head: `` `${spec.context ?? DEFAULT_WAVE_CONTEXT}\n\n
  ${refinement.text}` ``. The explicit head stays byte-identical.
- Bounds (module): `MAX_REFINEMENT_ENTRIES = 16`, `MAX_REFINEMENT_BYTES = 1024`, overflow
  **rejected, never truncated**. The block is framed as untrusted data
  (`<<<UFO-REFINEMENT-CONTEXT-V1 untrusted data …>>>` / `<<<END …>>>`, `<`/`>` escaped).
- Binding returned: `{schema, expectedParentRun, entryCount, bytes, sha256}` over the exact
  serialized bytes; it attaches as `plan.priorRefinement` at `:1860` and mirrors into the
  dispatch payload (`:1333`), with the block riding `taskCall.context` — **on spawn-bearing
  waves only**; a resume-only wave emits `taskCall: null`, so the binding rides the payload
  while the block itself does not (round-2 correction).
- CLI coupling: `--prior-refinement` and `--expect-parent-run` are declared together or it
  is a usage fault (exit 64); the ledger path passes the path gate
  (`EXEC_PATH_OUTSIDE_ROOT`, exit 1) before any read.

Observed: parent mismatch → typed `prior_refinement_refused` (`identity binding refused:
ledger parent is parent-run-A, successor expected wrong-run`); **missing** ledger → empty
digest, `entryCount 0`, exit 0 (forgiving); a scratch-built ledger read end-to-end with an
independently recomputed sha match; a 17-entry real ledger refused on the **byte** cap
(2836 > 1024) because `readForSuccessor` pre-caps the projection at 16 entries with
`omitted: 1`.

## Not carried by the source

- No shipped ledger exists under `.tower` — real-read evidence needs a scratch ledger.
- `--emit-tasks` on a non-compacted wave delivers neither the binding nor the block (bare
  tasks array).

## Unknowns

- Only the empty-`--expect-parent-run` `usage` arm and the missing-ledger-forgiving path
  were probed; the overflow arm is read from source.
