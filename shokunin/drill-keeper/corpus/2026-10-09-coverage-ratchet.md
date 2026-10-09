# coverage-ratchet — the placeholder bound

Asked: is the "ratchet" a ratchet; what `--only` skips; how placeholders can hide shrinking coverage.
Anchor: `ufo-fsd-alpha@5ace2559` (read-only); `config/ufo.json` cited from the working copy (sha256 `0e416f0a…`, uncommitted swarm-band edit only). Lane: `CoverageRatchet` (critic). Live: `node scripts/ufo-drills.mjs --list` → 67 = 51 wired / 11 pending-mechanism / 5 referenced.

## Observed
- Rule (`scripts/ufo-drills.mjs:1680-1703`): `wiredCount = pass + fail`; breach iff `pending > wired` or `referenced > wired`; unfiltered runs only; breach → exit 1 + `coverageBreaches`.
- Header `:28-29` says "a ratchet — it may only shrink as mechanisms land"; the tail comment `:1683-1686` and the code say a **live ratio**. Code wins: it is a 1:1 per-class ceiling.
- Counterexamples (source-derived): +40 pending with no new wired → 51/51 green; demote 20 wired to pending → 31/31 green (wired decline invisible); 51 wired + 51 pending + 51 referenced → green (2/3 placeholders), against `:1682`'s "placeholder-majority" wording.
- `references` validation is existence-only; the `:line` suffix is stripped at `:1108` and never checked. `pendingReason` is free text.
- `PLACEHOLDER_STATUSES` builds `DRILL_STATUSES` but the loop/invariant use literal strings, so [INFERENCE] a third placeholder status added to the set would count as a passing wired drill.
- `--only` skips the invariant and the durable summary but still loads and validates all 67 files. `--only` on a pending/referenced id exits 0 with nothing run.
- Self-test census floors (`:1475-1490`) cover the probe arrays only — no floor on the corpus or wired count.

## Bottom line
The invariant stops a placeholder **majority per class**; it does not stop wired coverage from shrinking. Report it as a ceiling, never as a ratchet.
