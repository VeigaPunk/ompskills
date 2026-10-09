# gates-drills-history — the removed `gates.sh` drills stage

Asked: when the stage was added and removed, what it ran, its tri-state, and what residue remains.
Anchor: `ufo-fsd-alpha@5ace2559` (read-only); `config/ufo.json` cited from the working copy (sha256 `0e416f0a…`, uncommitted swarm-band edit only). Lane: `GatesDrillsHistory` (read-only git).

## History
- Earliest visible: `4f10fbff` (2026-09-20). It is a shallow graft, so this is a whole-file add; earlier history is not available.
- `faf466b2` (lean-gates r1) added `if group_selected drills` and the fast-tier SKIP.
- Removed in `91cc18fe` (2026-09-21, "frontier: 1024-lane swarm topology + stripped gate battery"; gates.sh 1487 → 869 lines). The message lists drills among the removed items and gives no stage-specific reason.
- **Lineage:** `91cc18fe` is on `refs/remotes/cursor/HEAD`, not an ancestor of `main`. Main's graft root `72ab84a8` already lacks the stage.

## What it ran (pre-removal blob `91cc18fe^:scripts/gates.sh:1247-1308`)
- `run_or_skip "drill harness self-test" drills node scripts/ufo-drills.mjs --self-test`
- `invariant drill matrix`: `env UFO_DRILL_TMP=$TMP/drill-shadows node scripts/ufo-drills.mjs`, gated by a tri-state over `config/ufo.json drills.enabled`: `true` runs; `false` records SKIP with the "explicit kill-switch" echo; an absent or non-object block FAILs `missing:`; an unparseable config FAILs `unreadable:`; any other type FAILs `invalid:`.
- Stamp `GATES-DRILLS-SHA256 <sha256> files=N` over the blob SHA1s of `drills/*.drill.json`; `ufo-drills.mjs` was in the battery list. `gates-plan.mjs` had a `drills` group (config/, drills/, scripts/ufo-drills.mjs).

## Residue at HEAD
- `gates.sh:324` comment "drill kill-switch" names a SKIP that no longer exists.
- `gates.sh:641-643` comment promises "a corpus digest of the drill matrix"; the stamp loop (`:645-680`) does not digest `drills/` and does not list `ufo-drills.mjs`.
- `gates.sh:691` "Drill surface (D-wall)" refers to the wall probe (naming only).
- Outside gates: the `config/ufo.json` drills note; the `assertDrillsContract` message `(gates.sh tri-state consumer)`; Spec 09 `:20,:33`.
- Today `drills/` and `scripts/ufo-drills.mjs` match no `gates-plan.mjs` rule, so touching them selects all groups via the planner fail-safe, yet no group runs a drill.
