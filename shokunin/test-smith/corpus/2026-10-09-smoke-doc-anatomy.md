# 2026-10-09 — smoke doc anatomy: the live half and its honesty ledger

**Asked.** What is `test/sighting-wave-smoke.md` — its role, band table, prove
list, step sequence, negative assertions, honesty rules, and its own
"what it does not prove" ledger? (Lane `SmokeDocAnatomy`, scribe.)

**Observed.** Source: `test/sighting-wave-smoke.md` (653 lines by `grep -c ''`;
`wc -l` 652 — no trailing newline).

- Role (lines 7-22): the live half of a three-artifact test — the other two are
  the dry halves `test/run-wave-test.mjs` (automated, hard stop at the dispatch
  boundary) and `test/tower-fleet.test.mjs` (launcher, fixtures only). Step 5
  (one batched OMP `task` call) is "the step no script takes" (line 436).
- Band-authority table (24-49): single source `host/ufo-sighting-dispatch.json`,
  merged into `<ufoRoot>/config/ufo.json` by `node host/apply.mjs --apply`.
  Six keys: `waveMinLanes 16` (wave floor), `waveMaxLanes 32` (wave ceiling),
  `maxLanes 100` (per-L1 round ceiling), `maxConcurrentL1 16` (globally live L1
  missions), `windowPaneCeiling 16` (panes in one `--fleet` window),
  `missionFormat.l1Alias m_strong` (the only model reference any argv carries).
  Rules: a wave is 16-32 lanes, a round up to 100 as sequential waves of at
  most 32; measure the band from the merged config, never the table alone;
  pre-apply the file still carries the 32-100 band and `--band live` refuses
  `apply_not_landed`; `host/omp-agent.config.yml` prose is not the band
  authority. A wrong `UFO_CONFIG_PATH` makes the planner silently fall back to
  its built-in band and refuse 16 lanes as `too_few_lanes` (386-389).
- "What this test proves" (51-69), six claims: band edges real (15 refused
  `too_few_lanes`, 16/32 admitted, 33 `wave_too_wide`, 101 `too_many_lanes`);
  `run` renders a `ufo-swarm-wave-dispatch-v1` payload with explicit roles, no
  per-lane `model`, `/skill:godspeed` leading line; dispatchable as exactly one
  batched `task` call; `tower-fleet.mjs plan` reads band/ceiling/alias live,
  writes nothing, emits worktree/branch/prompt/argv; the wall opens, reports,
  hosts a `--fleet` window, closes honestly; per-lane reports join into the
  `ufo-mission-result-v1` envelope.
- Step sequence (headers): preconditions 129-160; step 0 dry half 162-200;
  step 1 open wall 202-231; 1b wall visibility 233-253; 1c tower fleet
  255-346; 2 declare spec 348-370; 3 plan 372-407; 4 run/assert payload
  409-432; 5 dispatch 434-457; 6 settle 459-491; 7 record/collect 493-532;
  8 close honestly 534-568; negative assertions 570-601; failure/honesty rules
  603-616; post-merge command list 618-653.
- Negative assertions (570-601): 15 rows — 15-lane `too_few_lanes`; 16/32
  admitted; 33 `wave_too_wide`; 101 `too_many_lanes`; resume-only 1 lane
  admitted (`counts.resume == 1`); resume message carries no `/skill:godspeed`;
  all-`m_fast` wave `singleFamily == true`; mixed wave `singleFamily == false`;
  `duplicate_expansion`; `role_required`; `unknown_role`;
  `resume_unknown_member`; `resume_role_forbidden`; `spec.maxLanes` below floor
  `impossible_band`. Launcher refusals on fixtures: `MUTATION_REQUIRES_APPLY`,
  `INVALID_SPEC`, `SCOPE_OVERLAP`, `L1_CEILING_EXCEEDED`, exit 64. Collector
  and wall codes (`unmapped_member`, `WALL_ABSENT`, `MISSION_NOT_FOUND`) are
  live-half only, in neither dry half.
- Failure/honesty rules (603-616): a refusal means fix the spec or execute
  directly — never bypass validation or split one wave; report only observed
  results ("if the wall says `opaque`, the reports are 13/16, or a lane timed
  out, that is the finding"); the wave is advisory to one L1, no lane judges or
  spawns (leaf; the executor's single `labrat` is the only exception, bounded
  by `task.maxRecursionDepth: 2`); never hardcode a provider/model/credential;
  a launcher failure is data too (`LAUNCH_PARTIAL`, a `not-on-wall` row, a
  reused-worktree warning go in the record verbatim).
- Honesty ledger "What it does not prove" (71-127): Block A (swarm lanes) —
  lanes are not wall missions (the wall shows only the parent's L2 counter;
  `levels.l2: null` with `"opaque"`/`"unavailable"` means unknown, never
  settled); the wall cannot show lanes as panes (geometry grid 3×5/3×6, and
  `windowPaneCeiling` 16 for a `--fleet` window — display capacity, not a wave
  bound); `complete --mission` kills the mission's pane (last step, after
  settle); the Godspeed hook is project-scoped to `ufo-fsd-alpha`, so from this
  repo the guarantee comes from the wave renderer alone. Block B (tower fleet)
  — a launched pane is not a working fleet; `launch` does not prove the wave
  dispatches; the ceiling check is necessary not sufficient (the tower1
  16-declared/15-panes/`LAUNCH_FAILED` episode: `maxConcurrentL1` bounds
  globally live missions); a partial launch is a result (`LAUNCH_PARTIAL`,
  never rolls back, never removes a worktree); `close` is not cleanup (fixed
  note, aborts on first failure, never removes a worktree); `status` reports
  the wall, not the truth about the work; worktree reuse is a warning path, not
  idempotence.

**Changed.** Nothing — read-only research.

**Unknown.** No command, script, or CLI in the document was executed; the band
values, refusal codes, `apply_not_landed` behaviour, the tower1 episode, the
hook path, and the pane geometry products are document claims reproduced, not
independently confirmed. Cross-artifact consistency (e.g. whether
`run-wave-test.mjs` really asserts every negative-assertion row) is out of this
lane's scope.
