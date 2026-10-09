# r2-falsify-hardlink — r2-falsify-hardlink — hardlink escape independently reproduced

Asked: can the card's hardlink-leaf HIGH claim be falsified?
Source: `sighting/tower-fleet.mjs:257-285,270-273,842,907,699`; card `:148-163`. Lane: `FalsifyHardlink`.

- **Reproduced, not falsified.** `ln <ufo>/config/ufo.json <state>/probe.prompt.md` → `exit 0`, stdout `ok:true`; prompt and authority share `ino=813189 nlink=2` before and after; authority sha `0e416f0a…` → `303bb626…`.
- No guard checks `nlink`/`O_EXCL`/`O_NOFOLLOW`; `isSymbolicLink()` is false and `realpathDeepest` resolves inside the root, so every check passes.
- The card's proposed remediation direction (`nlink > 1` refusal beside the symlink check + atomic publish for the two `stateDir` writes) is sound but leaves the check-to-write window open by itself.

## Unknowns
- The remediation was not applied (read-only lane).
