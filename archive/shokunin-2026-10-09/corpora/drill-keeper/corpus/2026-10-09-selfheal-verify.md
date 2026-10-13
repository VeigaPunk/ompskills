# selfheal-verify — `scripts/fleet-selfheal-verify.mjs`

Asked: exits, report schema, skips, how gates confines it, and the danger of default paths.
Anchor: `ufo-fsd-alpha@5ace2559` (read-only); `config/ufo.json` cited from the working copy (sha256 `0e416f0a…`, uncommitted swarm-band edit only). Lane: `SelfhealVerify` (source); behaviour observed by `SelfhealScratchRun`.

## Contract
- Scope: proves the 2026-09-16 ledger-overflow fix end to end against `scripts/fleet-dispatcher.mjs` with a stub wall. Every dispatcher child gets an **allowlisted** env (`:480-508`: PATH, HOME, pinned `UFO_*`, `UFO_FLEET_ALLOW_EXTERNAL_TOOLS=1`, `UFO_FLEET_POLL_SEC=1`; no TMPDIR).
- Startup mirror check (`:45-80`, runs before argv, so `--help` too): `MAX_LEDGER_BYTES` 10 MiB, `MAX_LEDGER_SEGMENTS` 5, `MAX_LEDGER_READ_BYTES` 32 MiB, `LIFECYCLE_SCHEMA`, and `LEDGER_BASE` regex-read from the dispatcher source. Drift → exit 2. `MAX_LEDGER_ARCHIVE` is not mirrored; the check is textual, so a reformat gives a false exit 2.
- Exits: **0** no failed check (skips allowed); **1** any failed check; **2** mirror drift, a fixtures/report path outside `tmpdir()` or `.ufo/scopes/selfheal-prove/`, a non-regular/symlink report target, an existing fixtures dir without the ownership marker, a duplicate/valueless flag, or a refused report write (`O_NOFOLLOW`); **64** unknown argv token.
- Report `selfheal-prove-verify-v2`: `at, dispatcher, checks[{name,status,detail}], diagnostics{read,rotate}, passed, failed, skipped, verdict`.
- Skip = check cannot run: 9 `preswap_*` when `.ufo/ledger-preswap-20260916/` is absent (retired, true on this host); 12 dependents if the overflow build fails.
- **Defaults write into the substrate:** with no flags it writes `ROOT/.ufo/scopes/selfheal-prove/fixtures-<pid>/` and never removes it (an earlier review recorded ~917 MB of orphans). Always pass both `--fixtures-dir` and `--report` beneath `$TMPDIR`.
- Gates (`gates.sh:764-787`) pins `TMPDIR=$TMP` plus both flags; its census checks only numeric counts and `failed === 0`, not schema/verdict/check names.

## Drift
Header `:5` names `fixtures/` (code uses `fixtures-<pid>`); header `:15` claims the preswap replay "replays clean" (it is skipped here); `--help` omits exits 2/64.
