# untracked-copy-bounds — population, confinement, byte bounds, mode fidelity

Asked: establish the untracked population rule, symlink confinement, byte
bounds, and the post-copy check. Source: `scripts/prepare-ephemeral-l1.mjs`
(285-418, 634-652). Lane `UntrackedCopy` (reviewer).

Population: `git -C <source> ls-files --others --exclude-standard -z` (:634),
decoded with `TextDecoder("utf-8",{fatal:true})`, split on NUL, `filter(Boolean)`,
`.sort()` (:637). A non-UTF-8 name refuses `source contains a non-UTF-8 untracked
filename` (:641). After the copy loop the diff and the listing are re-censused
byte-exactly (:647-650).

Symlinks (`copyUntrackedEntry` :317-325): the target **string** is read with
`readlinkSync` and never opened/resolved. An absolute target refuses (:318);
otherwise `path.resolve(dirname, target)` must satisfy `isBeneath(sourceRoot,
resolvedTarget)` or `resolvedTarget === sourceRoot` (:320-321; refusal
`untracked symlink escapes the source: <path>`). A symlink whose target resolves
to the source root itself (`sub/self -> ..`) is **accepted** and replayed
verbatim. Regular files additionally realpath-confine (:331-332).

Bounds: `MAX_UNTRACKED_FILE_BYTES = 32 MiB` (:34) is enforced byte-exactly
(33554433 → `untracked file exceeds 33554432 byte bound: <path>`; 33554432
copies) via lstat gate (:328-330), fd `fstat` re-check (:340), and an
`O_NOFOLLOW|O_NONBLOCK` bounded read (:336-351). `MAX_UNTRACKED_TOTAL_BYTES =
256 MiB` (:35) fires `untracked snapshot exceeds 268435456 byte bound` (no path
suffix). All reads are bound on the **open fd**, not the stale lstat, closing
the grow/FIFO swap; guard messages say `changed during snapshot`.

Post-copy `assertCopiedUntracked` (:375-418) re-verifies equality (lstat pair,
readlink equality, mode/size/byte equality) — it does **not** recompute the
digest. The digest accumulates during copy only: seed label+HEAD+trackedDiff
(:633), `\0safe\0mode&0o7777\0` header (:314), `symlink\0target` (:323),
length-framed `file\0len\0`+bytes (:361). The setuid bit is digested (`0o7777`)
but **not** copied (`mode & 0o777`), so a 4755 source lands 755 in the clone.

`assertRealParents` (:296-305): every intermediate component must be a real
non-symlink directory on the source side; the clone side creates missing
parents 0700.

## Unknowns

- No test anywhere asserts `MAX_UNTRACKED_TOTAL_BYTES` (grep `268435456`/`untracked
  snapshot`: zero hits in both suites); the lane's runtime probe is the only
  firing evidence.
- The `changed during snapshot` guards are TOCTOU-only; no deterministic trigger
  exists or is tested.
- `safeRelative` refusals and the collision guard are not runtime-reachable via
  git population (defense in depth).