# argv-integrity — one spawn primitive, no shell strings

Asked: prove argv-array shell-outs and check every option slot for unvalidated spec input.
Source: `sighting/tower-fleet.mjs` @ b251c5a. Lane: `ArgvIntegrity`.

- Sole spawn primitive: `run()` (:507-508) `spawnSync(argv[0], argv.slice(1), { encoding:
  "utf8", ...options })`; `shell` appears only in comments (:29, :505), no `execSync`/`exec(`/
  `bash -c`; no `run()` caller passes the options object, so `shell` is never set.
- `buildOmpArgv` (:468-485) and `buildLaunchArgv` (:487-503) are pure array builders; the wall
  argv ends with a `--` terminator (:501) before the omp argv (assembled :613).
- `quoteArg` (:619) is used only for plan's human `launch:` display (:647).
- **Unquoted printed command (finding):** `close`'s human removal line (:1223)
  ``  git -C ${spec.repo} worktree remove ${row.worktree}`` interpolates both paths raw.
  `repo`/`worktreeRoot` are validated as non-empty strings and by write-root containment, not by
  charset, so a path with a space or `$(...)` splits or executes on paste. The launcher spawns
  nothing here. Fix: reuse `quoteArg`.
- **Option-slot validation:** every spec string reaching an option position is pattern-checked
  (`fleet` :327, `id` :349, `maxTime` :391, `l1Alias` :161) EXCEPT `base` (:387 trim only), which
  reaches the last positional of `omp worktree add` (:810). Proven against a real `omp 18.8.6`:
  a `-`-leading `base` is read by omp as its own option (`error: Unknown option '--not-a-real-flag'`,
  exit 1). No shell injection (`spawnSync` argv), but no leading-dash guard either.

Evidence: lane `ArgvIntegrity` (real omp transcript), corroborated by `ClosePolicy` hole B.
