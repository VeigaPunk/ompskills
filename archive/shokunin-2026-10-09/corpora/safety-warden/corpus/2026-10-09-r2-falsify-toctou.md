# r2-falsify-toctou — r2-falsify-toctou — swap race reproduced 3/3; no fd primitive in source

Asked: can the card's swap-race claim be falsified?
Source: `sighting/tower-fleet.mjs:70-81,698,699,728,836,842,907`; card `:148-171`. Lane: `FalsifyToctou`.

- **Reproduced, not falsified.** `grep -nE 'openSync|O_NOFOLLOW|O_EXCL|renameSync|mkdtemp|fsync|writeSync|createWriteStream|appendFileSync|rmSync|unlinkSync'` → no matches; the import set is the eight plain fs calls, and the only write sites are `mkdirSync` :698/:728/:836, `cpSync` :699, `writeFileSync` :842/:907.
- Three bounded runs (1500 attempts / 60 s) each landed the write out of root (attempts 6, 17, 5): `exit 0`, `ok:true`, config sha `0e416f0a…` → `8206f6ff…`; run 3's config bytes were **identical** to the legitimately rendered prompt.
- Controls: clean launch unchanged; static symlink leaf `exit 2 INVALID_SPEC`, 0 wall bytes.
- Post-open consistency confirmed: `stateDir` symlink → `exit 2 STATE_DIR_UNAVAILABLE` with wall `open`+`status --lite` already logged; `fleet.json` planted on `open` → `exit 2 INVALID_SPEC`, empty stdout, wall `open`/`status --lite`/`launch` logged, no `fleet.json` written. Pre-wall contrast: `:401-402` and `:708` refuse with 0 wall bytes.

## Unknowns
- Timing-dependent: reproduced, not statistically characterized. `O_NOFOLLOW`-alone vs a swapped parent component untested.
