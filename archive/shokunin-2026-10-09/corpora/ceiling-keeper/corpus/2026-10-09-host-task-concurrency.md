# host-task-concurrency — task.maxConcurrency

Asked: every value of `task.maxConcurrency`, what 0 means, and which layer wins.
Lanes `HostTaskConcurrency` and `OmpHarnessConcurrency`. Global values re-read by the L1 (`~/.omp/agent/config.yml:24-25`).

| layer | value | where |
| --- | --- | --- |
| omp schema default | 32 | `omp://tools/task.md:158` |
| operator global | 32 | `~/.omp/agent/config.yml:24` |
| host candidate | 32 | `host/omp-agent.config.yml:203` |
| UFO project / L1 / mission overlay | 0 | `.omp/config.yml:3`, `.omp/ufo-l1.yml:7`, `config/mission-nightcall.yml:10` |

- **0 = unlimited** (omp docs `tools/task.md:158`, `tools/eval.md:255`; the bundle maps ≤0 to `+Infinity`). It queues and never refuses.
  The acquire rule is "run while active < max, else queue".
- Precedence [bundle-derived, medium-high]: overrides > `--config` overlay > project `<cwd>/.omp/config.yml` > global > default.
  The fleet dispatcher launches L1s with `--config config/mission-nightcall.yml` (`fleet-dispatcher.mjs:8497`), so UFO L1s run **unlimited**. Plain omp in a cwd with no project config gets 32.
- Enforcement of the 0: `run-omp-native-trial.mjs:478-515` `assertProjectionAgrees` requires exactly one line `/^  maxConcurrency: 0\s*$/`. Otherwise `NativeDispatchPolicyError` → BLOCKED, exit 2.
  The emitter `sync-ufo-contracts.mjs:1471-1476` writes the literal `  maxConcurrency: 0`, mirrored by `crates/ufo-core-runtime/src/lib.rs:1010`.
- No in-repo code enforces the host 32. It is omp's semaphore.

Drift:
- Launcher, emitter, and docs say the **global** carries 0 ("the global OMP config owns the host worker pool"). The observed global carries 32, and so do all its `.bak` copies.
- `mission-nightcall-kimi.yml` (100) is cited in NC2 evidence but is gone from `config/`.
- `lib.rs:940-941` says `concurrencyCeiling` is "still projected to task.maxConcurrency", which `lib.rs:988-990,1010` contradicts.
