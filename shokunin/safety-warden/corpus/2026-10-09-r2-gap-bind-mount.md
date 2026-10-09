# r2-gap-bind-mount — r2-gap-bind-mount — bind mount escapes; residual now observed

Asked: can a bind mount over a derived destination defeat the guards?
Source: `sighting/tower-fleet.mjs:270-273,280-283,284,708`; card `:172-180` (pre-correction wording "unclosed and untested"). Lane: `GapBindMount`.

- Direct `mount --bind` → `exit 32` "must be superuser to use mount" (`CapEff=0`); reachable via `unshare -Ur -m --propagation private` with the launcher started inside the same namespace.
- **Not refused.** `m1` sessions bind → `exit 0`, `ok:true`, `mkdirSync` created `<ufoRoot>/config/probe`; `m2` worktree-slot bind → `exit 0`, `ok:true`, `copySkill` created `<ufoRoot>/config/.omp/skills/probe/SKILL.md`; `m3` authority bind over the prompt → `exit 0`, `ok:true`, the band authority clobbered (`0e416f0a…` → `817326ec…`, 11999 → 11031 bytes, now the rendered prompt); a re-run then failed closed `CONFIG_UNREADABLE`.
- Mechanism pinned inside the namespace: `realpathSync(sessions)` = the state path; `lstat.isSymbolicLink()` false; `stat` dev/ino of the mount point equals the substrate config dir — a bind mount is the same inode under a different pathname, invisible to `lstat`/`realpath`.
- Restoration: all mounts namespace-private and gone; real substrate config sha unchanged.

## Changed
Card residual-limits bullet updated from "unclosed and untested" to "open, now observed", with the privilege requirement and the closing direction (`statx` mount id or an fd-pinned write).

## Unknowns
- Mounts over the roots themselves, over `fleet.json`, mid-run plants, and a real pane writing through a mounted `--session-dir` were not probed. A same-user actor cannot inject a mount into an already-running launcher's namespace.
