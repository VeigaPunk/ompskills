# docs-drift — Doc claims about the post-run record vs code

Source: r1 lane `DocsDrift` (fleet `shokunin3`, mission `receipt-keeper`, wave `receipt-keeper-r1-w1`); anchor launcher `sighting/tower-fleet.mjs` @ `ada7a90` (sha256 `80f0814e…`).

## Asked

Where skills/docs misdescribe fleet.json, receipts, LAUNCH_PARTIAL.

## Observed

- D1 `.omp/skills/tower/SKILL.md:152-153`: "a failed worktree add aborts the run outright" — code :795-817 records and continues to LAUNCH_PARTIAL (changed in `803f1ad`).
- D2 tower SKILL :153-154: existing worktree "reused with a warning" — :798-799 sets `worktreeReused` silently (warning dropped in `99af0eb`).
- D3 tower SKILL :171-172: failing wall complete "aborts first" — :1195-1205 records per mission; COMPLETE_FAILED after the loop.
- D4 tower SKILL :168: status "reads each mission's round receipts" — reads filenames only.
- D5 swarm SKILL :180-183: LAUNCH_PARTIAL the only post-mutation exit 2 — COMPLETE_FAILED too.
- Verified true: LAUNCH_PARTIAL leaves fleet.json; the launcher doc comment :1-77 matches code.

## Unknowns

- Whether the dirty skill diff in the main checkout fixes any of D1-D5 (it does not touch D1-D3).
