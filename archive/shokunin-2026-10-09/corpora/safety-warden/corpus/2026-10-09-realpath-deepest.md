# realpath-deepest — realpathDeepest — deepest-existing-ancestor resolution and its bare catches

Asked: what exactly does `realpathDeepest(target)` resolve, and how does it fail?
Source: `sighting/tower-fleet.mjs:204-230` (loop :207, inner catch :212-216, dangling :217-219, walk-up :220-223, outer catch :225-229); callers `assertSafeWriteRoot` :238, `assertSafeWriteTarget` :265-266/:284. Lane: `RealpathDeepest`.

- Rule: walk up from `path.resolve(target)` until a component exists (or the fs root), `realpathSync` that ancestor, re-append the stripped tail **lexically**. So a symlinked parent resolves to its real target; a not-yet-existing leaf under a real dir becomes `realpath(parent)+leaf`.
- A dangling link anywhere on the path returns `{resolved: lexical, dangling: true}` (:217-219) instead of throwing. Callers type it (`INVALID_SPEC` "resolves through a dangling symlink").
- It **never rethrows**: the inner `lstatSync` catch (:212-216) and the outer `realpathSync` catch (:225-229) are bare, and `existsSync` (:207) swallows ENOENT/ENOTDIR. Observed: arm (c) a FILE intermediate (ENOTDIR) did not produce `UNEXPECTED_ERROR`; the caller's own catch at `assertSafeWriteTarget`:275-277 re-types it `INVALID_SPEC` "cannot be inspected safely: ENOTDIR".
- Arms reproduced on a scratch root: (a) nonexistent leaf under an existing dir → `{resolved:"/tmp/.../wt/probe", dangling:false}` = realpath(parent)+leaf; (b) dangling leaf and dangling intermediate → `dangling:true`; (d) benign symlinked parent → resolves to the real parent; hostile symlinked parent into `ufoRoot` → `plan` exit 2 "resolves inside ufoRoot … (realpath)".

## Not carried by the source
- A live TOCTOU exists **inside** `realpathDeepest` itself: `existsSync` (:207) then `lstatSync` (:213) is a two-step read. A racing swap produced a false-positive "resolves through a dangling symlink" refusal (fail-closed, sibling `toctou-window` entry).

## Unknowns
- EACCES components, bind mounts, and ENOENT-vs-fallback on a genuinely missing repo/ufoRoot were not probed.
