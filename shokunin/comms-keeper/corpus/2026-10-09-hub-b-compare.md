# 2026-10-09 — the second hub (/home/vgpnk/.tower/comms, base master)

**Asked.** Audit hub B and compare with hub A.
**Sources.** `/home/vgpnk/.tower/comms/` (33 files: inbox 15, findings 3, reviews 7, missions 5, log 80 lines, state.json); kimi sessions.
**Observed.**
- A hub lives at the repo root of whatever cwd kimi ran in — hub B is in the **home-directory git repo** (`~/.git`, branch `master`, `~/.git/info/exclude` carries `.tower/`). A keeper that only looks at the project repo misses it.
- Created by kimi `session_56151869-ef85-413f-9d1a-30e31ee0b0fd` (TowerInit 18:26:16Z); two teardowns with a re-plan (M4/M5) in between (second reports `worktree.remove.skipped reason=already-removed` for wt-1..3); taken over at 21:30:28Z by `session_ead1cd07-…` via tower-mode enter, which retired all 10 roster entries.
- Every hub-B artifact conforms to the source templates; differences from hub A are explained by release→adopt (key order, empty roster).
- Contains the only multi-round review series and the only `mission.rework` lines (see `2026-10-09-review-rounds-worked`).
**Changed.** Nothing — read-only research (seed entry).
**Unknown.** None material.

**Lane.** HubBCompare (scout). Report: `.tower/fleets/shokunin3/reports/comms-keeper/HubBCompare.md`.
