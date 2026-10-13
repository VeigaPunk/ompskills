# fleet L1 prompt rendering

**Asked:** how `sighting/l1-prompt.md` is rendered into a mission prompt.
**Source:** `sighting/tower-fleet.mjs` (`renderPrompt` 419-450, `PROMPT_TEMPLATE_PATH` :86).

## Observed

- Substitution: `template.replace(/\{\{([A-Za-z]+)\}\}/g)` (:442); an unknown token ->
  typed `RENDER_UNRESOLVED` (:443); a post-render residual guard (:446-448). The template carries
  17 distinct tokens / 58 occurrences, and **every one has a values entry** (422-441) — no
  unfilled token in the current template.
- Inverse asymmetry: `l1Alias` is in `values` (:440) but referenced 0 times in the template; it
  reaches the pane only through argv `--model @<l1Alias>` (`buildOmpArgv` :475).
- Angle-bracket runtime slots (`<N>`, `<k>`, `<lane>`, `<spec.json>`, `<reportDir>/<Name>`,
  `<entry.resume>`) are by design never rendered; the template's receipt rule (:140-142) matches
  `roundReceipts` (:951-958).
- The rendered prompt is written to `<stateDir>/<id>.prompt.md` (`promptPath` :600), written by
  `verbLaunch` step 4 (:834-843) with `assertSafeWriteTarget` (:837) and a byte-identical
  skip/`promptReused` (:839-840). Live `skill-scribe.prompt.md` renders with 0 residual
  placeholders.
- `skills` naming: a fleet meta `skills` array of bare directory names (pattern
  `/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/` :365); live `spec.json` declares `["shokunin"]`; copied at
  launch by `copySkill` :692-704 (missing = warn only).
- Godspeed chain: template lines 1-3 carry literal `/skill:tower|godspeed|swarm`, rendered
  verbatim into the prompt file and delivered as the final omp argv token (`@<promptPath>`, after
  `--`). Because an initial argv message is not parsed as a slash command, the L1 fallback is an
  explicit `skill://` read (template :16-26). Lane-level leading injection is a different renderer
  (`ufo-swarm-wave.mjs` `GODSPEED_INVOCATION` :160).
- Low-severity findings: `test/tower-fleet.test.mjs:975-978,991` cite stale template lines 35-38
  (the identity table now sits at `l1-prompt.md:39-42`); the token regex `[A-Za-z]+` (:442,:446)
  would silently skip a letters+digits token like `{{wave1}}` (no live occurrence today).

## Remaining unknown

OMP's runtime resolution of `skill://godspeed` inside the pane.
