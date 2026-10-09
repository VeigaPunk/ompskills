# r2-verify-substrate-ban — r2-verify-substrate-ban — honest path byte-identical; zone spec-relative

Asked: does the honest path write nothing under `<ufoRoot>`, and is the ban spec-relative?
Source: `sighting/tower-fleet.mjs:237-252,257-285,331,333,397-402,130-165`; card `:104-121`. Lane: `VerifySubstrateBan`.

- `plan` / `launch --apply` / `close --apply` all exit 0; before/after `path|size|sha256` substrate manifests diff clean → the honest path writes nothing under `<ufoRoot>`.
- A decoy `ufoRoot` (readable `config/ufo.json`) accepted a `stateDir` under the original scratch `ufoRoot` at `plan` exit 0 → the zone is **spec-relative**.
- The card states the ban as spec-relative, so it does not overstate it as absolute.

## Unknowns
- Real substrate never targeted (scratch only, real config copy).
