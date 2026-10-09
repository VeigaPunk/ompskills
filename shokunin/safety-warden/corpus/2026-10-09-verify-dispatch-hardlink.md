# verify-dispatch-hardlink — verify-dispatch-hardlink — hardlink prompt leaf is NOT refused; the write lands in the authority

Asked: may a write land at `<stateDir>/<id>.prompt.md` when that path is a **hardlink** to
`<ufoRoot>/config/ufo.json` (same inode, `nlink=2`)? Name the guard, the refusal (or its absence),
the anchors, and the residual limit. Source-and-corpus answer; the launcher was **not** run.

Source re-read at tip: `sighting/tower-fleet.mjs:70-81,204-230,237-252,257-285,287-307,708,837,842`;
corpus `2026-10-09-derived-target-escape-hardlink.md`, `2026-10-09-r2-falsify-hardlink.md`,
`2026-10-09-toctou-window.md`, `2026-10-09-r2-verify-target-arms.md`.

## Answer

**Guard that decides it.** The prompt destination is guarded twice, both by the same function
`assertSafeWriteTarget` (`:257-285`): the pre-flight `assertLaunchWriteTargets` (`:287-307`, prompt
row `:304`, called at `:708` before the wall opens at `:714`) and the per-site recheck immediately
before the write (`:837`). The arm that *would* have to decide a link is the leaf-type check at
`:270-273`:

```js
try {
  if (lstatSync(target).isSymbolicLink()) {
    typed("INVALID_SPEC", `${field} ${target} is a symlink — refusing a write through it`);
  }
} catch (error) { … }
```

**Refusal: NONE — the write lands.** A hardlink is a plain regular file, not a symlink:
`lstatSync(target).isSymbolicLink()` is `false`, so `:270-273` does not fire. The other arms also
pass, and none of them inspects inode identity:

- `realpathDeepest(target)` (`:204-230`) resolves the *path* `<stateDir>/<id>.prompt.md`; a hardlink
  is not a path redirection, so it resolves lexically inside `stateDir` — `dangling` is false
  (`:267-269` pass).
- `inside(targetPath.resolved, rootPath.resolved)` (`:280-283`) is true — the path is beneath the
  root.
- The zone recheck `assertSafeWriteRoot(targetPath.resolved, field, roots)` (`:284`) tests the
  *path*, which is not inside `ufoRoot` — it passes.

The write then executes at `:842`, `writeFileSync(row.promptPath, row.prompt)` — `w` → `O_TRUNC` on
the shared inode, so it truncates and rewrites the bytes of `<ufoRoot>/config/ufo.json`. (If the
rendered prompt is byte-identical to the current content, `:838-840` sets `promptReused` and skips
the write; otherwise the authority is clobbered.) The launcher's `node:fs` import set (`:70-81`) is
exactly `cpSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, realpathSync,
writeFileSync`; a grep for `nlink|O_NOFOLLOW|openSync|renameSync|O_EXCL` over the whole file returns
**no matches**, so no inode-identity or fd-pinned primitive exists anywhere in the launcher.

**Anchors.** `assertSafeWriteTarget` `:257-285`; symlink-leaf arm `:270-273` (the only leaf-type
check); `inside` `:280-283`; zone recheck `:284`; pre-flight `:287-307` (`:304` prompt row) called at
`:708`; per-site recheck `:837`; `writeFileSync` `:842`; `realpathDeepest` `:204-230`; fs import set
`:70-81`.

**Residual limit.** The guarantee is *static symlink containment, never race-free capability
confinement* (`reports/tf-safety-r2.md:193-197`). The hardlink leaf is **OPEN (HIGH)**: the
check-then-write pattern (`:837` check → `:842` syscall) has no inode-identity guard and never reads
`nlink`. Prior lanes observed the vector live — `ln <ufo>/config/ufo.json <state>/<id>.prompt.md` →
`exit 0`, `ok:true`, shared `ino`/`nlink=2`, authority bytes replaced, and `find` shows **no new
path** so only content hashing detects it (`2026-10-09-derived-target-escape-hardlink.md`,
`2026-10-09-r2-falsify-hardlink.md`). It is feasible here because `ompskills` and `ufo-fsd-alpha`
share one filesystem id and `fs.protected_hardlinks=1` does not block a same-owner link. Smallest
fix: refuse a leaf with `lstatSync(target).nlink > 1` beside the symlink check, and publish the two
`stateDir` writes atomically (tempfile + `renameSync`). That fix alone still leaves the sibling
same-user swap race (`:837`→`:842`, `2026-10-09-toctou-window.md`) and bind mounts
(`2026-10-09-r2-gap-bind-mount.md`) open.

## Not carried by the source
- No `nlink`/`O_NOFOLLOW`/`openSync`/`renameSync`/`O_EXCL` token exists in the launcher (grep: 0
  matches) — the hardlink arm is absent, not merely weak.
- The pre-flight (`:708`) and per-site (`:837`) guards are the *same* function, so the hardlink
  passes both; there is no second, harder check at the write site.

## Unknowns
- This entry is a source-and-corpus answer; the launcher was not run for this question. The
  reproduction evidence is cited from the prior lanes' corpus entries, not re-observed here.
- Whether `writeFileSync`'s `O_TRUNC` path is reached depends on the rendered prompt differing from
  the hardlinked content; the byte-identical case is a silent `promptReused` no-op, not a refusal.
