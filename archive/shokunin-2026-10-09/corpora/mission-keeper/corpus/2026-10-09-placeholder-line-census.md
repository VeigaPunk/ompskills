# placeholder-line-census — Line-cited census of every `{{placeholder}}` in l1-prompt.md vs the renderPrompt value map

Item: enumerate every `{{placeholder}}` in `sighting/l1-prompt.md`, the launcher
value each resolves to in `renderPrompt`, and flag any placeholder the renderer
does not supply.

Observed: 58 occurrences, 17 distinct tokens, all letters-only (zero digit-bearing
tokens ship in the template today). All 17 are supplied by the value map
(`tower-fleet.mjs:422-441`); none is renderer-missing. One value-map key,
`l1Alias` (`:440`), is supplied-but-unused.

Line-cited census (template → value source):

| token | template lines (occurrences) | launcher value | value line |
| --- | --- | --- | --- |
| `{{missionId}}` | 5, 7, 40, 65, 79, 87, 139, 152, 154 (9) | `mission.id` | `:424` |
| `{{axis}}` | 5, 41 (2) | `mission.axis` | `:426` |
| `{{fleet}}` | 7, 39, 152, 154 (4) | `spec.fleet` | `:423` |
| `{{title}}` | 40 (1) | `mission.title` | `:425` |
| `{{goal}}` | 42 (1) | `mission.goal` | `:427` |
| `{{repo}}` | 43, 151 (2) | `spec.repo` | `:429` |
| `{{worktree}}` | 44, 132, 153 (3) | `path.join(spec.worktreeRoot, mission.id)` (const at `:421`) | `:430` |
| `{{base}}` | 45, 152 (2) | `spec.base` | `:431` |
| `{{scope}}` | 46, 130 (2) | `mission.scope.join(", ")` | `:428` |
| `{{waveMin}}` | 47, 69, 71, 73, 75 (5) | `String(authority.waveMin)` | `:433` |
| `{{waveMax}}` | 47, 69, 70, 72 (5) | `String(authority.waveMax)` | `:434` |
| `{{roundLaneCeiling}}` | 48, 74, 179 (3) | `String(authority.roundLaneCeiling)` | `:435` |
| `{{roundCeiling}}` | 48, 180 (2) | `String(spec.roundCeiling)` — the only spec-sourced value, not band authority | `:436` |
| `{{validator}}` | 49, 97, 123 (3) | `path.join(spec.ufoRoot, "scripts", "ufo-swarm-wave.mjs")` | `:439` |
| `{{stateDir}}` | 50, 65, 79, 86, 94, 115, 139 (7) | `spec.stateDir` | `:437` |
| `{{reportDir}}` | 51, 87, 116, 119 (4) | `path.join(spec.stateDir, "reports", mission.id)` | `:438` |
| `{{ufoRoot}}` | 54, 95, 158 (3) | `spec.ufoRoot` | `:432` |

Flags:
- Supplied-but-unused: `l1Alias` (`:440`) — the template carries zero
  `{{l1Alias}}` occurrences, so the alias reaches the pane only via the omp argv
  `--model @${l1Alias}` (`:475`), never through the prompt text.
- Worse than dead: the digit in `l1Alias` means even a template reference would
  match neither regex — replace `/\{\{([A-Za-z]+)\}\}/g` (`:442`) nor the
  leftover check `/\{\{[A-Za-z]+\}\}/` (`:446`) — so `{{l1Alias}}` would ship
  verbatim with exit 0. Never write it into the template.
- Reverse direction is closed: all 17 template tokens exist in the map, so the
  `RENDER_UNRESOLVED` branches (`:443` unknown key, `:447` residual) are
  currently unreachable from this template. A template edit introducing an
  unknown letters-only `{{word}}` aborts the whole fleet (exit 2) before any
  mutation; removing a placeholder from the template renders silently (no
  supply-side closure check).
- Angle-bracket pseudo-placeholders (`<N>`, `<N-1>`, `<k>`, `<lane>`, `<path>`,
  `<spec.json>`, `<reportDir>`, `<Name>`, `<agentId>`) are renderer-inert text;
  the renderer only touches `{{...}}` tokens.

Evidence: `grep -o '{{[A-Za-z0-9]*}}' sighting/l1-prompt.md | sort | uniq -c`
(58 total; per-token counts above), ranged grep of `sighting/l1-prompt.md`,
`read sighting/tower-fleet.mjs:400-463` and grep line-pin of the value map.

Unknowns: none — both files are in-repo and fully enumerated; the launcher was
not executed (static census, consistent with prior `placeholder-inventory` and
`render-prompt-map` entries).
