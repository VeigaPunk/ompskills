# r2-gap-enotdir-roots — r2-gap-enotdir-roots — ENOTDIR typed on launch; missing repo accepted lexically

Asked: two round-1 unknowns — ENOTDIR inside a write root, and `realpathDeepest`'s fallback when `repo`/`ufoRoot` are missing.
Source: `sighting/tower-fleet.mjs:204-230,276-277,331,333,397-402`; card `:60-67,104-121`. Lane: `GapEnotdirRoots`.

- **ENOTDIR in a write root**: `plan` passes lexically (`exit 0`, `writes:false`); `launch --apply` refuses `exit 2 INVALID_SPEC` "… cannot be inspected safely: ENOTDIR: not a directory, lstat '…'", wall log 0 lines — typed, never `UNEXPECTED_ERROR`. The card's ENOTDIR clause is confirmed.
- **Missing `repo`**: with `base` given, `plan` accepts it lexically (`exit 0`); with a defaulted `base`, `gitHeadBranch` fails closed (`exit 2 INVALID_SPEC` "cannot resolve repo HEAD branch … is it a git checkout?").
- **Missing `ufoRoot`**: `CONFIG_UNREADABLE` (ENOENT), and `CONFIG_UNREADABLE` with ENOTDIR when a path component is a file; an absent field refuses `INVALID_SPEC`.

## Changed
Card substrate-ban section now records the missing-`repo` lexical acceptance and tightens "lying/absent `ufoRoot`" to "lying/decoy" (absent field / unreadable path refuse).

## Unknowns
- Fake wall and PATH-shadowed `omp` only; real `omp worktree add` against a missing repo not run.
