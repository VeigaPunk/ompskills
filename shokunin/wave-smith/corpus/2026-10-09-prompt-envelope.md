# prompt-envelope — the composed lane prompt, its markers, and its bounds

Asked: the composed lane text — the godspeed invocation, envelope markers, and the order.
Source: `scripts/ufo-swarm-wave.mjs:158-245, 1133-1183, 1092-1099`. Lane: `PromptEnvelope`.

Literals: `GODSPEED_INVOCATION = "/skill:godspeed"` (`:160`, 15 bytes);
`GODSPEED_MARKER = "| godspeed"` (`:166`, 10 bytes).

Composition order, spawn lane: lane text → `laneBindingSuffix` → report instruction →
leading invocation prepended **last and idempotently** → `checkComposedText`.

| step | transform | bound check |
| --- | --- | --- |
| admission | `prompt` ≤64 KiB, `item` ≤4 KiB | `:917-968` |
| binding | leaf-bound line + `Judged on`/`Milestone` | none |
| report | marker-aware `appendReportSuffix` — **only when `reportDir` is declared** | none |
| invocation | `opensWithGodspeedInvocation` guard, else prepend | none |
| composed | `checkComposedText`: ≤64 KiB → envelope | `:240-245`, `:1171` |

- Why report lands **before** a terminal marker: `appendReportSuffix` relocates a trailing
  `| godspeed` after the appended paragraph; appending after the marker would strand it
  nonterminal and put the operator instruction outside the envelope the canonical
  consumers require to close the text.
- Envelope rule: zero markers is valid (historical); exactly one must be
  `trimEnd()`-terminal; `>1` or one nonterminal → `invalid_spec`. Refuse, never strip.
  Observed: a prompt already opening with the invocation keeps exactly one copy; a
  nonterminal marker → exit 1 `invalid_spec`; a `reportDir` containing the marker bytes
  → `carries 2 markers`.
- Composed bound observed at the byte: 65 394 x's pass at exactly 65 536 composed bytes;
  65 395 fails `… exceeds 65536 bytes after reportDir append and godspeed invocation`.
- Resume message: report suffix appended, **no** invocation and **no** binding suffix — a
  resumed lane keeps identity/transcript and its spawn-time binding.
- The trailing marker is envelope-only and loads nothing; the leading invocation is what
  loads the skill. Hoist eligibility refuses a template that opens with the invocation or
  ends with the marker (reasons `template_invocation` / `template_marker`).

Critic finding (recorded, not fixed here): the compact hoist arm prepends the invocation
unconditionally (no `opensWithGodspeedInvocation` guard, unlike the legacy arm), and
neither arm dedupes a **non-leading** invocation — an item whose text itself opens with
the invocation, substituted into a template, emits two invocations. Consistent with the
hook's leading-only check, so not a runner-vs-hook regression, but the
"exactly one invocation" invariant holds only for head-invoked prompts.

## Not carried by the source

- No bound on the binding/report append itself; only the composed text is bounded.
- `GODSPEED_MARKER` mid-text is refused, not stripped — duplicates are operator error.

## Unknowns

- Non-leading invocations in real operator specs; a live artifact carrying both a leading
  invocation and a terminal marker; the hook's own guard execution.
