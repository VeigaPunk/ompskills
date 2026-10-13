# evidence-layout — `.ufo/drills/`

Asked: exactly what a run writes, schemas, retain, summary rules, atomicity, gitignore.
Anchor: `ufo-fsd-alpha@5ace2559` (read-only); `config/ufo.json` cited from the working copy (sha256 `0e416f0a…`, uncommitted swarm-band edit only). Lane: `EvidenceLayout`.

## Observed
- Root `evidenceRoot = <repo>/.ufo/drills` (`scripts/ufo-drills.mjs:64`). **Absent today**; gitignored at any depth (`.gitignore:4` `**/.ufo/`). No other code reads it (charter Phase 0 reads only the exit code).
- Per wired drill (`collectEvidence` `:587-638`) in `<id>/`: `stdout.txt`, `stderr.txt`, `result.json`, plus one copy per retained path named `rel.replaceAll("/","__")`. The dir is wiped recursively first unless a retain source lies inside it.
- `result.json` keys: `id, invariant, status (pass|fail), exit, durationMs, assertions[{name,ok,detail}], retained, retainedAbsent, fixtureSha256`. **No schema/kind string.** `fixtureSha256` = sha256 of `drills/fixtures/loop_specialist.py` (today `92564755…`), recorded for every drill even though the comment says self-iter only.
- `summary.json` (`kind: "ufo-drill-suite-v1"`): `kind, startedAt, drills[], counts{pass,fail,pending,referenced}, coverageInvariant{rule,wired,pending,referenced}, coverageBreaches? , finishedAt, ok`. An `--only X` run writes `summary-<X sanitized [^A-Za-z0-9._-]→_>.json` with `filter.only` and never touches `summary.json`.
- Stale-verdict rule: the summary is `rmSync`'d **before** load/build (`:1573-1578`), so a crashed run leaves no `ok:true`. `--list` and `--self-test` never remove or write it.
- **No atomicity:** plain `writeFileSync` everywhere; no temp+rename, fsync, or lock. Two concurrent runs clobber each other's per-drill dirs.
- Pending/referenced rows get a summary row only, never a dir. `d-double` (judge-handoff) uses `<id>/` as its live shadow, then `collectEvidence` deletes it (retain `[]`), leaving only the three harness files.
- Nine wired drills retain files, all self-iter: d-herd, d-i1-second-l1, d-i3-lane-dies, d-i3b-all-down, d-i4-telemetry, d-i5-cache, d-i8-saturate, d-i8-theater, d-timeout.

## Not carried
No per-invariant rollup (Spec 09 asked for one); contract digests computed for d-double live only in the transient shadow `handoff.json`; retained stdout/stderr are not credential-screened.
