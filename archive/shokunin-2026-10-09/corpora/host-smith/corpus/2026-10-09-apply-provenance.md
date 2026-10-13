# Apply provenance — the substrate `.bak` trail

**Asked.** Round 1 asserted the substrate `config/ufo.json` is already post-apply
and uncommitted, but documented no evidence trail.

**Observed.** `/home/vgpnk/Projects/ufo-fsd-alpha/config/`.

- **Working tree:** `git status --porcelain config/ufo.json` → ` M config/ufo.json`;
  `git diff -U0 HEAD` = index `925beb48..c436722f`, hunks `@@ -89 +89 @@` and
  `@@ -93,2 +93,2 @@` (minLanes 64→16, waveMinLanes 32→16, waveMaxLanes 100→32).
  Worktree `ufo.json`: 11999 bytes, sha256 `0e416f0a…`, git hash `c436722f`.
- **9** `ufo.json.*.bak` files present (untracked, **not** gitignored). Newest
  `ufo.json.2026-10-09T01-30-57-403Z.bak` (12000 bytes, git hash `925beb48`)
  is **byte-identical to the HEAD blob** and differs from the worktree by exactly
  those 3 lines — i.e. it is the pre-image of the 16–32 landing.
- Eight of the nine baks are HEAD-identical; the oldest
  (`…2026-10-08T19-15-32-811Z.bak`) differs from HEAD at `L79 maxConcurrentL1
  16→32`, `L85 l1Alias m_strong→m_daybreak`, `L93 waveMinLanes 32→16`.
- **Provenance signature:** the filename format equals `stamp()`
  (`apply.mjs:141-143`); `backupFile` is called **only** on the write path
  (`mergeDispatch:936` before `writeAtomic:938`, after the dry-run exit); the
  `.bak` mtime equals the worktree `ufo.json` mtime (reproduced on the same
  btrfs fs via `copyFileSync` + `writeFileSync`/`renameSync` in one tick).

**Trail proves:** a single non-dry-run write at `2026-10-09T01:30:57.403Z` took a
HEAD-identical pre-image to the current worktree with exactly the 3-line delta
(no extra manual edits); a `.bak`'s existence entails a real write (the dry run
prints a placeholder stamp and writes nothing).

**Trail does NOT prove:** who/what invoked the write (strong inference:
`apply.mjs --apply`; the stamp format is trivially reproducible, no log/ledger);
run count/ordering beyond filenames+mtimes; that the band is enforced at runtime
(that is `config/ufo.json:93-94` + the wave gate); commit state (proven by
`git status` alone).

**Control.** A safe dry run left `ufo.json` sha256 `0e416f0a…` unchanged, the
`.bak` count at 9, and did not create the printed backup name.

**Unknowns.** The actor and exact command of the 01:30:57 write; whether the 8
HEAD-identical backups came from `apply.mjs` or manual copies.

**Added.** 2026-10-09 · lane `CoverApplyProvenance` (scout, round 2)