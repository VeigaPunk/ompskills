# r2-substrate-incident — a review lane clobbered substrate config/ufo.json

Asked: (incident record, not an assignment) what happened to the substrate band authority during round 2 and how it was restored.

## Observed
- 19:27:12Z: substrate `config/ufo.json` became the 13-byte `{"drills":{}}` (mtime 16:27:12.85 local).
- Writer (from transcript `sessions/drill-keeper/…/VGatesDrillsHistory.jsonl`, tool call at 19:27:12.747Z): one bash line beginning `cd /home/vgpnk/Projects/ufo-fsd-alpha && …` then `cd /tmp/gk/pre_cfg && (…)` and later `printf '%s' '{"drills":{}}' > config/ufo.json`. In this pane's bash tool **`cd` is aliased to `__fnmcd`, which can fail** (`command not found`), so the second `cd` did not move and the relative redirect landed in the substrate. The lane meant to probe the removed gates.sh tri-state against a scratch config.
- No drill-keeper lane wrote anything else to the substrate (`git status` and a `find -newermt` sweep show only README.md/config/ufo.json/fleet-dispatcher.test.mjs modified — the latter two pre-existing — plus a sibling's empty `reports/omarchy-smith/`).
- Restoration (19:30:50Z, L1): verified non-symlink target and a byte-exact source — the DrillKeeperSmoke scratch copy at `.tower/fleets/shokunin3/scratch/drill-keeper/DrillKeeperSmoke/tree/config/ufo.json`, sha256 `0e416f0a…`, equal to the pre-incident working copy hashed independently by ≥ 6 lanes — then `cat` into the substrate path (in-place, no rename). Post-check: sha256 `0e416f0a…`, 11999 bytes, `git diff --stat` = the operator's 3+/3- swarm-band edit only, live band 16/32, maxConcurrentL1 16.
- Exposure window ≈ 3 min 38 s. Any reader in that window (any fleet mission's launcher or validator) saw an unreadable band authority. 28 r2 lanes answered a stop-rule broadcast with their config-read provenance; all cite sha `0e416f0a` reads, several cannot timestamp them; no r2 verdict depends on config contents beyond that hash.

## Rules learned (now in the card's bounds)
- Never chain `cd X && … > relative` in this harness; use absolute paths for every write.
- A "read-only" lane must not create probe files anywhere except an absolute scratch path.
