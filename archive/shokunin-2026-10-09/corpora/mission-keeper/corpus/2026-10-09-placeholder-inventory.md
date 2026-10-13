# placeholder-inventory — Placeholder inventory and the letters-only render grammar

Item: every `{{X}}` in `sighting/l1-prompt.md`, classified against `renderPrompt` (`tower-fleet.mjs:419-448`).

Observed: 58 occurrences, 17 distinct, all letters-only, no wrap. Supplied-and-used: fleet, missionId, title, axis, goal, scope, repo, worktree, base, ufoRoot, waveMin, waveMax, roundLaneCeiling, roundCeiling, stateDir, reportDir, validator. Supplied-but-unused: `l1Alias` (value map `:440`; template has zero `{{l1Alias}}`).
Regexes: replace `/\{\{([A-Za-z]+)\}\}/g` (`:442`), leftover `/[A-Za-z]+/` check `:446`; both `RENDER_UNRESOLVED` branches (unknown key `:443`; residual `:447`), exit 2 before any mutation.
Digit answer: a variant like `{{l1Alias}}` or `{{wave2}}` matches NEITHER regex → renders verbatim, no error (hermetic regex probe observed false/false). `l1Alias` itself contains a digit, so referencing it would silently mis-render. `RENDER_UNRESOLVED` is a partial guard (letter-only typos) only.

Evidence: `PlaceholderInventory.md`.
Unknowns: end-to-end `RENDER_UNRESOLVED` exit not executed.
