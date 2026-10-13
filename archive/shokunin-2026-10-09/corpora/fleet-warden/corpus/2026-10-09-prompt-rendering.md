# prompt-rendering — the L1 prompt template and its placeholder ledger

Asked: the template's placeholders, the `values` map, and the two unresolved gates.
Source: `sighting/tower-fleet.mjs` @ b251c5a, template `sighting/l1-prompt.md`. Lane: `PromptRender`.

- `PROMPT_TEMPLATE_PATH = path.join(HERE, "l1-prompt.md")` (:86); `renderPrompt` (:419) reads it
  at :420 and substitutes with `template.replace(/\{\{([A-Za-z]+)\}\}/g, ...)` (:443).
- Template: 58 placeholder occurrences over 17 unique names, all resolve. `values` (:422-441)
  binds `fleet, missionId, title, axis, goal, scope, repo, worktree, base, ufoRoot, waveMin,
  waveMax, roundLaneCeiling, roundCeiling, stateDir, reportDir, validator, l1Alias`.
- Use counts: `missionId` 9, `stateDir` 7, `waveMin`/`waveMax` 5, `fleet`/`reportDir` 4,
  `worktree`/`roundLaneCeiling`/`validator`/`ufoRoot` 3, `axis`/`repo`/`base`/`scope`/
  `roundCeiling` 2, `title`/`goal` 1.
- Gate A (:443): unknown placeholder → `RENDER_UNRESOLVED` (`key in values`).
- Gate B (:446-447): a leftover `{{[A-Za-z]+}}` after substitution → `RENDER_UNRESOLVED`.

Findings (source gaps):
- `l1Alias` is a `values` key with zero template occurrences — dead binding (:440).
- Gate A tests `key in values`, which walks the prototype chain: `{{constructor}}` /
  `{{toString}}` resolve to `[native code]` instead of refusing; the residual regex also misses
  digit/underscore names (`{{x1}}`). Fix: `Object.hasOwn(values, key)`.

Evidence: lane `PromptRender` (ledger + reproduction).
