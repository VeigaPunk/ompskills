# 2026-10-09 — integrity hazards: hand edits, forgery, concurrency

**Asked.** What survives a hand edit, what is trusted, and what is racy.
**Sources.** `protocol__store.ts.js` (`:196-211`, `:483-516`, `:641-699`, `:741-756`, `:968-987`), `workerProfile.ts.js:8-37`, write guard `kimi.strings` ~:1041566-1041577.
**Observed.**
- `MISSIONS.md`: never read, overwritten on the next render → a hand edit is cosmetic and transient. `missions/M*.md`: read back by `TowerMission` and spawn briefings → a hand edit is **trusted** until the next render.
- `state.json` is the sole authority for missions/roster/scope/status; a hand edit is trusted unchecked (scope/kind feed the merge gate). Malformed → raw `SyntaxError`; several ownership checks swallow load errors (`.then(…, () => void 0)`).
- **Merge-gate forgery**: `merge()` trusts any `reviews/review-<slug>-*.md` with parseable frontmatter; a hand-written `status: clean` + `reviewed_commit: <tip>` + high `seq` passes. Not observed; all real reviews match `review.write` lines.
- `readInbox` trusts `from/subject/sent_at` from frontmatter (the stray file proves non-tool writes happen).
- Concurrency: no lock anywhere; `state.json` read-modify-write can lose updates (fixed `.tmp` name); review `seq`/`round` from a directory scan can duplicate; `writeUnique` prevents filename overwrite only.
- `init` after `state.json` loss truncates `activity.log` (`:123`) — destroying the audit trail teardown promises to keep.
- Never "fix" a hub by hand: if a record is wrong, report it; mutations belong to the Tower* tools in a kimi session.
**Changed.** Nothing — read-only research (seed entry).
**Unknown.** Whether `execution.accesses` is populated for Write/Edit (guard may fail open).

**Lane.** HandEditHazards (sentinel). Report: `.tower/fleets/shokunin3/reports/comms-keeper/HandEditHazards.md`.
