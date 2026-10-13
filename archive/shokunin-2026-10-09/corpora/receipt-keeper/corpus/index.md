# receipt-keeper corpus

Append-only memory for the `receipt-keeper` shokunin: fleet archaeology — the post-run
`.tower/fleets/<fleet>/` record and its honest reconstruction. Read this index and the
entries relevant to the assignment before starting; after finishing, write a dated entry
and append one row here. Never rewrite or delete an entry or row.

| entry | topic | added |
| --- | --- | --- |
| 2026-10-09-fleet-json-schema.md | fleet.json top-level and per-mission record keys | 2026-10-09 |
| 2026-10-09-fleet-json-schema-eras.md | Three record schemas across real fleet.json files | 2026-10-09 |
| 2026-10-09-read-fleet-state.md | readFleetState and its two callers | 2026-10-09 |
| 2026-10-09-failure-codes.md | recordMissionFailure and every code that can land in a record | 2026-10-09 |
| 2026-10-09-launch-partial.md | LAUNCH_PARTIAL ordering, ok semantics, post-mutation exits | 2026-10-09 |
| 2026-10-09-round-receipts-fn.md | roundReceipts matcher, sort, and prefix hazard | 2026-10-09 |
| 2026-10-09-status-reconcile.md | verbStatus reconciliation and its observed output | 2026-10-09 |
| 2026-10-09-close-record.md | What close reads, writes, and leaves as a record | 2026-10-09 |
| 2026-10-09-spec-json.md | Fleet spec schema and the on-disk spec census | 2026-10-09 |
| 2026-10-09-shokunin-fleet-audit.md | Reconstruction of fleet shokunin | 2026-10-09 |
| 2026-10-09-shokunin2-fleet-audit.md | Reconstruction of fleet shokunin2 | 2026-10-09 |
| 2026-10-09-tower1-fleet-audit.md | Reconstruction of fleet tower1 and its rewritten state | 2026-10-09 |
| 2026-10-09-tower1-root-artifacts.md | tower1's non-standard root artifacts | 2026-10-09 |
| 2026-10-09-safety-r2-and-towerprobe.md | Single-mission fleets tower1-safety-r2 and towerprobe | 2026-10-09 |
| 2026-10-09-receipt-slots-tower1.md | Receipt slot census, tower1 (26 receipts) | 2026-10-09 |
| 2026-10-09-receipt-slots-shokunin.md | Receipt slot census, shokunin + shokunin2 (31 receipts) | 2026-10-09 |
| 2026-10-09-continue-stop-ledger.md | Every round's continue/stop decision across 59 receipts | 2026-10-09 |
| 2026-10-09-wave-artifact-zoo.md | Every waves/ filename pattern and the minimal reconstruction set | 2026-10-09 |
| 2026-10-09-swarm-registry.md | swarm-registry.json census and record gaps | 2026-10-09 |
| 2026-10-09-report-counts.md | Lane-report completeness vs registries vs receipts | 2026-10-09 |
| 2026-10-09-sessions-transcripts.md | Mining sessions/<id>/ transcripts | 2026-10-09 |
| 2026-10-09-prompt-as-record.md | The rendered prompt as a render-time record | 2026-10-09 |
| 2026-10-09-git-reconstruction.md | Git as corroboration: integration verdicts | 2026-10-09 |
| 2026-10-09-wall-cross-ref.md | Joining fleet.json to the wall manifest | 2026-10-09 |
| 2026-10-09-launch-test-coverage.md | What the test suite pins about the post-run record | 2026-10-09 |
| 2026-10-09-docs-drift.md | Doc claims about the post-run record vs code | 2026-10-09 |
| 2026-10-09-reconstruction-hazards.md | Fifteen ways a fleet dir misleads an auditor | 2026-10-09 |
| 2026-10-09-receipt-claim-audit.md | Procedure and results of auditing four receipts | 2026-10-09 |
| 2026-10-09-ceiling-enforcement.md | roundCeiling and maxTime are not enforced | 2026-10-09 |
| 2026-10-09-live-fleet-shokunin3.md | An in-progress fleet as a specimen | 2026-10-09 |
| 2026-10-09-boundary-map.md | receipt-keeper's boundary with neighbouring shokunin | 2026-10-09 |
| 2026-10-09-towerprobe-verify-audit.md | Four-question audit of towerprobe: failure, receipts, integration, pane | 2026-10-09 |
| 2026-10-09-r2-corrections-ledger.md | Every r1-corpus claim falsified by the r2 wave | 2026-10-09 |
| 2026-10-09-round-attribution.md | Splitting lanes by round when the registry overwrote r1 rows | 2026-10-09 |
| 2026-10-09-band-config-clobber.md | A sibling L1 overwrote the substrate band authority; fleet.json never shows it | 2026-10-09 |
| 2026-10-09-scratch-contamination.md | scratch/: 505 MB of unlisted working space incl. 68 ufo.json copies | 2026-10-09 |
