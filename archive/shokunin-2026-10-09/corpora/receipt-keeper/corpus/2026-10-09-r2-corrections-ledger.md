# r2 corrections ledger

## Asked

Falsify the card and corpus produced in round 1 (worktree HEAD `753ce84`,
launcher anchor `ada7a90` sha256 `80f0814e…`, 1306 lines) and log every
correction to a corpus claim — corrections are new entries, never rewrites.

## Observed

26 read-only lanes (`receipt-keeper-r2-w1`, verdicts in
`reports/receipt-keeper-r2/`) produced these corpus-level corrections. Card
claims were fixed in place on the card itself; this ledger lists what a future
reader should distrust in the r1 entries:

- `2026-10-09-continue-stop-ledger.md` :12 — stop causes recount as
  saturation 10, **round ceiling 14, both 9** (card said 15/8; not
  reproducible under any tested rule; recount rule = receipt's own named
  cause, disclaiming saturation counts as ceiling-only).
- `2026-10-09-fleet-json-schema-eras.md` :14 — main checkout's dirty launcher
  diff is **+22/-2**, not +24/-2 (`git diff --numstat`). Reuse-key lineage:
  `a9c5f02` added paneReused/panePhase/promptReused (10→13), `ea8f6a7`
  worktreeReused (→14), `f28747b` retired (→15), `efd6d88`
  worktreeRecreated (→16); `b8a639b`/`803f1ad` added no record keys.
- `2026-10-09-git-reconstruction.md` :13 — shokunin3 "10 rows tip=main,
  vacuous" is wrong as read at check time: only comms-keeper and
  cascade-keeper were ancestors of main; the other 8 carried one unique
  unmerged commit each (live fleet, drifting).
- `2026-10-09-tower1-fleet-audit.md` :13 — the `tf-audit-safety`
  `L1_CEILING_EXCEEDED` detail is not confined to tf-launcher transcripts: it
  appears in ~31 files under `tower1/sessions/` across 7 mission dirs plus 5
  files under `tower1/reports/`.
- `2026-10-09-reconstruction-hazards.md` :12 — "19/59 registries all-null"
  mixes denominators; canonical five-fleet recount at r2 check time: 47
  registries, 1525 members, 342 null agentIds, 11 all-null (receipt-keeper's
  own r1+r2 registries excluded by the five-fleet scope; live shokunin3 counts
  drift — my recount mid-round found 59 files/1929 members including this
  mission).
- `2026-10-09-wall-cross-ref.md` — four refutes: the 44-row join is 43 (one
  fleet row per mission joins by runId; `tf-probe-band` %5 has no manifest
  row); `fleet.json` **does** carry terminal state inside `launchResult`
  (stopped/completed snapshot, e.g. exitCode 129, RECONCILE x5 in shokunin3);
  `status --lite` does not "strip panePid" — no status variant emits panePid
  (missionView 2911-2963 has none; getStatus 2965-3149 uses panePid only in a
  liveness guard; the 50-cap :3015/:3020 is not lite-gated); %5 and %21 were
  omitted from the reuse list.
- `2026-10-09-round-receipts-fn.md` — literal sort expression is
  `Number(a.match(/r(\d+)\.md$/)?.[1] ?? 0)` (corpus wrote a `?? 0` on the
  regex literal); unflagged hazard: a *directory* named `m-r3.md` is returned
  as a receipt; line anchors drift on main checkout (:971 under the
  uncommitted diff).
- `2026-10-09-status-reconcile.md` — `readFleetState` returns `null` for
  scalars but **arrays pass** the `typeof` check and are returned; the row
  field list is not uniform (`fleet`/`foreignFleet` absent on `state`,
  `not-on-wall` and `wall-retired` rows).
- `2026-10-09-ceiling-enforcement.md` :15 — "~51 s" is shokunin2 (8 missions),
  not 16; one-mission fleets stamp `launchedAt` 0.075-0.121 s *before* the
  first session stem; live shokunin3 ran ~182 s. `maxTime` *does* become an
  omp deadline that stops active work; observed overruns were idle lifetime
  (towerprobe: 111 min process vs 60 min cap, last turn at 30.6 min).
  "Every session_exit is sighup" is L1-only (33/33); subagent sessions exit
  `dispose` (1672 counted).
