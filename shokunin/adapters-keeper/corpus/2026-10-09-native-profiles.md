# native-profiles — four profiles, one admitted substrate

Asked: the nativeProfiles section of config/ufo.json and its relation to the adapters.
Source: lane NativeProfiles (`reports/adapters-keeper/NativeProfiles.md`).

## Observed

`config/ufo.json` nativeProfiles (:98-248) has **4 keys**:

| profile | lines | transport | judge-admitted |
| --- | --- | --- | --- |
| `omp-native-v1` | :99-189 (self-contained) | `omp/task` | yes |
| `omp-native-v2` | :190-193 (extends v1) | inherited | yes — strict |
| `omp-native-resilient-v1` | :194-197 (extends v1) | inherited | on operator re-charter |
| `devin-native-v1` | :198-247 | `devin/subagent` | **no** — `admittedByJudgeHandoff: false` |

- Only omp carries judge-admitted profiles (honestyNote :203: `ufo judge-handoff`
  admits the omp-native profiles only; the judged path stays `self-iter` delegation to
  the canonical Rust runtime). codex/cursor/grok/kimi/opencode have **no profile** and
  no code consumer — compatibility surfaces (run-logic.md:13-15).
- omp-native-v1 topology: `judgeCommand: "ufo judge-handoff"`,
  concurrencyCeiling 32, planner(1)/distiller(1)/probe-labrat(depth 2, parent executor),
  10 proposal roles, `l1Context.minimumTokens` 1M.

## Reported wrinkles (record, don't repeat as fact)

- `packages/devin/README.md:33` cites `nativeProfiles.devin-native-v1.modelRoutes` — the
  key does not exist and would be refused (sync:453-455, check-routing-free-config:21).
- config :140 anchors `OMP_RUN_TIMEOUT_MS` at run-omp-native-trial.mjs:85-91; the
  constant lives at :120 (same stale-anchor class substrate-keeper recorded).
- `devin-native-v1.concurrencyCeiling: 16` has no consumer in scripts/ or crates/.
- `crates/ufo-core-runtime/src/titanium.rs:824-828` accepts only profile
  `omp-native-v1` for OMP records while the launcher default is `omp-native-v2`
  (run-omp-native-trial.mjs:50) — possible drift, crates-keeper boundary.

## Contract

Profile membership ≠ substrate membership: profiles are a per-substrate judged-dispatch
contract, and only the primary seat has an admitted one.
