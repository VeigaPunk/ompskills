# scope-test-pins — scope-test-pins — the suite's scope-gate pins

Asked: what scope refusals and acceptances does the suite pin?
Source: `test/tower-fleet.test.mjs` §5 :370-387, §6 :389-425, §11 :507-556, §12 :558-592, §13 :594-633, §16 :704-731; launcher `:174-190,192-197,335-342,344-385,1297-1306`; `sighting/l1-prompt.md:46`. Lane: `ScopeTestPins`.

- Suite ran at tip `87c351a`: `ALL CHECKS PASS`, exit 0, 967 ok, 0 failures, ~3.5 s.
- Pinned refusals: `SCOPE_OVERLAP` for nested (both orders, message keeps spec order), deep nesting, identical, normalization-equal, later-entry overlap — each `exit 2`. `INVALID_SPEC` for non-string/blank, collapse-to-empty, absolute/`~`, dot segment, `..`/interior-empty, the container gate, and the §16 container/element/field gates. All scope refusals are pinned write-nothing (stateDir/trees never created, `:632`).
- Pinned acceptances: component-adjacent, string-prefix (`src/a` vs `src/ab`), dash-suffix siblings; intra-mission parent+child; identical multi-scope entries kept verbatim (no dedup); normalization acceptance echoed into `plan` JSON and the `l1-prompt.md:46` scope line.

## Not carried by the source
- Unpinned scope edges: symlink aliasing between two disjoint scopes; case sensitivity; no length ceiling on scope entries; a non-array scope value hits the container message but only `[]`/absent are pinned.
