# gates-fixture-stages — fixture-bearing stages of today's `scripts/gates.sh`

Asked: how fixture stages record and skip, how scratch is handled, which run on which tier, and what env each gets.
Anchor: `ufo-fsd-alpha@5ace2559` (read-only); `config/ufo.json` cited from the working copy (sha256 `0e416f0a…`, uncommitted swarm-band edit only). Lane: `GatesFixtureStages` (source only).

## Vocabulary and census
- `WALL_PROBE_LABELS` 3 (`:38`), `ALWAYS_LATER_LABELS` 31 (`:39-71`), `CONDITIONAL_LABELS` 5 sekhmet (`:72-75`). **No drill label.**
- `record` accepts PASS|FAIL|SKIP only; `run` records PASS, or FAIL and then `fail`; `run_or_skip`/`skip_group` record SKIP for unselected groups.
- `assert_index_census` (`:316-377`): every required label is recorded, every recorded label is in the vocabulary, and a completed run carries no FAIL. Floors: wall ≥ 3, always ≥ 30.

## Tiers
`UFO_GATES=fast|full` (default fast). Fast asks `scripts/gates-plan.mjs` for groups `fleet, retention, l0, swarm, hooks, portable` from the git-touched set. An unmapped path or an unreadable touched set selects everything (fail-safe). Wall probe and both contract-mirror stages run on both tiers.

## Scratch
`TMP = mktemp -d ${TMPBASE}/ufo-gates.XXXXXX`, where `TMPBASE` is `$TMPDIR`, else `/scratch/tmp`, else `/tmp`. Cleaned on EXIT. Not exported; pinned per stage via `env`.

## Fleet group (`:747-795`)
| stage | added env |
| --- | --- |
| fleet dispatcher selfheal suite | `UFO_TEST_SCRATCH=$TMP/fleet-dispatcher` (TMPDIR ambient) |
| mission activity / observation, config routing-free, seat table render, hand-authored set, fleet ephemeral (+ l1) | `TMPDIR=$TMP/mission` |
| fleet ledger read | `UFO_FLEET_SCRATCH=$TMP/fleet-ledger-read` |
| fleet ledger rotate | `TMPDIR=$TMP/fleet-ledger-rotate` |
| fleet selfheal e2e verify | `TMPDIR=$TMP`, `--fixtures-dir $TMP/fleet-selfheal/fixtures --report $TMP/fleet-selfheal/report.json` (`run_with_report` dumps the report on FAIL) |
| selfheal report census | inline `node -e`: numeric passed/failed/skipped and `failed === 0` |

All stages inherit the caller's ambient env (no `env -i`).

## Gaps
- The harness's 9 preswap SKIPs are invisible in the index: `fleet selfheal e2e verify` records PASS. Only the census stdout line names them.
- The `:641-643` "corpus digest of the drill matrix" is not emitted (see `gates-drills-history`).
- Comment drift: `:715` says a "29-entry index"; probe-only gives 34 (35 with L3).
