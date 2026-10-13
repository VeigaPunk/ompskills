# Gate 8 — plan print + closing notice

**Asked.** What `printPlan` and `printClosingNotice` emit.

**Observed.** `host/apply.mjs`.

- `printPlan` L763–812 (call site L1001). Two-file block; edit markers are `=`
  (unchanged, L789), `+` (add) and `>` (set) (L791) — **there is no `-`
  marker**, `planDispatchEdits`'s change set is `{unchanged, add, set}` and the
  delta never deletes keys. No-note-rewrite branch L795–806. Deliberately-not-
  touched list L807–811: no `contracts:sync`, no `render-seat-tables.mjs`, no
  `AGENTS.md`, nothing else under `ufoRoot`, temp probe specs removed.
- `printClosingNotice` L814–839 (called `false` L1008, `true` L1040) prints
  `DEFERRED_ARTIFACTS` (L91–96) verbatim, three consequence bullets L823–832, and
  the manual close-the-gap commands L834–838.
- Both are pure printers: no refusal codes originate in them. The symlink text at
  L774 is an annotation; the real refusal is `installConfig` L868–871.

**Verified.** Dry run: install target `7457 bytes mode 0600`; `ufo.json 11999
bytes`; all six `sighting.dispatch` lines rendered `=`; no-note-rewrite branch
taken; exit 0.

**Unknowns.** The `+`/`>` branches are not exercised by the live dry run (all
edits unchanged); rendering was read from source.

**Added.** 2026-10-09 · lane `PlanPrintDeferred` (scribe)