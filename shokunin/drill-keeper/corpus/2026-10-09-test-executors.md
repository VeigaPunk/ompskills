# test-executors — cargo-test, node-test, judge-handoff, shell

Asked: argv/cwd/env/timeout per executor, the "ran 0 tests" guard, and the judge-handoff shadow.
Anchor: `ufo-fsd-alpha@5ace2559` (read-only); `config/ufo.json` cited from the working copy (sha256 `0e416f0a…`, uncommitted swarm-band edit only). Lanes: `TestExecutors`, `TestNameResolution`. Scratch probes ran on node v24.21 under the fleet scratch root only.

## Executors
| executor | argv | cwd / shadow | env | timeout |
| --- | --- | --- | --- | --- |
| node-test (7) | `node --test --test-name-pattern <name> <root>/tests/<file>` (pattern before file — after the file it runs all tests) | root / root | process.env + setup.env | 300 s |
| cargo-test (25) | `cargo test --locked -p <package ?? ufo-core-runtime> [--lib \| --test <suite>] -- <name> --test-threads 1` (substring filter) | root / root | process.env + setup.env | 600 s |
| shell (1, d-wall) | `spawnSync(argv[0], argv.slice(1))`, no shell; optional `pathExclude` PATH symlink farm | shadow or root (`realRepo`) | process.env + setup.env | 120 s |
| judge-handoff (1, d-double) | `<ufoBin> judge-handoff --input <shadow>/…/handoff.json --project-root <root>` | `.ufo/drills/<id>/` / reports `root` | + forced `UFO_LIVE=0`, `UFO_LIVE_DISPATCH=0` | 120 s |

- cargo suites: lib 21, `--test loop_driver` 3 (`d-i7-provenance`, `d-membrane`, `d-membrane-negative`), `-p ufo-cli --test cli_contract` 1 (`d-sign-auth`).
- **All 32 named tests exist** (25 cargo `#[test] fn`, none `#[ignore]`; 7 node titles, each unique under the filter).
- "ran 0 tests" guard: `finalizeAssertions` (`:1185-1199`) appends `namedTestRan` for cargo-test/node-test; `resultLineRan` (`:1158-1164`) needs the name at a token boundary plus a result marker (`test `, `✔`, `✖`, TAP `ok N -`), and rejects `ignored`/`# skip`. Latent false-green: a zero-match node run still prints a file-level `✔ <file>` line, so a test name equal to the file name would pass. No current drill hits it.
- Executor throw → `observed.exit = -1` → `childExit` assertion fails (`:1637-1639`, `:1171-1183`).

## judge-handoff (d-double)
Shadow = `join(evidenceRoot, drill.id)` = `<repo>/.ufo/drills/d-double/` (wiped first). It copies `conformance/fixtures/native-handoff/` (31 files), sets `contract_root = root`, rebinds per-agent paths and hashes, applies `transcriptPatch` (wave_token alpha on `main-proposal-wave-task`, then appends a second wave `main-second-wave-task` with token beta), and expects exit 2 with `double_dispatch`.

**Broken at HEAD (verified by L1):** `refreshContractHash` reads `crates/ufo-core-runtime/src/native.rs` and regex-matches `NATIVE_CONTRACT_FILES: [&str; N] = [...]` (`:416-418`). `native.rs` only re-exports the name (`:69`); the array lives in `native_contract.rs`. The match fails, the executor throws `NATIVE_CONTRACT_FILES not found in native.rs` before spawn, and d-double fails on `childExit`. `--self-test` does not probe this path.

## Env asymmetry
Only self-iter and judge-handoff force the live flags off. cargo-test, node-test, sync-check, and shell inherit ambient `UFO_LIVE`, `OMP_BIN`, and API keys — see `fixture-route-rule`.
