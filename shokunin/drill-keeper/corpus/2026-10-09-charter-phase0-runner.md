# charter-phase0-runner — where drills actually run

Asked: the drills stage of `ufo charter` Phase 0: argv, env, timeout, result shape, failure flow.
Anchor: `ufo-fsd-alpha@5ace2559` (read-only); `config/ufo.json` cited from the working copy (sha256 `0e416f0a…`, uncommitted swarm-band edit only). Lane: `CharterPhase0Runner`.

## Observed
- **Only `ufo charter sign <runId>` runs Phase 0.** `CharterAction` has the single variant `Sign` (`crates/ufo-cli/src/main.rs:93-98`); there is no check verb.
- `CHARTER_PHASE0_STAGES = ["contracts", "build", "drills"]` (`:850`). All three are evaluated eagerly with no short-circuit (`:956-974`):
  - contracts: `node <root>/scripts/sync-ufo-contracts.mjs --check`, timeout `UFO_CONTRACT_SYNC_TIMEOUT_SECS` (default 60);
  - build: `cargo build -p ufo-core-runtime -p ufo-cli` (no `--locked`);
  - drills: `node <root>/scripts/ufo-drills.mjs`, no flags, so the full suite with the coverage invariant runs.
- cwd = invoking cwd (`current_dir()`, `:1007`); env fully inherited (no `env_clear`, so ambient `UFO_LIVE`/keys flow into the suite); stdin empty. Timeout for build and drills: `UFO_CHARTER_PHASE0_TIMEOUT_SECS`, default 900; values < 1 or unparsable fall back to 900. Output cap 4 MiB per stream; a timeout kills the process group.
- Stage record: `{stage, ok, exit, stderr_tail (≤2048 chars)}`, or `{stage, ok:false, error}` on spawn failure, timeout, or oversize. Debug-only seam: `UFO_TEST_CHARTER_PHASE0` (a release build refuses it with exit 2 `invalid`).
- Artifact `.ufo/charter/<runId>.json` (kind `ufo-charter-sign-v1`: run_id, sealed_accepts, operator_ts, phase0{contracts,build,drills}, membrane_signoff) is written on both outcomes.
- **Drills failure:** `phase0.drills.ok=false` → `membrane_signoff:false`, seal kept, exit **1** with kind `phase0_failed`. The message names only the first failing stage. Pass → seal removed, exit 0.
- `drills.enabled` is not read.

## Drift
- `main.rs:15` after_help lists `phase0_failed` under exit 2; the code exits 1.
- Spec 06 (`06-…:106-108`) lists 6 Phase 0 stages; the code runs 3.
- No test pins the real drills argv.

## Consequence
The drill matrix is enforced only when an operator signs a membrane seal (TTY-only). Nothing on the routine `gates.sh` path runs it.
