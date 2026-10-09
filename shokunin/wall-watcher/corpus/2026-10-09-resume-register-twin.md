# 2026-10-09 — `resume`, `register`, `twin`

**Asked:** document the `resume`, `register`, and `twin` verbs (in the CLI but absent from the mission
goal's verb list) — flags, mutations, refusals, and the `twinMaxDepth` bound.

**Sources (exact; `ufo` = `/home/vgpnk/Projects/ufo-fsd-alpha`)**

- `ufo/scripts/ufo-sighting.mjs:4627-4646` — `resume`; `:3689-3745` — `resumeMission` / `resumeMissionLocked`.
- `ufo/scripts/ufo-sighting.mjs:4586-4602` — `register`; `:4036-4095` — `registerCurrentPane`.
- `ufo/scripts/ufo-sighting.mjs:4604-4614` — `twin`; `:3960-4019` — `twinMission`.
- `ufo/scripts/ufo-sighting.mjs:4019` — `createMissionPane` (twin); `:3745` — `spawnPaneForMission` (resume).
- `ufo/scripts/ufo-sighting-lib/surface.mjs:181-202, 204-232` — `resume` in `verbs` with a `states` map;
  `register`/`twin` in `extras` with **no** `states` map.
- `ufo/config/ufo.json:70` — `twinMaxDepth: 1`.
- Probes: `resume --help`, `register --help`, `twin --help` (all exit 0); read-only tmux/env inspection.

**Observed**

- `resume --mission ID [--run-id ID] [--session-id ID] [--substrate S] [--cwd P] [--geometry WxH]
  [--no-open|--auto-open|--no-auto-open] -- COMMAND [ARGS...]`. Requires `--mission` **and** a child argv.
  Only a row at status exactly `stopped` resumes (`RESUME_UNSUPPORTED` otherwise); the declared states map
  is `stopped → resume+spawn`, `live → RESUME_LIVE`, `completed → RESUME_COMPLETED`, `absent →
  MISSION_NOT_FOUND`, `identity_mismatch → IDENTITY_MISMATCH`. It re-spawns a pane via
  `spawnPaneForMission` (splitting a new pane when no adoptable one exists).
- `register --run-id ID --session-id ID [--pane-id %N] [--title T] [--substrate S] [--cwd P]
  [--runner-reservation N] [--geometry WxH] [--relay] -- COMMAND [ARGS...]`. Requires a live wall session
  (`WALL_ABSENT` "open the sighting wall before registering a pane"); it **adopts** an existing pane and
  never spawns one. It has **no** `--fleet` flag and always binds the default window (`fleet: null`).
  `--pane-id` is accepted by the allowlist and documented but is not read in the branch body.
  Duplicate identity → `REGISTRATION_CONFLICT`; an exact live triple re-register is an idempotent echo.
- `twin --origin RUN_OR_MISSION [--run-id ID] [--session-id ID] [--title T] [--runner-reservation N]
  [--geometry WxH] [--no-open]`; no child argv. `--origin` falls back to the calling pane's
  `UFO_SIGHTING_MISSION_ID` / `UFO_SIGHTING_RUN_ID`. It creates a fresh mission+pane
  (`createMissionPane`), linked by `twinMissionId`; `TWIN_EXISTS` when the origin already has a twin,
  `TWIN_RECURSION` when the candidate's `twinDepth !== 0`.
- `twinMaxDepth` bound: declared in `config/ufo.json` (`1`), projected but **never consumed**
  (`base.mjs:180-199` fails boot if the config disagrees with the hardcoded `SESSION_NAME`/`WINDOW_INDEX`,
  but `twinMaxDepth` is not consumed at all — it is validated, then ignored); the bound is enforced in
  code as `twinDepth !== 0` at `:3973` plus the one-twin link at `:3981`. So the effective twin depth is
  **1**, but from code, not from the config key.
- Surface gap: `register` and `twin` sit in `surface.extras` with `flags`/`trailingArgv` only and **no**
  `states` map — the machine-readable surface declares zero typed refusals for either verb. Their refusal
  codes are code-only.
- Usage lines understate accepted flags for all three (`--substrate`, `--cwd`, `--geometry`, `--title`,
  `--runner-reservation`); take the contract from the parser allowlists.
- Pane-creation correction: `launch` is not the only pane-creating verb — `twin` and `resume` also spawn;
  `register` only adopts.

**Changed:** nothing.

**Unknown:** whether `twin` re-applies the inquiry id formula to a remapped `sessionDir` (no code does);
whether `registerCurrentPane` consumes the passed-through `--pane-id`.