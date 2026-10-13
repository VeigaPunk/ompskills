# 2026-10-09 — sighting/tower-fleet.mjs contract and its suite coverage

**Asked.** What is the launcher's contract (verbs, exit codes, typed shape,
safety contract, spec schema/defaults, per-mission outputs), and which parts
does the suite assert? (Lane `TowerFleetContract`, scout.)

**Observed.** Sources: `sighting/tower-fleet.mjs:2-69` (doc), `:88-114`
(codes/typed), `:96` (VERBS), `:130-165` (band authority), `:321-409`
(loadSpec), `:421-502` (renderPrompt/argv), `:597-614` (buildPlan),
`:1234-1306` (parseArgs/main/exit); `test/tower-fleet.test.mjs` (full, 1685
lines).

- Verbs: `plan` (default, writes nothing, exit 0); `launch` (requires
  `--apply`, exit 0 or 2 `LAUNCH_PARTIAL`); `status` (read-only wall reconcile,
  exit 0); `close` (requires `--apply`, exit 0 or 2 `COMPLETE_FAILED`); an
  unknown verb is `usageExit` 64.
- Exit codes 0 ok / 2 typed / 64 usage. Typed shape: `{ok:false,code,message}`
  as one JSON line on stderr; `TypedError` carries code + message only.
- Safety contract: never `omp worktree clear` (per-path manual removal only;
  `close` reports `worktreeRemoval: manual-only`); never writes `<ufoRoot>` —
  write roots are refused `INVALID_SPEC` when their realpath lands inside the
  substrate, the repo root, or the repo's `.git`; every shell-out is
  `spawnSync` with an argv array, no shell strings; the omp argv stays
  interactive (no `-p`/`--print`, no `--mode`) and `--cwd` equals the mission
  cwd; a failed mission is recorded, the run continues, `fleet.json` is written
  either way; relaunch is idempotent (adopts worktree/prompt/wall row across
  the full registry; a retired run id is `RUN_ID_RESERVED`); liveness is read
  only from the wall's live view (`status --lite`), never a retired row's
  phase; `status` reconciles both ways and writes nothing; `close` refuses
  `PANE_LIVE` unless `--force`, skips an absent mission, and exits 2 with
  `COMPLETE_FAILED` listing every outcome.
- Spec defaults: `fleet` required `^[a-z0-9][a-z0-9_-]{0,47}$`; `repo`
  required; `base` defaults to the repo HEAD branch (`git rev-parse
  --abbrev-ref HEAD`; detached/failed → `INVALID_SPEC`); `ufoRoot` required;
  `stateDir` defaults `<repo>/.tower/fleets/<fleet>`; `worktreeRoot` defaults
  `<repo>/.tower/worktrees/<fleet>`; `roundCeiling` defaults 1 (safe integer
  ≥ 1); `maxTime` defaults `"3h"` matching
  `/^[A-Za-z0-9][A-Za-z0-9._:+-]*$/` with no leading `-`.
- Per-mission outputs: worktree `worktreeRoot/<id>`; branch
  `tower/<fleet>/<id>`; prompt rendered from `l1-prompt.md` (18-key values map;
  17 distinct placeholders in the template) at `stateDir/<id>.prompt.md`;
  `ompArgv` = `omp --cwd <wt> --session-dir <stateDir>/sessions/<id> --max-time
  <maxTime> --model @<l1Alias> --config <ufoRoot>/config/mission-nightcall.yml
  --print-thoughts --auto-approve @<promptPath>`; `launchArgv` = `bash
  <ufoRoot>/scripts/ufo-sighting launch --run-id <id> --session-id <id>
  --title <t> --fleet <f> --cwd <wt> --no-open --relay --runner-reservation 1
  -- ++ ompArgv`.
- Asserted by the suite: default verb `plan`; exit 0/2/64 including exact typed
  messages; `plan` writes nothing (recursive snapshot); spec schema (fleet and
  mission patterns, ceilings, scope overlap/nesting/normalization, `maxTime`
  default + refusals, `roundCeiling` default + echo); per-mission
  worktree/branch/promptPath/ompArgv/launchArgv tokens; render fidelity + the
  placeholder ledger; guard precedes spec load and every wall call; wall
  isolation (stub sole spawn, no tmux, real CLI never spawned); derived
  write-target confinement (5 symlink plants); `close --apply --force` happy
  path vs stub and `UNKNOWN_MISSION`; `--help` exit 0.
- Not asserted by the suite: `base` default from repo HEAD (the suite always
  sets `base` explicitly; its temp repo is not a git checkout);
  `stateDir`/`worktreeRoot` default derivation; the `launch` happy path
  (spawn/worktree/skill/prompt/fleet.json writes); 13 codes with zero
  occurrences — `LAUNCH_PARTIAL`, `LAUNCH_FAILED`, `RUN_ID_RESERVED`,
  `STATE_DIR_UNAVAILABLE`, `WALL_OPEN_FAILED`, `WALL_OUTPUT`,
  `WALL_STATUS_FAILED`, `COMMAND_MISSING`, `RENDER_UNRESOLVED`,
  `INTERACTIVE_GUARD`, `COMPLETE_FAILED`, `PANE_LIVE`, `WALL_ABSENT`; `status`
  reconcile output details (`wallStatus`/`hatch`/`staleMissionCount`/retired
  merge); the close guard codes; and the "never `omp worktree clear`" claim
  (the isolation log only scans for the real CLI path and `tmux`).

**Changed.** Nothing — read-only research.

**Unknown.** [INFERENCE] only that section 36 is the sole close coverage; the
suite was read, not run.
