# shadow-executors — `self-iter` and `sync-check`

Asked: what a shadow contains and where it lives, how setup applies, the exact argv/env/timeouts, and one trace (`d-herd`).
Anchor: `ufo-fsd-alpha@5ace2559` (read-only); `config/ufo.json` cited from the working copy (sha256 `0e416f0a…`, uncommitted swarm-band edit only). Lane: `ShadowExecutors`.

## Observed
- Shadow = `mkdtemp(join(UFO_DRILL_TMP || os.tmpdir(), "ufo-drill-"))` (`scripts/ufo-drills.mjs:578-585`) — **not** under `.ufo/drills`. A relative `UFO_DRILL_TMP` resolves against the repo root.
- `SHADOW_PATHS` (`:68-84`): scripts, config, skills, ssot, agents, packages, .omp, .cursor, .devin, docs/ufo-fsd-charterlist.json, crates/ufo-core-runtime/bundled, ufo-deps.lock, godspeed-core, substrates, .ufo/pending-work.json — `cpSync` recursive, missing entries skipped, `verbatimSymlinks:false`. `drills/` and `fixtures/` are **not** copied.
- Order (`buildShadow` `:508-576`): copy → `setup.write` (may create; json → 2-space + newline) → `setup.mutate` (target must exist; append / delete / jsonSet with prototype keys refused). Partial shadow removed on throw; full shadow removed after the drill (`:1670-1673`).
- self-iter argv (`:642-648`): `<ufoBin> self-iter <run.task ?? "drill fixture run"> --rounds <run.rounds ?? 2> --concurrency <run.concurrency ?? 2> --substrate <run.substrate ?? omp>`; cwd = shadow (project root = cwd, `main.rs:440`); timeout `run.timeoutSecs ?? 120`; env `{...process.env, UFO_LOOP_SPECIALIST_FIXTURE: <real repo>/drills/fixtures/loop_specialist.py, [UFO_DRILL_SCENARIO], ...setup.env, UFO_LIVE:"0", UFO_LIVE_DISPATCH:"0"}` — the live force-off lands last. Report from `<shadow>/.ufo/rs-self-iter-report.json` (+ `loop-state.json`).
- `ufoBin` = `<CARGO_TARGET_DIR | root/target>/debug/ufo`; built with `cargo build -p ufo-cli --locked` on first need.
- sync-check argv (`:696-698`): `node <shadow>/scripts/sync-ufo-contracts.mjs --check` (or `--review` when `run.review`; only `d-closure-review`); timeout 60 s; **no** `UFO_LIVE` force-off. stdout JSON parsed, else `{ok:false, parseError:true}`.

## d-herd trace
`setup.write config/orchestration.json` (max_rounds 1, concurrency 4, four subjective axes, `recovery.backpressure.herdThreshold 2`) + scenario `fail:usage_limit:*:all` → `ufo self-iter … --rounds 1 --concurrency 2` → contract-sync gate (`main.rs:621-628`, writes `.ufo/contract-sync/r00.json`; not-ready → exit 2) → `LoopDriver::open` loads the shadow's orchestration.json → every lane fails `usage_limit` on domain `local` → herd trips → held-back lanes carry `domain-cooldown:local` → `bail!("all specialist lanes failed: …")` (`loop_driver_dispatch.rs:1468-1469`) → exit 1. Expect `{exit:1, stderrContains:["domain-cooldown"]}` matches; retain copies `r00.json`.

## Risk [INFERENCE until run]
Every self-iter drill first passes the contract-sync gate. `sync-ufo-contracts.mjs` copies `config/ufo.json` onto `crates/ufo-core-runtime/bundled/config.json` (`:1922-1925`) and counts a differing dest as drifted; today they differ (4 lines, working copy). It also lists `.devin/skills/ufo` targets that are absent. Either would make the gate exit 2 and red every self-iter drill whose expect is exit 1 or 0. Confirm with a scratch-copy `--check` before trusting a self-iter verdict.
