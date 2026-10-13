# 2026-10-09 — `launch` verb

**Asked:** document the `launch` verb — the only verb that creates a new mission + pane from flags
alone: required vs optional flags, the `--` child-argv rule, the fleet-window rule, side effects.

**Sources (exact; `ufo` = `/home/vgpnk/Projects/ufo-fsd-alpha`)**

- `ufo/scripts/ufo-sighting.mjs:4555-4583` — the `launch` branch + allowlist; `:4564` child-argv check.
- `ufo/scripts/ufo-sighting.mjs:3839-3867` — `parseNamedOptions` (first `--` splits options from child argv).
- `ufo/scripts/ufo-sighting.mjs:2067-2104` — `newMission`; `:2212-2358` — `createMissionPane` /
  `ensureUniqueMission` / `launchMissionLocked`; `:2413-2425` — `launchMission` lock order.
- `ufo/scripts/ufo-sighting.mjs:2125-2200` — `assertRunnerCapacity` / `assertL1Capacity` / `assertCapacity`.
- `ufo/scripts/ufo-sighting.mjs:1129-1154, 921-930` — `ensureFleetWindow` / `findWindowByName`.
- `ufo/scripts/ufo-sighting.mjs:84-133, 2377-2417` — `--env-file` / `loadMissionEnvironment`, ephemeral contract.
- `ufo/scripts/ufo-sighting-lib/argv.mjs:455-508` — `preflightArgvDispatch`.
- `ufo/scripts/ufo-sighting-lib/base.mjs:33, 37, 276-281` — `RUN_ID_PATTERN`, `SESSION_ID_PATTERN`, `validateFleetName`.
- Probe: `launch --help` (exit 0); live `tmux list-windows -t ufo_sighting`.

**Observed**

- Required: `--run-id` and `--session-id` (both validated: `INVALID_RUN_ID`/`INVALID_SESSION_ID`, no
  registration/reservation on failure) and a non-empty child argv after `--`. Everything else optional:
  `--title` (defaults to the run-id, then `sanitizeTitle`), `--substrate` (default `omp`), `--cwd`
  (default cwd; realpath'd), `--env-file`, `--runner-reservation` (default 1), `--fleet`, `--geometry`,
  `--relay`, `--no-open`, `--auto-open`/`--no-auto-open`. Any unlisted flag → `INVALID_ARGUMENT`.
- `--` rule: exactly one boundary; everything after the first `--` (a second `--`, an inner `--help`,
  `-h`) belongs to the child and is never re-interpreted. `--flag=value` works for value flags; a
  boolean with `=value` fails; duplicates fail; verb help only when `--help`/`-h` is the first token
  after the verb.
- Fleet: no `--fleet` → the mission lands in the default window `ufo_sighting:1` (name `fleet`); with
  `--fleet NAME` → a dedicated window named exactly `NAME` at `ufo_sighting:=NAME`, created detached on
  the first launch of that fleet (`-n <fleet>`, idle keeper `__idle`), with rename off and
  `remain-on-exit on`. Name must match `^[a-z0-9][a-z0-9_-]{0,47}$`; a name colliding with window 1, or
  a duplicate window name, is refused. Live: window `1 fleet` + window `2 shokunin` (8 panes).
- Order (under one `withOperationLock`): lock → `loadManifest({create:true})` → `WALL_NOT_OPEN` guard →
  `ensureOwnedSession` → `reconcileLocked` → `launchMissionLocked`: `assertL1Capacity`
  (`L1_CEILING_EXCEEDED`, `maxConcurrentL1`) → `assertCapacity` (`CAP_EXCEEDED`, per window) →
  `assertRunnerCapacity` (`RUNNER_CEILING_EXCEEDED`, `globalRunnerCeiling`) → `newMission` →
  `ensureUniqueMission` (`RUN_ID_CONFLICT`, `SESSION_ID_CONFLICT` — reserved by **any** existing row,
  including completed history) → `createMissionPane`.
- `--substrate`/`--cwd` are preflight inputs, not free-form manifest fields: `preflightArgvDispatch`
  rejects indirect dispatch (`INDIRECT_OMP_DISPATCH`/`INDIRECT_OPENCODE_DISPATCH`), enforces
  executable/substrate coupling (`OMP_SUBSTRATE_MISMATCH`), realpaths cwd (`INVALID_CWD`), and rewrites
  an omp argv to an attested session — the recorded row comes from the checked values.
- `--env-file` is not a plain env override: it switches launch to the ephemeral-L1 contract (absolute
  canonical private file, exact keys `schema|ephemeralRoot|environment`, allowed path variables, a
  marker attesting `prepared` with no active pids, forced cwd, dispatch restrictions).
- Side effects: the pane is spawned and, unless `--no-open`, the wall is opened/focused; a hatch failure
  stops and removes the new row with the verbatim error code. `--no-open` still creates the pane.
- Correction to the goal's framing: `launch` is the only verb that mints a mission+pane from flags
  alone, but **not** the only pane-creating verb — `twin` creates a fresh pane (requires a live origin,
  one twin level), `resume` re-spawns a pane for a row at status `stopped`, and `register` adopts an
  existing pane. So "a mission row appeared ⇒ someone ran launch" is unsound.

**Changed:** nothing.

**Unknown:** nothing material for the launch contract.