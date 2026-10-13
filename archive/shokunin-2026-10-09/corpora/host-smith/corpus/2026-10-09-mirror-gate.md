# Gate 4 — route / mirror gate

**Asked.** The splitRoute/mirror validation gate and the whole-table audit.

**Observed.** `host/apply.mjs`.

- Dynamic import from `opts.ufoRoot` L492; `renderSeatRoutingMirror({path:
  CANDIDATE, l1Alias})` L495 inside `mirrorGate` L490. Export at
  `scripts/sync-global-routing.mjs:305-307` → `buildSeatRoutingMirror:239` →
  `readGlobalSeatRouting:242`.
- `l1Alias` comes from the **delta** (L392; `host/ufo-sighting-dispatch.json:4`),
  suppressing `sync-global-routing.mjs:239`'s default `configuredL1Alias()`
  which reads the live `config/ufo.json` (L220–233). Today live
  `config/ufo.json:85` and the delta both say `m_strong`, so the split is
  structural. Backstop: L541–544 `seats.main.alias === l1Alias`.
- `GEMINI_MARKERS` L413 `[gemini, google-ai, google_ai, google-gemini, bard]`,
  consumed L425; identical list `sync-global-routing.mjs:131`. The
  `google-antigravity/` prefix exemption (L424) matches `sync:130`; exercised by
  the candidate at lines 162 and 384.
- `auditRoute` L419–446: slash grammar L420, first-slash split L428, padding
  rejection L431–433, effort whitelist `low|medium|high|xhigh|max` L436 (local
  copy L66), empty segments L440, charset `^[A-Za-z0-9_.-]+$` L443–444.
- `wholeTableAudit` L448–488 audits **all 164 routes** (19 aliases, 31 chains);
  chain primary = `modelRoles.get(key) ?? concrete key` L465; the seen-map
  `bareRoute` L145–153 seeded with the primary catches a chain wrapping its own
  primary or repeating a step at another effort; 12-problem cap then `fail`.

**Verified.** Dry run 4/8 ok: `whole-table audit: all 164 routes across 19
aliases and 31 chains are splitRoute-legal`. 5/8 ok: `seats.main.alias ===
l1Alias === "m_strong"`.

**Note.** `apply.mjs` re-hand-copies `GEMINI_MARKERS` and `EFFORT_SUFFIXES`; no
test pins them, so drift from the substrate copies is a silent surface
(acknowledged by comment L416).

**Added.** 2026-10-09 · lane `MirrorGate` (reviewer)