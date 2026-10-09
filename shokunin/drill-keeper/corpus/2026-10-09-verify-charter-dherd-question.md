# verify-charter-dherd-question — what `ufo charter sign <runId>` does to the drills stage today, and the d-herd verdict

Asked: "If I run `ufo charter sign <runId>` right now on the substrate, what happens to the drills stage, and does `d-herd` pass?" Answered read-only; nothing was run against the substrate (no charter, drills, cargo, or sync).
Anchor: `ufo-fsd-alpha@5ace2559`, `git status --short` = 14 lines. sha256: `scripts/ufo-drills.mjs` `4572d182…` (matches seed), `crates/ufo-cli/src/main.rs` `6ece886f…`, `config/ufo.json` `0e416f0a…` (matches seed), `bundled/config.json` `1f6b2115…` (matches `verify-contract-sync-gate`), `drills/d-herd.drill.json` `8d210fe9…`. Lane: `DrillKeeperSmoke2`.
Relied on: `r2-errata` (wins), `charter-phase0-runner`, `shadow-executors` (its d-herd trace is **overridden** by errata row 1), `verify-contract-sync-gate`, `drills-cli` (its summary-removal and build-trigger wording is overridden by errata row 23).

## Observed (reads and read-only stats)
- No `ufo` on PATH (`command -v ufo` is empty). The substrate has no `target/` dir, so there is no `target/debug/ufo`. `CARGO_TARGET_DIR` is unset.
- `.ufo/membrane-seal.json` is absent. `.ufo/` holds only `cache/`, `scopes/`, `sighting/`, and the statusline files.
- `.devin/` and `packages/devin/.devin/skills/ufo/SKILL.md` are absent. `git ls-files .devin packages/devin/.devin` returns 0.

## Refusal order in `charter_sign` (`crates/ufo-cli/src/main.rs:989-1109`)
1. stdin or stdout is not a TTY: exit 2, `non_interactive` (`:990-996`).
2. The run id is not `[A-Za-z0-9_-]{1,64}`: exit 2, `invalid` (`:999-1006`).
3. Seal read: NotFound gives exit 2, `no_seal`, "no membrane seal at … is not sealed — nothing to sign" (`:1009-1021`). Other read errors give `seal_unreadable`. A decode or kind error gives `seal_unreadable` (`:1036-1056`). A run-id mismatch gives `seal_mismatch` (`:1057-1066`).
4. Only after these checks does `charter_phase0` run (`:1067`).

