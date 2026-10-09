# close-record — What close reads, writes, and leaves as a record

Source: r1 lane `CloseRecord` (fleet `shokunin3`, mission `receipt-keeper`, wave `receipt-keeper-r1-w1`); anchor launcher `sighting/tower-fleet.mjs` @ `ada7a90` (sha256 `80f0814e…`).
L1 re-verified: `MAX_COMPLETED_MISSIONS = 50` grepped in base.mjs:65.

## Asked

After `close --apply`, which artifacts record the closure?

## Observed

- `verbClose` (:1151-) reads spec, band authority, wall registry (`status --lite`); never reads or writes fleet.json or any state-dir file.
- Side effect: one wall `complete` per target → rewrites `ufo-fsd-alpha/.ufo/sighting/manifest.json` (row `status: completed`, `completedAt`, `finalNote` "tower-fleet close…").
- `PANE_LIVE` refuses before any complete unless `--force`; a failed complete records `COMPLETE_FAILED` per mission and throws after the loop (:1203, :1227).
- Prints completed/skipped/FAILED lines then one `git -C <repo> worktree remove <path>` per result.
- The wall evicts completed rows beyond `MAX_COMPLETED_MISSIONS = 50` (`ufo-sighting-lib/base.mjs:65`), so old closures can vanish from the only place they were recorded.
- `completed` ≠ success: a completed row may carry a refusal `finalNote`.

## Unknowns

- Whether wall `remove` erases the closure row.
- Forced close may kill the pane via geometry settle [INFERENCE].
