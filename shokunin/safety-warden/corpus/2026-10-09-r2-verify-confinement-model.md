# r2-verify-confinement-model — r2-verify-confinement-model — card overclaim found and corrected

Asked: does the card's confinement-model section and write-destination table match the source?
Source: `sighting/tower-fleet.mjs:204-230,237-252,257-285,287-307,397-402,697,708,714,727,797,835,837,906`; card `:54-102`. Lane: `VerifyConfinementModel`.

- **VIOLATED (card wording).** The card claimed `assertSafeWriteRoot` is "checked on both the lexical and the realpath-resolved path with **both comparison sides realpath-resolved**". The source resolves only the **candidate**; the parent side is compared against both the lexical and the real faces (`roots.ufoLexical`/`roots.ufoReal`, `repoLexical`/`repoReal`). Corrected in the card to: candidate always realpath-resolved; each zone tested against both faces; the parent side is not itself realpath-resolved.
- The behavioral claims held: four pre-flight symlink rows (worktree/prompt/session/fleet) all `exit 2 INVALID_SPEC`, zero wall bytes, config hash unchanged.

## Changed
Card `### The confinement model` first bullet reworded (round-2 correction).

## Unknowns
- None new; the lexical-parent nuance is now stated rather than implied.