## Prediction A: literally "right now"
- The substrate has no seal, so a built debug or release `ufo` run from the substrate root on a TTY exits **2, kind `no_seal`** at `:1015-1020`. **Phase 0 never runs and the drills stage is never reached.** No `.ufo/charter/<runId>.json` is written.
- As a bare shell command, `ufo` does not resolve on this host, so it fails before the binary even starts [INFERENCE: the shell's command-not-found exit, 127].

## Prediction B: a seal naming `<runId>` exists (the real question)
- `charter_phase0_with_fixture` evaluates all three stages eagerly, with no short-circuit (`:956-974`). `UFO_TEST_CHARTER_PHASE0` is assumed unset.
- **contracts:** `node scripts/sync-ufo-contracts.mjs --check` (`:621-628`, `:971`) runs on the same tree that `verify-contract-sync-gate` copied, where it was observed exit 1 with `ok:false`. The stage record is `ok:false, exit:1` [INFERENCE: tree unchanged per hashes; the routes check also depends on the host global OMP config].
- **build:** `cargo build -p ufo-core-runtime -p ufo-cli` (`:957-964`, no `--locked`) is expected to pass and to leave `target/debug/ufo` [INFERENCE: not built].
- **drills:** `node <root>/scripts/ufo-drills.mjs` runs with no flags, cwd = root, inherited env, and a 900 s timeout (`:965-972`, `:843`, `:864`). The binary already exists after the build stage, so `!isExecutable(ufoBin)` is false and the harness skips its own `--locked` build (`ufo-drills.mjs:1583-1590`).
  - d-herd fails, as do the other self-iter drills (see `verify-contract-sync-gate`), so `failed` is true and `process.exitCode = 1` (`:1715`).
  - `charter_stage` records `{stage:"drills", ok:false, exit:1, stderr_tail}` (`:883-888`; ok = `status.success()`).
  - If the suite exceeds 900 s, the record is instead `{ok:false, error}` (`:890-894`).
- **Sign outcome:**
  - `passed=false` and `membrane_signoff:false`.
  - The artifact `.ufo/charter/<runId>.json` is written before the failure exit (`:1079-1084`).
  - The process exits **1** with kind **`phase0_failed`**. The message names the first failing stage, `"contracts"`, not `"drills"` (`:1086-1095`).
  - The seal stays.
  - `after_help` (`:15`) still files `phase0_failed` under exit 2, which disagrees with the code; this was already noted in `charter-phase0-runner`.
- **Side effects on the substrate tree** [INFERENCE from code]:
  - `target/`
  - `.ufo/drills/**` and `summary.json`
  - `.ufo/charter/<runId>.json`
  - `.ufo/cache/node-compile` (from `scripts/ufo-sighting:24`)

## d-herd verdict: FAIL
- Drill: `drills/d-herd.drill.json`.
  - Executor `self-iter`, wired, I3.
  - `setup.write config/orchestration.json`.
  - Scenario `fail:usage_limit:*:all`.
  - Run with `--rounds 1 --concurrency 2`.
  - `expect {exit:1, stderrContains:["domain-cooldown"]}`.
  - Retains `.ufo/contract-sync/r00.json`.
- Path to the failure:
  - In the shadow, `self_iter` calls `write_contract_sync_record` first (`main.rs:444`).
  - `mirrors_ready = status.success() && report.ok` (`:678-679`) is false, so every surface has `contractReady:false` and `allContractsReady:false` (`:700-702`, `:721`).
  - `r00.json` and `manifest.json` are written (`:727-738`).
  - `block_self_iter(&root, blocked, 2)` then runs (`:448-458`). It writes `.ufo/rs-self-iter-blocked.json` and prints the envelope `{"error":"BLOCKED: phase-0 UFO-FSD contract gate failed", …, contractSync}` to **stderr**, then calls `exit(2)` (`:536-548`).
  - The loop is never entered: no orchestration.json load and no herd.
- Assertions:
  - **`exit`: observed 2 ≠ expected 1. FAIL.**
  - **`stderrContains "domain-cooldown"`: FAIL** [INFERENCE]. The envelope embeds the whole `--check` report. The kept scratch report (`…/DrillKeeperSmoke/check.stdout.json`) contains 0 matches for `domain-cooldown`. The guidance themes are `phase0_lkg_gate`, `same_essence_substrate_shape`, and `reroute_not_respawn` (`operator_guidance.rs:7-11`).
  - `childExit` does not fire, because exit ≠ -1 (`ufo-drills.mjs:1171-1183`).
  - The retained `r00.json` exists.
- The seeded `shadow-executors` trace ("herd trips → exit 1, expect matches") is wrong. `r2-errata` row 1 overrides it, and this entry agrees with the correction.

## Confidence
- High: the refusal order, the eager Phase 0, the exit-1 `phase0_failed` mapping, and the d-herd exit-2 block. Each comes from source lines read here.
- Medium: the per-stage `ok` values and the drills `exit:1`. These rely on the earlier scratch `--check` observation and on the build succeeding.

## Unknowns
- Whether `cargo build` succeeds (not run). If it fails and leaves no binary, the harness tries its own `--locked` build. A failure there gives harness exit 2 (`drills-cli`), so the drills stage is still `ok:false`.
- `provenance.assert_honest()` (`main.rs:442`) runs before the gate and was not traced. If it fails, the self-iter exit code changes, but d-herd still fails.
- The `routesEquivalence` result depends on the host's global OMP config.
