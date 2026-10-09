# r2-verify-siblings — r2-verify-siblings — substrate and host claims confirmed; spawn-gate caveat

Asked: do the sibling-surface claims match the source?
Source: `ufo-mission-result.mjs:1114-1139,2126,2143-2159`; `ufo-swarm-wave.mjs:431-448`; `host/apply.mjs:853-863,894-941`; card `:199-218`. Lane: `VerifySiblings`.

- The substrate probe admitted spawn-only planning with an in-root symlinked `reportDir` (`exit 0`) but refused the identical layout for resume planning (`EXEC_PATH_OUTSIDE_ROOT`, exit 1) — matching the card's "inverse semantics" framing.
- `beneath`, the substrate primitives, and the `host/apply.mjs` claims match the source.
- Caveat recorded: the spawn admission is a **gate omission** (the own-registry gate sits inside `if (resumes.length > 0)`), not `beneath` permitting symlinks.

## Unknowns
- No launcher runtime probe in this lane (siblings own it).
