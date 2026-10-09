# Apply A — install the global OMP config

**Asked.** What `installConfig` does and how it differs from a plain write.

**Observed.** `host/apply.mjs`.

- `installConfig` L865–892 (called only on `--apply`, L1015; dry runs exit
  L1003–1012). `lstatSync(installTarget, {throwIfNoEntry:false})` L867: existing →
  mode from `existing.mode & 0o777` L872; missing → note + default `0o600` L878.
- **Symlink refusal** L868–871: `fail()` (exit 1) with zero mutation before any
  backup/write. Grounded in `omp-global-config.mjs:319-326` (a symlinked
  authority path, live or dangling, is refused) plus `O_NOFOLLOW`/`ELOOP`
  L64–85.
- **`backupFile`** L842–849: destination `${target}.${tag}.bak` (tag = ISO stamp
  with `[:.]`→`-`); `existsSync` → `backup path already exists, refusing to
  clobber` L845; `chmodSync` to the source mode L846–847.
- **`writeAtomic`** L853–863: `mkdir -p`, tmp `${target}.${pid}.${Date.now()}.tmp`
  written with flag `'wx'` (O_WRONLY|O_CREAT|O_EXCL), `chmod`, `renameSync`; the
  `finally` removes the tmp on failure. Vs a plain `writeFileSync`: no torn-write
  window at the authority path, no partial-byte visibility, mode control, does
  not write through symlinks, creates parent dirs.
- **Read-back equality** L885–890: reads the installed authority path back and
  requires byte-equality with the candidate; a mismatch `fail`s with the backup
  path (or `(none)`) **after** the bytes landed (no auto-restore).

**Residual risks.** No tailored refusal for a non-regular, non-symlink target
(e.g. a directory) — `backupFile` fails with a raw OS error. Same-millisecond
backup tags would refuse the apply. `writeAtomic` omits the substrate twins'
`fsync` of tmp + parent dir (`sync-global-routing.mjs:40-61`), so power-loss
durability is not proven — the rename is atomic, durability is not.

**Added.** 2026-10-09 · lane `InstallConfigPath` (reviewer)