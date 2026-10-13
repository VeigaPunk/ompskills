# 2026-10-09 — reviews: TowerReview, round, seq, rework

**Asked.** Review vocabulary, numbering, file shape, and the rework cap.
**Sources.** `protocol__store.ts.js:568-699` (`submitReview`, `reviewsFor`, `latestReview`, `nextReviewSeq`), `tools__review__*.js`, reviewer briefing in `tools__spawn__spawnTool.ts.js:334-338`; 3 hub-A + 7 hub-B review files.
**Observed.**
- Caller: tower, or a roster `kind=reviewer` whose `reviewTarget == target`; else `agent "<n>" is not an assigned reviewer for "<target>"`.
- `status` must match `^(clean|p[12]-\d+items)$`; `merge` ∈ `merge | fix-then-merge | hold` — **merge() never reads `merge`**; only `status` and the commit gate.
- `round` = (reviews of this target by this reviewer name) + 1; **cap: `myRounds >= 5` refused** (`:582`, "the rework loop is not converging…"; per reviewer *name* per branch — a fresh reviewer resets it, as the message itself recommends).
- `seq` = max `seq:` over **all** `reviews/review-*.md` + 1 (hub-global, unlocked).
- `reviewed_commit` = branch tip **at submit time** (full SHA).
- File: frontmatter `date (YYYY-MM-DD local), reviewer, target, round, seq, status, merge, reviewed_commit, mission, tokens`; `## Findings`, `## Checks` (every entry rendered `- [x] <text>`; none → `- [x] (reviewer reported no formal checks)` — checks cannot record failure), `## Decision`.
- Log `<reviewer> review.write target= round= verdict= reviewed=<7> tokens= ref=`.
- Non-clean on a `completed` mission → status `active`, re-render, log `<reviewer> mission.rework id= verdict=`. **No inbox message** is written by `submitReview`; the `review-result` message is the reviewer's own `TowerSend`, required only by briefing prose.
- `reviewsFor(target)` filters by filename prefix `review-<targetSlug>-` and never compares frontmatter `target` — `feat/a` would also pick up `feat/a-b`'s reviews [latent; no real pair collides].
**Changed.** Nothing — read-only research (seed entry).
**Unknown.** Concurrent submits could share a seq (no lock) — not observed.

**Lane.** ReviewSubmit (scout). Report: `.tower/fleets/shokunin3/reports/comms-keeper/ReviewSubmit.md`.
