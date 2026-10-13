# Envelope-marker consumers — one contract, several checks

**Asked:** every consumer of the terminal marker, and what breaks for each.
**Source:** `grep -rn 'GODSPEED_MARKER' /home/vgpnk/Projects/ufo-fsd-alpha/scripts` (22 hits in 4 files)
+ a byte-level `grep -rni godspeed scripts` to catch inline spellings; test pins
`fleet-dispatcher.test.mjs:574-591` and `ufo-swarm-wave.test.mjs:853-930,1799-1877`.

## Observed

- `collect-omp-native-handoff-lib/base.mjs:120` defines the constant (comment :117-119 mirrors
  `godspeed.rs` `EVIDENCE_MARKER`, "exactly once, terminally"); `collect-omp-native-handoff.mjs:36,720-722`
  `verifyLaunchAssignment` dies when split-count ≠ 1 or `!trimEnd().endsWith`, a triple binding with hash
  and directive prefix.
- `run-omp-native-trial.mjs:1018-1025` composes directive + body + `" "` + marker, collapses `\n{3,}`,
  then enforces exactly-one-last: `markers !== 1 || !composed.endsWith(marker)` → die **at launch**, not
  after a burned wave.
- `ufo-swarm-wave.mjs:166,183-187,203-208,1099`: definition; `appendReportSuffix` splices before a
  terminal marker; `checkEnvelopeMarker` = at-most-one-terminal (0 legal; >1 or nonterminal → typed
  `invalid_spec`, never strip); template-hoist eligibility requires the template not be marker-terminal.
- Inline spellings the constant grep misses: `fleet-dispatcher.mjs` `splitGodspeedEnvelope` (5085-5128)
  uses literal bytes — `trimEnd().endsWith` (5114), `trailingJunk` after `lastIndexOf` (5119-5120),
  adjacent-pair refuse (5121-5122), rejection `queue prompt violates the canonical Godspeed envelope` or
  `dispatch_preflight_failed prompt_envelope_invalid`; `omp-wave-context.mjs:59,540-550` renames it
  `WAVE_CONTEXT_MARKER` and re-verifies prefix+terminal+count==1; `screening.mjs:179,186` deliberately
  widens to `/\|\s*godspeed/i` (case/whitespace tolerant, decodes percent/NFKC variants) — a superset of
  the admission needle, a second contract over the same bytes; the Rust judge `godspeed.rs:9`
  `EVIDENCE_MARKER` re-exported at `lib.rs:85`, with `native_continuity.rs:310-325`
  `matches().count()==1 && trim_end().ends_with` and idempotent producer `inject_task` (472-488).
- **Contract facts:** canonical rule = the judge's conjunction (split-count over full text === 1 AND
  trimEnd-terminal, atop an exact directive prefix and a byte-frozen assignment). Dispatch acceptance ≠
  admission: **`fleet-dispatcher` alone** accepts mid-body prose that quotes the marker before a terminal
  one (deliberate meta-prompt carve-out, 5110-5118); the collector and judge count those as 2 and
  die/invalidate after the wave. Duplicated → wave `invalid_spec`, trial dies, dispatcher rejects adjacent
  pairs, collector dies, judge invalidates. Absent → wave allows (legacy), dispatcher rejects,
  collector/judge fail the seat. Nonterminal → every consumer refuses. Variant bytes fail all exact checks
  but still count as marker evidence in the lenient screen.
- Consequence for an author: **a prompt that dispatches cleanly can still die at the collector/judge** —
  never phrase the contract to an author as plain "exactly one terminal marker" for all consumers.

## Unknown

Whether the mid-body-prose carve-out has a recorded incident rationale (medium confidence on rationale).