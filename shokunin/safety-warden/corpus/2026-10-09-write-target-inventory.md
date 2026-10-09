# write-target-inventory — write-target-inventory — every write site mapped to its guard

Asked: does every filesystem mutation have a preceding guard, and where?
Source: `sighting/tower-fleet.mjs:204-220,237-251,257-285,287-307,401-402,597-614,697-699,706-708,727-728,797,835-842,906-907,1151-1244`. Lane: `WriteTargetInventory`.

- Complete map, no gaps: `copySkill` :697 → `mkdirSync` :698 / `cpSync` :699; `stateDir` :727 → `mkdirSync` :728; slot :797 → reuse :798 / `omp worktree add` :805; sessions :835 → `mkdirSync` :836; prompt :837 → `writeFileSync` :842; `fleet.json` :906 → `writeFileSync` :907. `close` performs **no** fs write (wall `complete` + prints only).
- **Pre-flight + per-site recheck is real** (`assertLaunchWriteTargets` :708 before wall `open` :714, then a recheck immediately before each write). Proved by a wall-stub hook: on refusal the wall log is 0 bytes.
- The `node:fs` import set (:70-81) has no `rm`/`unlink`/`rmdir`.
- The wall CLI shell-out is the launcher's one write-adjacent action with no launcher assert — the wall is its own writer; `ufoRoot` is root-gated (:401-402) and substrate-banned (:238-251).

## Unknowns
- Per-site recheck's TOCTOU-window-only catch is not race-orchestrated here; wall-side shell-out writes are not asserted by the launcher.
