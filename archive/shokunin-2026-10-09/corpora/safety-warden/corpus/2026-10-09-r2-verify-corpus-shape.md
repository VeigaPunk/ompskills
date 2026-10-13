# r2-verify-corpus-shape — r2-verify-corpus-shape — 1:1 index↔file mapping; one heading omission

Asked: does the corpus conform to the corpus protocol?
Source: `shokunin/safety-warden/corpus/` (24 files), `skill://shokunin`; sibling corpora. Lane: `VerifyCorpusShape`.

- PASS: exact 1:1 index-row ↔ file mapping (`comm -3` empty both directions); 24 files = 1 index + 23 entries; one entry per round-1 item (entry `Lane:` values ↔ the 23 r1 registry members, `comm -3` empty); allowed headings only (H1 + `## Not carried by the source` ×7 + `## Unknowns` ×22; zero H3+); header row byte-identical to sibling corpora; entries distilled (11-16 lines) with exact `path:line` anchors in 23/23 and typed refusal/exit codes in 20/23.
- Flagged: `scope-test-pins` omits `## Unknowns` (its unknown content sits under `## Not carried by the source`) — not an invented heading, not one of the three VIOLATED conditions. The corpus is append-only, so the entry stands; this row records the observation.

## Unknowns
- Add-order beyond mtimes is not independently verifiable (single commit).
