# Apply B — merge the dispatch delta

**Asked.** How `mergeDispatch` proves the rewrite is byte-surgical.

**Observed.** `host/apply.mjs:894-940`.

- `applyDispatchEdits` L897, note split/join L900–901, JSON re-parse L903–909
  (refuses invalid JSON), `structuredClone` expected-object equality L913–931
  (the rewritten file must equal the original with exactly the delta applied —
  any other difference aborts the write), `changedLines` count L932–934,
  `backupFile` L930, `writeAtomic` L938.
- Post-apply re-verify L1021–1036: `waveGate(delta)` then
  `mirrorStatusReport(true)`.

**Verified.** Dry run exit 0, all six keys `already correct, line untouched`.
A real pre-apply rehearsal (functions extracted verbatim, run against
`git show HEAD:config/ufo.json` with stubbed backup/write): `changedLines=3`, 0
note rewrites, lines 89/93/94 rewritten in place, 11999 bytes written. The
substrate `config/ufo.json` is already post-apply and uncommitted
(`git diff HEAD` = 3 lines: minLanes 64→16, waveMinLanes 32→16, waveMaxLanes
100→32); delta == working tree, hence a no-op merge today.

**Defects found.**

- **F1** (see the merge-edits entry): the note rewrite builds both `from` and
  `to` from the new ceiling, so it can never match the true old band.
- **F2 (medium).** The note rewrite split/join is file-wide (L899–902) while the
  expected-rewrites model only touches `swarm.note`; the guard fires correctly
  (fail-closed) but its message "changed something outside sighting.dispatch" is
  wrong when the hit is inside `sighting.dispatch` (e.g. `queuePath`).
- **F5 (medium).** `mirrorStatusReport(true)` whitewashes any post-apply
  `--check` failure as expected drift (see the gate-7 entry).

**Unknowns.** `--apply` never run; the `add` branch is source-read only.

**Added.** 2026-10-09 · lane `MergeDispatchPath` (critic)