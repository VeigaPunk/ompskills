# render-prompt-map — renderPrompt value map and placeholder blind spots

Item: `renderPrompt` (`tower-fleet.mjs:419-448`) and `loadBandAuthority` (`:129-165`).

Observed: value map = 18 keys; the template consumes 17; `l1Alias` is dead supply. Replacement regex `:442`; leftover regex `:446`. `RENDER_UNRESOLVED` at `:443` (absent key) and `:446-448` (residual brace in a substituted value — a brace-in-data guard, reachable only when a value carries a letters-only `{{Word}}`). `l1Alias` safe-token regex `loadBandAuthority:161` `/^[A-Za-z0-9_.:-]+$/` admits exactly the classes the renderer's `[A-Za-z]+` cannot carry; the alias reaches the pane argv via `--model @${l1Alias}` `:475`.
Blind spots (adversarial): (1) digit-bearing placeholder `{{l1Alias}}` neither substituted nor detected (ships verbatim, exit 0); (2) unknown letters-only `{{word}}` → `RENDER_UNRESOLVED`, aborts the whole fleet before any mutation (renderPrompt runs before wall open and mkdir); (3) a removed placeholder renders silently (no supply-side closure check); (4) `key in values` prototype-chain slip (`{{constructor}}` passes); (5) `{{{waveMin}}}` → `{value}` silent brace corruption; (6) a value-carried brace splits by class (letters-only → fleet abort, digit-bearing → verbatim into the prompt).
`renderPrompt` is a per-mission call inside `buildPlan`, from `verbLaunch`/`verbPlan`; each call re-reads the template.

Evidence: `RenderPromptMap.md`.
Unknowns: launcher not executed (receipt + regex probe); live `l1Alias` value not read here.
