# 2026-10-09 — L1 prompt template and its render pins

**Asked.** What is the placeholder set of `sighting/l1-prompt.md`, which
placeholders do the render tests assert, and what prose blocks does the
template carry? (Lane `L1PromptTemplate`, scout.)

**Observed.** Sources: `sighting/l1-prompt.md` (whole, 180 lines);
`test/tower-fleet.test.mjs` §24-26 (`:964-1030`) and §32 (`:1333-1371`).

- Placeholder syntax: only `{{Name}}` with a purely alphabetic name (the
  ledger regex is `/\{\{([A-Za-z]+)\}\}/g`); angle-bracket tokens like `<N>`,
  `<k>`, `<spec.json>`, `<Name>` are not placeholders.
- 17 distinct placeholders, sorted: `axis, base, fleet, goal, missionId, repo,
  reportDir, roundCeiling, roundLaneCeiling, scope, stateDir, title, ufoRoot,
  validator, waveMax, waveMin, worktree`. Occurrence counts: missionId 9,
  stateDir 7, waveMin 5, waveMax 5, reportDir 4, fleet 4, worktree 3, validator
  3, ufoRoot 3, roundLaneCeiling 3, scope 2, roundCeiling 2, repo 2, base 2,
  axis 2, title 1, goal 1.
- §24-26 assert named rendered values for missionId, axis, fleet, title, goal
  (raw/unescaped, §25), repo, worktree, base, validator, stateDir, reportDir,
  and ufoRoot (indirectly via the `UFO_CONFIG_PATH` env check). No dedicated
  named check in §24-26 for scope, waveMin, waveMax, roundLaneCeiling,
  roundCeiling — but §32's reconstruction covers all 17: it rebuilds
  `want = template.replace(placeholder, spec∘authority mapping)` and asserts
  `row.prompt === want` plus `!row.prompt.includes("{{")`.
- Ledger assertion style (§32): extract + dedupe + sort the template's
  `{{...}}` matches, compare `names.join(",") === LEDGER.join(",")` against a
  hardcoded 17-name sorted list ("adding/renaming a template placeholder must
  update this list"), plus a negative check that `l1Alias` is not a
  placeholder (it is a band field consumed only by `launchArgv`/band). The
  doctrine is content-based: assert rendered values, never line numbers.
- Prose blocks: load order (heading `:13`; `/skill:` lines 1-3 are invocation
  markers; `skill://wwkd` may not resolve and is never a gate; `skill://ufo`
  optional, fails closed without `ssot/godspeed-core/directive.md`); the
  wave-sizing mandate (step 2: one wave when `waveMin <= N <= waveMax`, else
  `ceil(N/waveMax)` sequential even waves; "Padding to the floor is
  forbidden."); the validator command block (step 3: `UFO_PROJECT_ROOT`,
  `UFO_CONFIG_PATH`, `UFO_FLEET_ALLOW_EXTERNAL_TOOLS=1`, `node {{validator}}
  plan --spec <spec.json>`); the receipt path (step 7:
  `{{stateDir}}/rounds/{{missionId}}-r<N>.md`, `<N>` = 1 + existing receipt
  count) and the wave-spec path
  (`{{stateDir}}/waves/{{missionId}}-r<N>-w<k>.spec.json`).

**Changed.** Nothing — read-only research.

**Unknown.** The suite was not run, so no claim that §24-26/§32 currently
pass; the bash-fence line numbers (93/98) are inferred from grep anchors; the
launcher's `renderPrompt` was not audited (outside the named sources).
