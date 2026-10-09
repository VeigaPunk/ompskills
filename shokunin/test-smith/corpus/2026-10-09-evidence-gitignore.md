# 2026-10-09 — evidence discipline under test/evidence/

**Asked.** What is the exact evidence contract under `test/evidence/` — what a
run writes, what must never be committed, and the stamp format? (Lane
`EvidenceGitignore`, scribe.)

**Observed.** Sources: `test/evidence/.gitignore` (whole, 5 lines);
`test/sighting-wave-smoke.md:1-24,176-200,493-534`;
`test/run-wave-test.mjs:39-73,91,269-272,293-303,1345-1374,1386`.

- `.gitignore` contract, verbatim rules: `*` then `!.gitignore` — keep the
  directory, ignore everything in it; only `.gitignore` itself is tracked. The
  comment states the reason: run output, not source.
- One directory per run: `test/evidence/wave-<stamp>/` with
  `stamp = YYYYMMDDThhmmssZ` (ISO-8601 UTC, `-`/`:` stripped, milliseconds
  dropped; `test/run-wave-test.mjs:269`). Verified transform:
  `2026-10-09T12:34:56.789Z -> 20261009T123456Z`.
- A run writes: specs (`spec-16/15/33/101/ceiling-32/single-family-16/resume-only.json`),
  `plan-16.stdout.json`, `dispatch-16.json`, `swarm-registry.json` (copy of the
  `ufo-swarm-registry-v1` registry), `refusal-15/33/101.json` plus
  `refusals/<code>.json`/`.output.json`, `apply-dry-run.log`,
  `ufo-root/config/ufo.json` (the band authority used), `route-preflight.json`,
  `plan-route-families.json`, `fixture-home/.omp/agent/config.yml`,
  `dispatch-boundary.txt`, and `manifest.json`. `wall-*.log` only with
  `--live-wall`.
- `manifest.json` (schema `ufo-sighting-wave-smoke-manifest-v1`, written in
  `finish()` `:1350-1372`) is emitted on every run regardless of verdict and
  records `stamp`, `generatedAt`, `repoRoot`, `ufoRoot`, `bandMode`, `lanes`,
  `wave`, `reportDir`, `evidenceDir`, `scratchProjectRoot`, `liveWall`,
  `dispatched: false`, `node`, every check with verdict/detail, `passed`,
  `exitCode`. Its write failure is deliberately non-fatal ("the manifest is
  evidence, not a gate").
- Live steps add into the same tree: `lane-reports/swarm-registry.json`
  (written by `record`), per-lane `<Name>.md` under `lane-reports/`, and the
  collected `wave-envelope.json`.
- Never-commit rule: every path under `test/evidence/` except `.gitignore`
  itself.

**Changed.** Nothing — read-only research.

**Unknown.** The lane did not execute `run-wave-test.mjs`; the write
enumeration is from the runner header, the smoke-doc artifact table, and the
write sites, not from an executed run. No live stamp directory was observed on
disk (`test/evidence/` currently holds only `.gitignore`).
