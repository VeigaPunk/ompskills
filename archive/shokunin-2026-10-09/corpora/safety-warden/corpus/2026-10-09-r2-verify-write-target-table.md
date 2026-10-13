# r2-verify-write-target-table — r2-verify-write-target-table — six rows re-derived and re-run

Asked: does the card's write-destination → guard table hold row by row?
Source: `sighting/tower-fleet.mjs:287-307,697-699,708,714,727-728,797,835-842,906-907`; card `:92-102`. Lane: `VerifyWriteTargetTable`.

- All six rows' anchors verified; five hostile destination-family probes each returned `INVALID_SPEC` with an **empty wall log**; the honest control exited 0 with three wall calls.
- Confirmed `assertLaunchWriteTargets` at `:708` precedes wall `open` at `:714`; no guard-after-write defect found.

## Not carried by the source
- TOCTOU, hardlink, bind-mount and post-open failure modes are outside this row check (owned by the residual-limits section and the sibling lanes).

## Unknowns
- None new.
