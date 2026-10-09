# The surgical config/ufo.json merge

**Asked.** How `planDispatchEdits` / `applyDispatchEdits` / `planNoteRewrite`
rewrite the substrate config, and why no re-serialization.

**Observed.** `host/apply.mjs`.

- `planDispatchEdits` L287–320: recursive walk over the delta into dotted `at`;
  arrays are leaves. The rewrite regex is
  `^([ \t]*)"${key}"[ \t]*:[ \t]*([^,\n]*?)(,?)[ \t]*$` with `gm`, matched
  file-wide; `matches.length !== 1` → `expected exactly 1 line matching "<key>"
  in config/ufo.json, found N — refusing to guess` (L303–306). Classification:
  `unchanged` if `before === value` (L297); else `add` if `before === undefined`
  (L312) else `set`. `literal` is `JSON.stringify(value)` for strings, else
  `String(value)` (L307).
- `applyDispatchEdits` L322–330: skips `unchanged`, rebuilds
  `${indent}"<lastSegment>": ${literal}${comma}`, `out.replace(match[0], line)`.
- `planNoteRewrite` L332–349: separators `["-", "–", "—", " to ", "..", "…"]`;
  searches `${oldMin}${sep}${ceiling}`; returns `{from,to,index}` list.
- **No re-serialization** because the file is 1-space-indented (measured widths
  {0,1,2,3,4,5}) and carries 10 `\u2014` escapes on 6 lines with zero literal
  U+2014 bytes; `JSON.stringify(JSON.parse(text),null,1)` differs on 7 lines and
  emits literal em dashes.

**Verified.** Temp-copy probes: all six keys `=` unchanged on live; a mutated
copy yields `>` set lines; a duplicate key line → `found 2`, exit 1; a missing
key → `found 0`, exit 1. Note rewrite: a planted `100-32` → `> "100-32" ->
"16-32" at byte 3952`.

**Defect found (F1, high).** `planNoteRewrite` builds **both** `from` and `to`
with the *new* ceiling (call site L995–1000 passes `delta.swarm.waveMaxLanes` as
the ceiling for both). For the real transition (old 32 → new 16, new ceiling 32)
it searches `"32-32"`, never `"32-100"`, so a note spelling the true old band is
never rewritten. Today's live `swarm.note` (config/ufo.json:92) carries no
numeric band, so the rewrite is effectively dead code that reports success —
the comment at L335–336 is false for this repo.

**Unknowns.** `applyDispatchEdits`/`mergeDispatch` are source-read only
(`--apply` forbidden); the `add` branch was not exercised end-to-end.

**Added.** 2026-10-09 · lane `DispatchMergeEdits` (scout)