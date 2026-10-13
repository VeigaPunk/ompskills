# git-reconstruction — Git as corroboration: integration verdicts

Source: r1 lane `GitReconstruction` (fleet `shokunin3`, mission `receipt-keeper`, wave `receipt-keeper-r1-w1`); anchor launcher `sighting/tower-fleet.mjs` @ `ada7a90` (sha256 `80f0814e…`).
L1 re-verified: `git check-ignore -v .tower/fleets/x` → `.git/info/exclude:7:.tower/`.

## Asked

How git confirms or denies a mission's integration.

## Observed

- `.tower/` is git-ignored (`.git/info/exclude:7`); `git ls-files .tower` → 0. Git never holds receipts, reports or fleet.json.
- 44 mission rows / 6 fleet.json (43 branches; `tf-safety-r2` twice). Three states: 32 integrated (merge commit, tip ancestor of main); 2 merge exists but tip ahead and **not** on main (`tower1/tf-launcher` tip `7f98487`, `tower1/tf-audit-wall` tip `29849d3` — both the commits the receipts name as accepted); 10 shokunin3 rows with tip = main (`ada7a90`), no unique commits (ancestor check vacuous).
- Commands: `git merge-base --is-ancestor <branch> main`; `git rev-list --count main..<branch>`; `git log main --merges --grep='Merge <branch>'` **without** `--first-parent` (feat/* merges hide some, e.g. `dee8da6` for tf-band).
- `omp worktree list --json` → `[]` (tracks `~/.omp/wt` only); use `git worktree list`.
- Orphan: `tower/tower1/tf-audit-safety` branch + worktree with no fleet record.
- `RECONCILE_UNATTESTED_STOP` does not predict integration.

## Unknowns

- Full set of merges hidden by `--first-parent` not enumerated.
