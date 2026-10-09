# 2026-10-09 — per-run evidence layout of run-wave-test.mjs

**Asked.** What artifacts does `test/run-wave-test.mjs` write per run, where,
and what does `manifest.json` record? (Lane `EvidenceLayout`, scout.)

**Observed.** Source: `test/run-wave-test.mjs:226-360,1337-1422` (plus the
write sites cited below).

- Root: `EVIDENCE = --out (path.resolve) ?? test/evidence/wave-<stamp>`;
  `SCRATCH_ROOT = EVIDENCE/ufo-root` (`:269-271`); `stamp` = ISO-8601 with
  `-`/`:`/`.sss` stripped (e.g. `20261009T123456Z`). `writeEvidence` /
  `writeEvidenceJson` (`:295-304`) join every name onto `EVIDENCE`; `specFile`
  (`:399-404`) mkdirs recursively, so names may carry subdirs (`refusals/`,
  `wall-*`).
- Always written: `apply-dry-run.log` (`:446`); `spec-<lanes>.json` (`:529`);
  `plan-<lanes>.stdout.json` (`:549`); `dispatch-<lanes>.json` (the
  `ufo-swarm-wave-dispatch-v1` payload, `:573`); `swarm-registry.json` (copy of
  the admitted registry, `:617-618`); the band matrix
  `spec-band-<n>`/`band-<n>` for n in {floor-1, floor, floor+1, waveMax,
  waveMax+1, cap, cap+1} (`:731-736`); the cap cases
  `spec-cap-<m>x<l>`/`cap-<m>x<l>`, `spec-cap-tight`/`cap-tight`,
  `spec-cap-widen`/`cap-widen` (`:762-776`); the resume cases
  `spec-resume-only-<n>`/`resume-only-<n>`, `spec-resume-only`/`plan-resume-only`,
  `run-resume-only.json`, `spec-resume-cap`/`resume-cap`,
  `spec-resume-widen`/`resume-widen` (`:829-905`); `spec-mixed-<t>`/`mixed-<t>`
  (`:882-883`); `record-synthetic.stdout.json` (`:796`); the route-family cases
  `spec-route-mixed-<waveMax>.json`, `spec-route-single-family-<waveMax>.json`,
  `plan-route-families-mixed.json`, `plan-route-families-single.json`
  (`:1017-1087`); `route-preflight.json` (`:1026`); `refusals/<id>.json` +
  `refusals/<id>.output.json` for the 8 refusal ids (`:980-981`);
  `fixture-home/.omp/agent/config.yml` (`:1079-1081`); and under
  `ufo-root/`: `config/ufo.json`, `priors/<wave>/swarm-registry.json` ×2, and
  `<REPORT_DIR>/swarm-registry.json`.
- `manifest.json` (written in `finish()` `:1349`, after the boundary,
  try/swallow `:1348-1372`): schema `ufo-sighting-wave-smoke-manifest-v1`,
  `stamp`, `generatedAt`, `repoRoot`, `ufoRoot`, `bandMode`, `lanes`, `wave`,
  `reportDir`, `evidenceDir`, `scratchProjectRoot`, `liveWall`, `dispatched`
  (hardcoded false, `:1362`), `node`, `runMeta` (`band{mode,configPath,expected}`,
  `wall{executed,commands}`, `payload{path,registry,lanes}`, `seatAliases`),
  `checks[] {id,ok,detail}`, `passed`, `exitCode`.
- `--out DIR` resolves to an absolute path (`:237-238`) and replaces
  `EVIDENCE`; `SCRATCH_ROOT` follows. `REPORT_DIR`'s default is repo-relative
  `test/evidence/<basename(EVIDENCE)>/lane-reports` (`:281`) and does not
  follow `--out` [INFERENCE].
- Boundary vs live wall: before the boundary, all step 1-6 artifacts above; at
  the boundary, `dispatch-boundary.txt` (`:1332`); after it, `manifest.json`.
  Only `--live-wall` writes `wall-open.log`, `wall-status.log`,
  `wall-overview.log`, `wall-surface.log` (`:1227-1233`); the dry run prints
  commands only and records `runMeta.wall.executed=false`.
- Not written by the script: `wave-envelope.json` appears only in the printed
  manual collect command (`:1316`); lane reports `<REPORT_DIR>/<Name>.md` are
  written by the lanes.

**Changed.** Nothing — read-only research.

**Unknown.** The literal scratch registry suffix for a run was not observed
(`test/evidence/` is empty); no live run was executed — the layout is
static-source only.
