# launcher-history — the contract's evolution

Asked: reconstruct the launcher's contract evolution and map each header bullet to a hunk.
Source: `git -C /home/vgpnk/Projects/ompskills log/show/-S/-G -- sighting/tower-fleet.mjs` (20
commits, 2026-10-08 22:07:52 → 2026-10-09 00:37:05) @ b251c5a. Lane: `HistoryIntent`.

File identity: the worktree file hashes `80f0814e2cddf2db207a7dd596124826717d27cace27c1cea52bbec43d4f4d41`,
byte-identical to the blob at `6206db3` (the tip of the launcher's history — `b251c5a` does not touch
it). Every current line quoted here is the tip.

Timeline (oldest first):
- `3a688c7` the launcher is introduced (verbs, `plan` default, `--apply` gate, exit 0/2/64, safety
  bullets 1-4, `spawnSync` runner, `interactiveGuard`, the per-path removal printout); **one wall
  failure aborted the whole launch** (`typed("LAUNCH_FAILED", ...)`).
- `3dee568` partial-failure recording replaces the abort (record + `continue`, `ok: failures.length
  === 0`, trailing `LAUNCH_PARTIAL`).
- `a9c5f02` idempotent relaunch (`paneReused`/`promptReused`), status two-way reconciliation with
  zero writes, `PANE_LIVE`/`--force` close guard; header gains bullets 5/6(first form)/8/9(first form).
- `0612491` adoption keyed by run id across the whole manifest (+ foreign-fleet warning).
- `a251c5f` close records a failed wall `complete` per mission.
- `599daa4` whole registry (live + retired `completed[]`/`stopped[]`), `RUN_ID_RESERVED`; bullet 6
  rewritten.
- `ea8f6a7` write-root realpath refusal introduced; bullet 2 extended.
- `26313e6` liveness from the live view only (`liveViewById`; a no-level row reads LIVE); bullet 7
  added — fixes the `599daa4` retired-phase regression.
- `803f1ad` round-2 write-safety: **both sides** realpath-resolved (lexical-root laundering fixed),
  dangling refused, `STATE_DIR_UNAVAILABLE` typed, `recordMissionFailure` single-count +
  `secondaryFailure`, per-mission `MISSION_FAILED` catch, `wallRowDisposition` labels.
- `561ebf5` unusable write root stays typed (non-throwing lstat against ENOTDIR).
- `ecc2f2e` close refuses `WALL_ABSENT` (not `--force`-bypassable); no header bullet added.
- `99af0eb` derived write targets confined (`assertSafeWriteTarget` + `assertLaunchWriteTargets` at
  every write site); `0bc1c79` repo-root/dot scope bypass refused; `6206db3` close results report
  `wallRowDisposition`.
- Intermediate (`subject`+pickaxe only): `b8a639b` round-1 corrections, `e27901d` `worktreeRecreated`,
  `5c2df5c` ghost/`staleMissionCount`, `7f8ced2` stale-row naming on a reserved run id, `f28747b`
  hatch + uniform keys, `efd6d88` launch-record reuse-key init.

Header-bullet → enforcing site (all nine bullets at :21-52 are enforced today; none un-enforced):
B1 no sweep / print-only removal — never edited since `3a688c7`; `git log -S 'worktree remove'`
touches only `3a688c7`, no later commit added an executed removal; no rm/unlink primitive imported.
B2 write-root refusal — wording `ea8f6a7`, both-sides realpath `803f1ad`, derived leaves `99af0eb`.
B3 argv-only shell-out — from `3a688c7`; `shell: true` **never appears in any of the 20 commits**
(pickaxe NONE).
B4 interactive guard — from `3a688c7`; construction-enforced, the :483 check is a tautological
tripwire.
B5 partial failure — code `3dee568`, bullet wording `a9c5f02`, one-cause/secondary `803f1ad`.
B6 idempotent relaunch — `a9c5f02`/`0612491`/`599daa4`/`803f1ad`/`e27901d`/`efd6d88` (the last builds
the stable launch-record key set at :747-751).
B7 live-view liveness — `26313e6`; likely regressed at `599daa4`, restored at `26313e6`.
B8 status reconciliation, zero writes — `a9c5f02`.
B9 close PANE_LIVE/`--force`, COMPLETE_FAILED — `a9c5f02` (guards), `a251c5f` (per-mission record;
`3a688c7` had a typed abort), `5c2df5c`/`7f8ced2` (ghost naming on the absent-skip path), `6206db3`
(disposition reporting).
Verbs/exit block (the verb list is :11-15; :17-19 is the default-verb + exit-code paragraph) — from `3a688c7`. One usage drift: `[--force]` was added to the `close`
usage line with the `PANE_LIVE` guard in `a9c5f02`.

Reverse drift (the code enforces MORE than the header names): `WALL_ABSENT` (:1164-1167),
`STATE_DIR_UNAVAILABLE` (:730), the registry-truncation warning, and the scope dot/repo-root
rejection (:179-181) are not listed in the safety-contract section.

Regression windows (all closed): mid-fleet abort only in `3a688c7`; the retired-row liveness leak
between `599daa4` and `26313e6` (spurious `PANE_LIVE` + a dropped mission); the silent no-op close on
an absent wall until `ecc2f2e`.

The `ea8f6a7` "01:22Z clobber" incident referenced in its message **is** documented in this repo's
committed reports (`reports/tf-audit-band.md:30`: the authority file was clobbered at 01:22Z by a
lane writing through a symlink and restored at 01:31Z; also `reports/tf-probe-band.md:89,100` and
`reports/tf-audit-tests.md:136`) — corrected in round 2.

UNKNOWN: the `b8a639b` hunks were not fetched (subject+pickaxe only); the wall's display-slice cap
constant was not traced.

Evidence: lane `HistoryIntent` (blob sha identity, per-commit diffs, pickaxe).
