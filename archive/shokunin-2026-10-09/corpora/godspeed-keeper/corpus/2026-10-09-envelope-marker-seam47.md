# The envelope marker — seam #47, and its at-most-one-terminal rule

**Asked:** the envelope-marker invariant and the refusal it produces.
**Source:** `ufo-swarm-wave.mjs` — `appendReportSuffix` :181-188, `checkEnvelopeMarker` :202-210,
`checkComposedText` :240-245, constants :160/:166; tests `scripts/ufo-swarm-wave.test.mjs:853-937`.

## Observed

- **Invariant:** after full composition a lane text carries either **NO** marker (historical, still valid)
  or **exactly one**, terminal. Enforced as `split(GODSPEED_MARKER)` count ∈ {0,1} with the single
  occurrence required at `text.trimEnd()` tail.
- **Refusals** (typed `invalid_spec`, `ufo-swarm-wave-error-v1`, exit 1, zero mutation — check runs inside
  `planSwarmWave` before the registry persist; tests pin `err.tasks === undefined`):
  - more than one → `carries N "<marker>" markers; the Godspeed envelope allows at most one, terminal`;
  - one nonterminal → `carries a nonterminal "<marker>" marker; the single envelope marker must close the
    text`.
  Refuse-with-error, **never strip**.
- `appendReportSuffix` strips a terminal marker and re-serializes `body + blank + suffix + blank + marker`,
  so the report instruction lands **inside** the envelope and the marker stays last. Appending after the
  marker would strand the instruction outside what the canonical consumers require to end with it.
- Order: binding suffix before report suffix; invocation prepended last, idempotent.
- **Provenance:** "seam #47" of the transient nc2-verify-v4 hazard ledger (`.ufo/scopes/…/fleet-state.md`,
  absent from disk; indexed at `docs/EVIDENCE-INDEX.md:372` as "one-byte dispatch delta"): generated wave
  bytes 0/16 terminal vs delivered 16/16; closed by `appendReportSuffix` + `checkEnvelopeMarker`. Git
  history is a squashed root, so provenance is document-only; the `, F1` suffix has no repo convention
  ([INFERENCE] an authoring-round id).
- **Smuggle vectors:** a `reportDir` segment whose tail is the marker bytes passes `validateRelativePath`
  (:397-410 blocks only absolute/backslash/dot segments) → two occurrences → refusal; independently,
  `items[N].axes`/`milestone` have no charset bound (:726-736) and are interpolated mid-prompt.
- **Doctrine split (MEDIUM):** `checkEnvelopeMarker` refuses ANY second occurrence, while
  `fleet-dispatcher`'s `splitGodspeedEnvelope` deliberately accepts mid-body prose quoting the marker
  before a terminal one — the comment :193-194 overstates the dispatcher rule. State both rules separately.

## Unknown

The authoring-round id behind "F1" (unresolvable in a squashed history).