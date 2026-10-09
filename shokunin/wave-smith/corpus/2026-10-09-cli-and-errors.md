# cli-and-errors — the three verbs, argv discipline, exit codes, error envelope

Asked: the CLI surface `plan` / `run` / `record`.
Source: `scripts/ufo-swarm-wave.mjs:112, 1354, 1401-1455, 1801-1907`;
`ufo-mission-result.mjs:1932-1991, 2014-2033`. Lane: `CliAndErrors`.

```
plan   --spec <wave.json|->|--spec-json <json> [--emit-tasks] [--route-families|--route-probe <exe>] [--prior-refinement <ledger> --expect-parent-run <runId>]
run    --spec ... | --spec-json ...            [--route-families|--route-probe <exe>] [--prior-refinement ... --expect-parent-run ...]
record --registry <path> --assignments <json>
```

| rule | behavior |
| --- | --- |
| streams | success JSON → **stdout** (pretty); errors → **stderr** (compact single line) |
| envelope | `{"schema":"ufo-swarm-wave-error-v1","code","message"[,"details"]}` |
| exit codes | `0` ok · `1` typed/spec/fs (`reportError` always 1) · `64` usage (`emitUsageError`) |
| mapping | `SwarmWaveError` → its code; `EXEC_PATH_OUTSIDE_ROOT` → verbatim; `SyntaxError`/ENOENT/ENOTDIR/ELOOP/EACCES/EPERM → `invalid_spec`; else → `internal` |
| spec source | exactly one of `--spec` / `--spec-json`; `--spec -` reads stdin (same 1 MiB bound) |
| `run --emit-tasks` | usage fault ("run always emits the full dispatch payload; --emit-tasks is plan-only") |
| argv walk | value consumed only when the next token is present and not a declared flag/value, else `<name> requires a value`; a value leading with `--` (double dash only — `rejectFlagLikeValues` tests `startsWith("--")`) → same fault, so `--spec -x` consumes `-x` as a path; duplicate value option → `duplicate <name>`; declared flags deduped by the walker, then plan/run refuse `duplicate --emit-tasks` / `duplicate --route-families` |
| termination | `process.exitCode = main(argv)` — **never** `process.exit()`, so a large buffered plan cannot be truncated |

Observed exit codes: no args → 64 (USAGE dump); `plan --bogus` → 64 `unsupported argument:
--bogus`; `plan --spec a --spec-json b` → 64 `declare exactly one spec source`;
`run --emit-tasks …` → 64; `plan --spec-json 'not json'` → 1 `invalid_spec`; a valid
2-lane resume-only plan → 0; missing spec file → 1 `invalid_spec: spec: ENOENT…` (path
redacted); a 2-lane **spawn** under the live floor → 1 `too_few_lanes`.

## Not carried by the source

- No `--help`/`-h`: any unrecognized token is `unsupported argument: <arg>`.
- No exit code other than 0/1/64; `internal` still exits 1. No per-code exit differentiation.
- No `--flag=value` form: a value must be the next argv token.

## Unknowns

- The `internal` mapping and the `details` branch were not triggered empirically.
- `--spec -` stdin and the `record` success path were probed elsewhere, not here.
