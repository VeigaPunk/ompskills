# drills-cli — `scripts/ufo-drills.mjs` CLI

Asked: flags, exclusivity, exit codes, `--list` format, and side effects.
Anchor: `ufo-fsd-alpha@5ace2559` (read-only); `config/ufo.json` cited from the working copy (sha256 `0e416f0a…`, uncommitted swarm-band edit only). Lane: `DrillsCli`. Observed: `--help`, `-h`, `--list`, and refusal vectors were run (all read-only).

## Flags (`parseArgs` `:1510-1551`)
`--help`/`-h` (only as the sole argument); `--list`; `--only ID` / `--only=ID` (once, non-empty, no leading `-`); `--self-test`. Anything else gives `unknown argument: <arg>`.

## Refusals (all exit 2, stderr `ufo-drills: …`)
`--help is exclusive — combine it with neither --only nor --list nor --self-test`; `--self-test is exclusive — combine it with neither --only nor --list`; `duplicate --only`; `--only requires a drill id`; `no drill <id>`; `no drills found`. `--list --only d-wall` is accepted and prints one row.

## Exit codes
0: help, list, clean suite, clean self-test. 1: any failing drill, a coverage breach, or a self-test probe failure/census shrink. 2: every `DrillFormatError` (argv, load) and a failed `cargo build -p ufo-cli --locked`. Other uncaught errors are rethrown (Node default 1).

## `--list`
Tab-separated `id  status  invariant||spec||-  summary`, no header, writes nothing, but runs the full loader (so it validates the corpus).

## Side effects of a real run
- Removes the previous `summary.json` before anything else.
- If any wired self-iter or judge-handoff drill is selected and `<CARGO_TARGET_DIR|root/target>/debug/ufo` is missing, runs `cargo build -p ufo-cli --locked` with cwd = root (`:1581-1594`). A relative `CARGO_TARGET_DIR` anchors to the repo root. The substrate has no `target/debug/ufo` today, so a first full run builds.
- Writes `.ufo/drills/**` under the **substrate** — never run it against the read-only substrate; use a full scratch copy.

## Drift
`DRILLS_USAGE` omits `-h`, the exit codes, and `summary-<ID>.json`. The binary's existence is not re-checked after a build.
