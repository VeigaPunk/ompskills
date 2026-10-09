# r2-verify-zone-denylist — r2-verify-zone-denylist — denylist confirmed; lexical-parent nuance

Asked: is `assertSafeWriteRoot` a four-condition denylist, and does the card overclaim containment?
Source: `sighting/tower-fleet.mjs:237-252` (`inside()` :242, ufo :243-245, repo-root :246-248, `.git` :249-251), call sites :401-402; card `:68-78`. Lane: `VerifyZoneDenylist` (19 primary + 16 supplementary probes).

- All nine assigned cases match: repo root refuses ("resolves to the repo root itself"); `<repo>/sub` and a `<repo>`-sibling accept; inside `ufoRoot` (lexically and via symlink) refuses "the substrate is never written"; a `ufoEvil` sibling prefix accepts; `/etc/...` accepts (`{"ok":true,"writes":false}`); `<repo>/.git/x` refuses; dangling refuses.
- Supplementary: equality forms refuse; symlinked parent/child/repo refuse; `.github`, `ufo2`, `/`, ENOTDIR-intermediate, and spelling-inside-but-resolving-outside links accept — confirming the predicate is on the **resolved** path and that the repo-root arm is equality-only.
- No forbidden-zone destination accepted; no non-zone path refused; no filesystem mutation.
- Wording nuance (not a safety overclaim): the lexical parent side is not itself realpath-resolved — the same finding as `r2-verify-confinement-model`, corrected in the card.

## Unknowns
- The lexical arm of the ufoRoot comparison is not isolatable (the real arm fires in every refusal).
