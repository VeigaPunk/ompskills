# 2026-10-09 — audit: hub B M4 review loop, file↔log correspondence

**Asked.** For hub B (`/home/vgpnk/.tower/comms/`) mission M4
(`feat/kimi-sighting-swarm-substrate`): every review-loop file and its `ref=`
log line; per-round round/seq/status/merge/reviewed_commit; who logs the
rework flip; would a 6th round be accepted; is `MISSIONS.md` consistent with
`state.json`.

**Sources.** `log/activity.log` (80 lines), `reviews/review-feat-kimi-sighting-swarm-substrate-reviewer-kimi-r{1,2,3}.md`,
`inbox/*kimi-substrate*`, `state.json`, `MISSIONS.md`; kimi 2.1.1 extract
`.tower/fleets/shokunin3/scratch/comms-keeper/src/protocol__store.ts.js`.

**Observed.**
- 9 review-loop files, each with exactly one `ref=` log line (no stray writes):
  request r1 :57, review r1 :59, result r1 :61, request r2 :64, review r2 :65,
  result r2 :67, request r3 :70, review r3 :71, result r3 :72. The tower's
  directive `20261006-tower-worker-kimi-substrate-m4-substrate-matrix-…` (:46)
  is M4 traffic but not review-loop.
- Rounds: r1 seq 5 `p1-1items` `fix-then-merge` `c15c997`; r2 seq 6
  `p2-1items` `fix-then-merge` `238dc81`; r3 seq 7 `clean` `merge` `51296cb`.
  `reviewed=` in log matches frontmatter for all three. seq 1–4 = M3
  godspeed, M1 omp-config, M2 omp-tmux, M5 burner (seq is hub-global max+1,
  `nextReviewSeq` store :681-699; `round` per reviewer+branch, :581,584).
- Rework flip: `mission.rework id=M4 verdict=p1-1items` (:60) and
  `verdict=p2-1items` (:66), actor `reviewer-kimi` (submitReview logs under
  `callerName`, store :627-638), each 1 ms after its `review.write`. Not a
  `mission.update` — the update lines (:56,:63,:69) are the worker re-marking
  `completed`. Neither the merge (:73, no `ref=`) nor its completed→merged flip
  emits `mission.update`.
- 6th round: refused by `if (myRounds >= 5)` store :581-583 (rounds 4,5 would
  pass). Today even round 4 by reviewer-kimi is refused earlier at :571-573
  (roster empty after `adopt … retired=…reviewer-kimi` :80); `tower` bypasses
  the roster check and is counted under its own name (round 1).
- `MISSIONS.md` (mtime 18:14 -0300 = 21:14Z, right after merge :73) row M4:
  `✅` (= `merged`, STATUS_EMOJI) / owner `worker-kimi-substrate` / scope
  `.local/bin/kimi-*` — matches `state.json` M4 exactly. All five rows match.
  state.json is newer (adopt 21:30:28Z emptied `roster.agents`, which the index
  does not render; adopt does not re-render). `owner` still names a retired
  agent — owner is never cleared.

**Changed.** Nothing in the hub; read-only.
**Unknown.** Whether the r2/r3 reviewer dispatch was a resume (see
`2026-10-09-review-rounds-worked`; not visible in hub). MISSIONS.md content
compared by fields, not by re-rendering bytes.
