# launch-test-coverage — What the test suite pins about the post-run record

Source: r1 lane `LaunchPartialTests` (fleet `shokunin3`, mission `receipt-keeper`, wave `receipt-keeper-r1-w1`); anchor launcher `sighting/tower-fleet.mjs` @ `ada7a90` (sha256 `80f0814e…`).

## Asked

Which tests pin fleet.json, LAUNCH_PARTIAL, failures, roundReceipts, status reconcile.

## Observed

- None. No test runs a successful `launch --apply`; launch coverage is refusals only (`MUTATION_REQUIRES_APPLY` test/tower-fleet.test.mjs:450, :1136-1138; `INVALID_SPEC` :1164-1165; symlinked fleet.json leaf refused :1645-1647, :1676-1678).
- Status is pinned only for argv (`status --lite`) and zero state writes (:1626-1627).
- Unpinned source: :583-593, :627-634, :907-928, :945-947, :951-958, :1006-1147. Every claim about these comes from source reading, not tests.

## Unknowns

- The main checkout's dirty test file (+74 lines) was not inspected.
