# substrate-ban-source — substrate-ban-source — the ban as the source carries it, and its spec-relativity

Asked: what makes a write "into the substrate", and is the guarantee absolute?
Source: `sighting/tower-fleet.mjs:237-252` (zone :243-245), `:257-285` (:284 zone recheck), `:331/:333` (ufoRoot required, lexical), `:397-402` (loadSpec roots), `:130-165` `loadBandAuthority`; header :21-52. Lane: `SubstrateBanSource`.

- A write candidate is refused when its `realpathDeepest`-resolved path equals or sits strictly under (separator-exact `inside()`) **either face** of the declared `ufoRoot` — `ufoLexical = path.resolve(spec.ufoRoot)` and `ufoReal = realpathDeepest(ufoRoot).resolved`. Code `INVALID_SPEC`, message "the substrate is never written".
- Enforced on both operator roots (:401-402) and on every derived target's resolved leaf (:284).
- **Spec-relative, not absolute.** No absolute substrate path is ever hardcoded; `ufoRoot` comes solely from the spec. Absent field → hard refusal (exit 2). A decoy `ufoRoot` with a readable `config/ufo.json` legally moves the zone (accepted `plan` exit 0) — the only realness anchor is `loadBandAuthority`'s **read** of `<ufoRoot>/config/ufo.json` (`CONFIG_UNREADABLE` otherwise).
- **Honest path writes nothing under `<ufoRoot>`**: a full `plan → launch --apply` (with a skill `cpSync`) `→ close --apply` left a full substrate manifest (`path|type|size|mtime_ns|inode|sha256`) byte-identical.
- All four escape refusals fired before the wall's first `open` — zero wall mutations.

## Not carried by the source
- The real wall script's own substrate writes are out of scope (the fake wall stands in). The lexical face's independent arm was only exercised where it coincides with the real face.

## Unknowns
- A lying-spec write against the *real* substrate was not run (forbidden); simulated via a decoy root.
