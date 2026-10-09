# r2-gap-host-ufo-json-write — r2-gap-host-ufo-json-write — rename replaces a symlink, does not follow it

Asked: is the card's inference about `host/apply.mjs`'s unguarded `ufo.json` write correct?
Source: `host/apply.mjs:853-863` (`writeAtomic`), `:894-941` (`mergeDispatch`), `:867-871`, `:187-191`; card `:199-218`. Lane: `GapHostUfoJsonWrite`.

- Standalone scratch reproduction: `writeFileSync(tmp,{flag:'wx'})` + `renameSync(tmp, dest)` over a symlinked `dest` → `{"destIsSymbolicLink":false,"destBytes":"REPLACEMENT\n","targetBytes":"ORIGINAL_TARGET\n","targetStillExists":true}` — the link is **replaced**, the link target untouched.
- `mergeDispatch` calls `writeAtomic` with no destination guard; `realpathSync` appears zero times in `apply.mjs`; `isSymbolicLink` checks exist only for the candidate and the install target.

## Unknowns
- The rename behavior is demonstrated by a standalone reproduction, not by running `apply` (read-only lane); the card states it as inference.
