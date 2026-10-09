# 2026-10-09 — the lane-report convention and the three-base trap

**Asked.** How does a lane report land, and how is it collected? (lane
`LaneReportConvention`, connector.)

**Observed.**

- **Declaration.** `reportDir` is a spec key (`ufo-swarm-wave.mjs:273`), relative
  by law (`validateRelativePath`/`validateReportDir`, `:392-414`: absolute,
  backslash, empty/`.`/`..` all refuse `invalid_report_dir`). The instruction is
  minted by **one** renderer: `Report: write your scoped findings to
  ${reportDir}/${name}.md` (`:215-217`), appended last by `appendReportSuffix`
  (`:177-210`). The payload’s task keys are exactly `name/agent/task` — **there is
  no per-lane cwd**, so the write lands in the **dispatching session’s cwd**.
- **The landing leaf.** Runner default `REPORT_DIR =
  test/evidence/wave-<stamp>/lane-reports` (`run-wave-test.mjs:269-270,281`); one
  dedicated leaf holds all lanes’ `<Name>.md` flat plus `swarm-registry.json`
  (`registryRelPath` = `${reportDir}/swarm-registry.json`, `:420-426`). Fleet
  variant leaf = `<stateDir>/reports/<missionId>` (`sighting/l1-prompt.md:115-119`).
- **Collector join.** Member name is the join key (`/^[A-Z][A-Za-z0-9]{1,31}$/u`);
  `reportDir` is read from the **registry file** (fallback: the wave record),
  gated by `trustedReportDir`; per member `join(UFO_PROJECT_ROOT, reportDir,
  name + '.md')` (`:619`) — the registry base, **never** the dispatching cwd.
  Presence via `beneath` + `lstat` regular-file-only. `reportSummary {expected,
  present, missing-by-name}` is **presence only — it never reads contents**. No
  `reportDir` → no summary, never all-missing.
- **The three-base trap.** One relative string, three bases: the lane *writes* to
  the dispatching session’s cwd; the *registry and collector* resolve against
  `UFO_PROJECT_ROOT`; a human `ls` uses `REPO_ROOT`. Dispatch from a different cwd
  and the reports are invisible at every checking base — `ls` counts 0 and
  `reportSummary.missing` lists every member although the bytes exist, because a
  presence-only collector cannot distinguish missing from mislocated. Documented
  recovery: `find '*lane-reports/*.md' -newer <spec>`.
- **Locator rule proposed by the lane** (base-agnostic, registry-anchored): *a
  lane report lands as a sibling of the wave’s `swarm-registry.json` — the
  directory you find that JSON in on disk is the landing directory; the honest
  landing receipt a lane gives is the absolute path it lstat’d after its own
  write.* Use the registry’s **directory**, never its rows, as the locator.
- **Live instance of the trap** (prior fleet): `EvidenceLayout.md` mislanded in
  the worktree and was relocated by the L1.

**Changed.** Nothing — read-only research.

**Unknown.** The smoke/runner sequence asserts `reportSummary.present == lanes`
while collecting with `UFO_PROJECT_ROOT = SCRATCH_ROOT` and assuming reports under
`$REPO` — satisfiable only if the dispatch cwd equals `SCRATCH_ROOT` ([INFERENCE],
unrun). With no declared `reportDir` the registry falls back to
`.ufo/scopes/<wave>/` and lanes get no instruction — the rule must carry that
branch. Lane report:
`.tower/fleets/shokunin2/reports/evidence-auditor/LaneReportConvention.md`.