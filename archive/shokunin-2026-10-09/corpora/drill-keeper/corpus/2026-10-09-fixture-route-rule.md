# fixture-route-rule — "fixture routes only, never live providers"

Asked: where the rule is stated, and where it is (and is not) enforced.
Anchor: `ufo-fsd-alpha@5ace2559` (read-only); `config/ufo.json` cited from the working copy (sha256 `0e416f0a…`, uncommitted swarm-band edit only). Lane: `FixtureRouteRule` (sentinel).

## Stated
`config/ufo.json` drills.note; `scripts/ufo-drills.mjs:4-5` ("no OMP, no OAuth, no network (I10)"); Spec 09 `:15,:29-32`; `00-work-order.md:137`; `drills/fixtures/loop_specialist.py:6-7`; `AGENTS.md:81-83`.

## Enforced in code
- The fixture child is `env_clear`ed with an allowlist (`fixture_spawn.rs:299-329`). The fixture imports only `json os signal sys time` and refuses any non-primary route (exit 3).
- `RulesAudit::require_local_route` (`rules.rs:171-182`) refuses unknown routes, but **admits `hvm/qwen-hvm`** (`live.rs:29`), the default distiller route (`lane_overlay.rs:38-41`). "Fixture routes only" is not what the allowlist enforces.
- The live gate is env-only: `LiveEnv::enabled()` reads `UFO_LIVE`/`UFO_LIVE_DISPATCH` (`test_env.rs:83-90`). `run_epoch_from` installs the dry guard only when those flags are unset (`loop_driver_resume.rs:533-539`).
- Drill executors force `UFO_LIVE=0`/`UFO_LIVE_DISPATCH=0` **only** for self-iter and judge-handoff (`ufo-drills.mjs:495,656-657`).

## Gaps (severity × reachability today)
1. MEDIUM: cargo-test, node-test, sync-check, shell, and the charter Phase 0 spawn inherit ambient `UFO_LIVE`, `OMP_BIN`, and API keys. In-process cargo tests build default-lane drivers whose distiller is `hvm/qwen-hvm` and skip the dry guard when `UFO_LIVE=1`.
2. HIGH-latent: `runShell` runs any argv (no argv[0] allowlist); the shadow is a cwd, not a sandbox. Only `d-wall` (`bash scripts/gates.sh --wall-probe-only`) uses it today.
3. MEDIUM: node-test drills over `tests/run-omp-native-trial.test.js` reach `omp --version` on the host via `hostAttestation` (`run-omp-native-trial.mjs:3833,2608`).
4. MEDIUM-latent: `setup.env` is spread after `UFO_LOOP_SPECIALIST_FIXTURE` (`ufo-drills.mjs:649-655`), so a drill can swap the fixture for any file.
5. MEDIUM: I10 is untested (`d-i10-no-remote` pending; `d-wall` is a tmux probe). No static no-network scan exists.
6. LOW-MED: the fixture child gets `HOME` (credential files readable); drill `spawnSync` has no `killSignal`/process group (descendants survive a timeout); retained stdout/stderr are not credential-screened.
7. Drift: `substrates[].route/protocol` in config/ufo.json has no Rust reader; `--substrate` only relabels. The fixture hardcodes `"substrate": "omp"`.

## Stronger contrasts in-tree
`fleet-selfheal-verify.mjs:480-500` (pinned env), `local_ship.rs:2248-2255` (`env_clear` + DENIED binaries), `axis_checks.rs:203-212`, `live.rs:330-360`.
