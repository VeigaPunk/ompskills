# 2026-10-09 — lane-report convention and the three-base trap

**Asked.** How is the lane reportDir declared, rendered, and joined, and what
trap does the relative path create? (Lane `LaneReportConvention`, connector.)

**Observed.** Sources: `ufo-swarm-wave.mjs:177-217,273,392-426,1155-1158,1504-1505`;
`test/run-wave-test.mjs:169,250,277-281,540-544,1279,1299`;
`test/sighting-wave-smoke.md:365-367,466-468,486-491,515,528`;
`ufo-swarm-collect.mjs:79,81-83,473-491,615-624,741-753`; `sighting/l1-prompt.md:118-119`;
this wave's `test-smith-r1-w1.payload.json` and the live filesystem.

- Declaration: `reportDir` is relative by law — `SPEC_KEYS` includes it
  (`ufo-swarm-wave.mjs:273`); `validateRelativePath`/`validateReportDir`
  (`:392-414`) refuses absolute, backslash, and empty/`.`/`..` segments as
  `invalid_report_dir`. This wave declares `reports/test-smith`. The runner
  exposes `--report-dir REL` (`run-wave-test.mjs:169,250`) and re-checks before
  writing the spec (`:540-544`).
- Instruction rendering: `reportInstruction` = "Report: write your scoped
  findings to `<reportDir>/<Name>.md`" (`:215-217`), one verbatim renderer for
  spawn and resume; `appendReportSuffix` (`:177-188`) keeps it the last
  paragraph inside the Godspeed envelope, before a terminal `| godspeed`
  marker; `laneBindingSuffix` (Lane bounds / Judged on / Milestone) is appended
  before it (`:1155-1158`). Live proof: this wave's composed tasks end with the
  Report line and open with `/skill:godspeed`.
- Landing mechanic: the task transport carries no per-lane cwd (payload task
  keys are exactly `name, agent, task`); lanes are not wall missions (no
  `omp --cwd` argv), so the relative string resolves against the dispatching
  session's inherited cwd (`run-wave-test.mjs:277-278,1279`;
  `sighting-wave-smoke.md:365-367,466-468`; `l1-prompt.md:118-119`).
- `lane-reports` subdirectory: default `REPORT_DIR =
  test/evidence/<stamp>/lane-reports` (`run-wave-test.mjs:281`) so lane
  artifacts land in the evidence tree the script owns; the leaf doubles as the
  wave's identity scope — the registry lives at `reportDir/swarm-registry.json`
  (`ufo-swarm-wave.mjs:420-426`), and a cross-wave overwrite is refused
  `wave_registry_collision` with remediation "Use a distinct reportDir"
  (`:1504-1505`).
- Collector join: `ufo-swarm-collect.mjs` `MEMBER_NAME` `/^[A-Z][A-Za-z0-9]{1,31}$/u`
  (`:79`) is path-separator-free so the join cannot escape (`:615-617`);
  `trustedReportDir` accepts only a relative, beneath-ROOT, no-symlink value
  else degrades to null (`:473-491`); presence is checked via
  `join(ROOT, reportDir, name.md)` with `lstat` regular-file-only (`:618-624`)
  where `ROOT = UFO_PROJECT_ROOT` (`:81-83`) — the registry base, never the
  dispatching cwd. `reportSummary {expected, present, missing-by-name}` is
  presence-only and emitted only with a trusted reportDir (`:741-753`;
  `ufo-swarm-wave.mjs:1281-1283`).
- The trap — one relative string, three bases: a lane writes against the
  dispatching cwd; the registry and collector join against `UFO_PROJECT_ROOT`;
  a human `ls` reads against `REPO_ROOT` (`run-wave-test.mjs:1299`;
  smoke `:469`). Dispatch from a different cwd → reports land invisibly; `ls`
  counts 0 and `reportSummary.missing` lists every member although the bytes
  exist; recovery is the smoke doc's `find` (`:486-491`).
- **Live in this wave**: 22 of 23 settled reports landed flat in the join dir;
  `EvidenceLayout.md` landed at
  `<worktree>/reports/test-smith/EvidenceLayout.md` (the cwd-mechanic reading
  vs the absolute-context reading) — a collect would have listed it missing.
  The L1 relocated it into the state dir after the wave.
- Absolute landing dir: `/home/vgpnk/Projects/ompskills/.tower/fleets/shokunin/reports/test-smith/<Name>.md`
  (`reportDir` `reports/test-smith` onto `UFO_PROJECT_ROOT` =
  `/home/vgpnk/Projects/ompskills/.tower/fleets/shokunin`; the registry
  `swarm-registry.json` was observed there). The wave's shared context carried
  the trap wording itself ("resolve it against the absolute directory …"); a
  literal join of that phrasing double-nests the segment — filesystem evidence
  (22 flat peer reports, no nested dirs) disambiguates to the single-join
  reading.
- Proposed move: record the convention as a resolution rule with named bases
  and phrase the per-lane directive in absolute-join form — "write to
  `<absolute landing dir>/<MemberName>.md`", landing dir = `UFO_PROJECT_ROOT` +
  `reportDir` — instead of "resolve `<relative>` against `<absolute landing
  dir>`", which double-nests under a literal reading.

**Changed.** Nothing by the lane — read-only research. The L1 relocated the one
stray report into the state dir (worktree left clean).

**Unknown.** Neither `collect` nor the live 16-lane smoke was executed; the
runner's own sequence (reports at `$REPO`, collect joined under `SCRATCH_ROOT`;
smoke `:515,528`) cannot satisfy `present == 16` unless the dispatching cwd
equals `UFO_PROJECT_ROOT` — the contradiction is stated, not smoothed
[INFERENCE].
