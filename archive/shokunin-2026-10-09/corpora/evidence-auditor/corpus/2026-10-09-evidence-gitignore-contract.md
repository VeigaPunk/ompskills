# 2026-10-09 — the `test/evidence/` contract: run output, not source

**Asked.** What is the evidence-directory contract under `test/evidence/`, where
is it stated, and is it machine-enforced? (lane `EvidenceGitignore`, scout.)

**Observed.** Source: `test/evidence/.gitignore` (5 lines / 240 bytes, verbatim):
comment `# Run output, not source: … Keep the directory, ignore everything in it.`,
then `*` and `!.gitignore`. `*` ignores every path at any depth; `!.gitignore`
re-includes only that file, so the directory survives as the shell whose single
tracked member is the ignore file (no `.gitkeep`). This is the **only** ignore
file in the repo (`find . -name .gitignore` → just it; no root `.gitignore`).

Observed enforcement (git-native, in the worktree):
`git check-ignore -v test/evidence/wave-20261009T120000Z/manifest.json` →
`test/evidence/.gitignore:4:*` (exit 0); `git ls-files test/evidence/` →
exactly `test/evidence/.gitignore`; `git status --porcelain test/evidence/` → empty.

Naming: `test/run-wave-test.mjs:269-270,91` —
`stamp = ISO-8601 UTC with -/: stripped and ms dropped` (`2026-10-09T12:34:56.789Z`
→ `20261009T123456Z`); `EVIDENCE = opts.out ?? <TEST_DIR>/evidence/wave-<stamp>`;
`writeEvidence`/`writeEvidenceJson` join every name onto that one root.

Restated (not independent sources): `test/sighting-wave-smoke.md:19-22`;
`test/run-wave-test.mjs:53-55`; `.omp/agents/test-smith.md:32-35,79`.

**Rule.** Never commit any path under `test/evidence/` except
`.gitignore` itself: no run output ever enters a commit.

**Machine-enforced?** No. Git's ignore semantics *are* the mechanism, but there is
no repo gate: `git grep -n -i gitignore -- '*.mjs' '*.js' '*.json' '*.yml'` → rc=1
and `git grep -n check-ignore` → rc=1. Nothing would fail if a covered file were
force-added or a run wrote outside the tree.

**Changed.** Nothing — read-only research.

**Unknown.** `--out DIR` / `--report-dir` are `path.resolve`d
(`test/run-wave-test.mjs:170,270,281`), so an explicit outside value
would land outside the ignore rule ([INFERENCE], not executed). No live run was
executed; the stamp format is source-derived plus one directory name cited in a
committed report. The exhaustive write-site inventory is the sibling
`evidence-layout` item. Lane report:
`.tower/fleets/shokunin2/reports/evidence-auditor/EvidenceGitignore.md`.