- `2026-10-09-docs-drift.md` — D1 attribution: abort→record changed in
  `a9c5f02`; `803f1ad` only refactored the block into `recordMissionFailure`;
  `99af0eb` added the write-root guard; the dirty launcher touches none of
  D1–D5.
- `2026-10-09-report-counts.md` :14 — "tf-launcher avoided it via r1 file" is
  wrong wording: its registry accumulates both rounds (45 keys for 48 lanes).
- `2026-10-09-wave-artifact-zoo.md` — incomplete: missing `scratch/` (6124
  files, 505 MB under shokunin3), `lanes-haiku.yml` (operator overlay, all 10
  missions), `policy/`, `ufo-fixture/`, `specs/`, `tf-audit-docs/`,
  `.ufo/scopes/`, fleet-root `wave-r*-spec.json`/`payload-*.json`/`*.sh`,
  `*.registry.snapshot.json`, `lane-05-driver.sh`; 5 waves carry
  `.dispatch.json` with no `.payload.json`; live suffix counts drifted
  (193 waves/ files; 46 spec / 40 payload).
- `2026-10-09-sessions-transcripts.md` — spill files include
  `N.bash-original.log` as well as `N.bash.log`/`N.eval.log`; lane-completion
  mining needs async-result **∪** wait toolResults (ledger 49 = 32+17);
  `eval` args live under `.arguments` not `.args` (1225 hits); first user
  message is a `<file name=…>` wrapper (prompt body byte-identical inside).
- `2026-10-09-prompt-as-record.md` — six of seven checked launcher templates
  render byte-different prompts (`/skill:ufo` era, missing substrate-write
  guard, etc.); only `a842b2f` matches `ada7a90`/`753ce84`.
- `2026-10-09-launch-partial.md` / `2026-10-09-close-record.md` —
  `--json` emits one doc at :931 (the :930-944 lines are human-mode only);
  :907 truncates an existing fleet.json before writing (a mid-write failure
  leaves a partial file, not the old one); exit 2 has ~9 launcher paths;
  `COMPLETE_FAILED` does not prove the close failed to land (manifest written
  :3387 before tmux settle :3388); forced close: wall marks completed (:3362)
  then kills non-live-marked panes (:1917/:1925).
- `2026-10-09-failure-codes.md` — `LAUNCH_FAILED`/`WALL_OUTPUT` are set at
  :868/:876 (:883 is only the `recordMissionFailure` call); pre-loop throw
  list is ~10 codes short; the erased `tf-audit-safety` row survives in
  dozens of transcript/report copies.
- `2026-10-09-shokunin-fleet-audit.md` :13 — corpus counts lag commits by one
  confirmed (wave-smith 30 vs 31 at `84074ac`; skill-scribe 24 vs 25 at
  `3a0cad9`, in-round append r1:123; test-smith 26 vs 27 at `57ca282`).
- `2026-10-09-swarm-registry.md` — recorded `agentId` equals the member key
  for ~90% of non-null entries (1082/1198 or 1295/1443 depending on scope) —
  a recorded id is not runtime-handle proof; 20 duplicate agentIds across
  registries.
- `2026-10-09-receipt-claim-audit.md` — tf-audit-wall-r1's FAIL row names 9,
  its headline says 7, disk has 7 `verdict: FAIL` (L1BoundCritic29,
  WallVerbsReviewer21 are PASS on disk).

## Changed

Card rewritten in place for all refuted card claims; this entry records the
corpus deltas (append-only). Three new entries added:
`2026-10-09-round-attribution.md`, `2026-10-09-band-config-clobber.md`,
`2026-10-09-scratch-contamination.md`.

## Unknowns

- `VerifyDocsDrift` confirmed D1–D5 but the corpus `unknowns_dirty_diff` claim
  "touches none of D1-D5" is confirmed-yet-incomplete wording (unchanged).
- Registry/branch/file counts are time-scoped: shokunin3 is live and its
  counts drift between checks; every census above carries its check time.
- `TrialSafetyR2`'s report is ~160 lines (above the ~120 shape guideline);
  noted, no fix.
