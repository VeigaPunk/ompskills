# towerprobe-verify-audit — Bounded four-question audit of fleet towerprobe

Source: creation-verification dispatch `ReceiptKeeperVerify` (fleet `shokunin3`, mission `receipt-keeper`); anchor launcher `sighting/tower-fleet.mjs` @ `ada7a90` (sha256 `80f0814e…`, verified via `git show ada7a90:sighting/tower-fleet.mjs | sha256sum`).

## Asked

Q1 partial launch failure; Q2 `roundReceipts` output and stop decision vs `roundCeiling`; Q3 three-way integration of `tf-probe-band`; Q4 is fleet.json `paneId` still trustworthy.

## Observed

- Pins: `fleet.json` sha256 `dd2ad09d…f563` (mtime 2026-10-08 22:14:26 -0300); `spec.json` `67b37eb3…63f1`; `rounds/tf-probe-band-r1.md` `4e79ffb1…fa80`.
- **Launcher drift**: working-tree `sighting/tower-fleet.mjs` is now sha256 `dedcd9a6…`, 1326 lines (`git diff --stat`: +22/−2); `roundReceipts` moved to :971. Line numbers in the card hold only at `ada7a90`.
- Q1: `ok: true`, `warnings: []`, 13 top-level keys, no `failures` key. One mission, 10 keys (`axis base branch id launchResult paneId promptPath skills title worktree`) — the older era, so no `panePhase/retired/...`; `failure`/`secondaryFailure` absent. Only `failure`-named paths are wall data inside `launchResult`: `stopped.0.failure` (= `null`, wall row `swarmTowerPortReview20261007`, `exitCode 129`) and four `failureClass` (`missions.0`, `completed.0`, `completed.1`, `stopped.0`). None is a launcher failure.
- `launchedAt` 01:14:26.636Z precedes the session stem 01:14:26.757Z by 0.12 s — the "up to ~51 s after" skew only appears with multi-mission loops.
- Q2: reimplementation of `ada7a90` :951-958 → `[".../towerprobe/rounds/tf-probe-band-r1.md"]`. Decision line 94: `**Stop.** Round ceiling 1 reached with a clean, complete round: 16/16 lanes`. Consistent with `roundCeiling: 1` (line 3 also states "round 1 of 1 (round ceiling 1)").
- Q3 (in `/home/vgpnk/Projects/ompskills`, main = `ada7a90`): tip `5daeda4`; `git merge-base --is-ancestor tower/towerprobe/tf-probe-band main` exit 0; `git rev-list --count main..tower/towerprobe/tf-probe-band` → `0`; `git log main --merges --oneline --grep='Merge tower/towerprobe/tf-probe-band'` → `7158dcd` (parents `e78d7f6 5daeda4`, 2026-10-08 23:38:30 -0300). The same grep with `--first-parent` returns nothing — another feat/*-hidden merge. Worktree still present at `5daeda4`.
- Q4: fleet.json `paneId: "%5"`, no `panePid`. tmux server `start_time` 1791570897 = 2026-10-09T18:34:57Z (after the 03:05:38Z `sighup` session_exit). Live `%5` = pid 10564, `@ufo_sighting_mission m_1a59a2d1…`; manifest (`/home/vgpnk/Projects/ufo-fsd-alpha/.ufo/sighting/manifest.json`, sha256 `a5c20b54…65d3`, 45 rows) maps that to runId `nightcall-keeper`, fleet `shokunin3`, created 18:35:51Z. No manifest row has runId `tf-probe-band` (16 tf-* rows remain; probe evicted or never retained). Recorded `%5` now names a different mission.

## Changed

Nothing outside this entry and its index row.

## Unknowns

- Exact launcher revision that wrote the 10-key record (absence of `failure` is read alongside `ok:true`, not alone).
- Why the manifest no longer carries a `tf-probe-band` row (eviction vs removal).
