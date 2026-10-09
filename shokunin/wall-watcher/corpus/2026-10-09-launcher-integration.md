# 2026-10-09 — the tower launcher's wall integration (`wallCli`, `launchResult`, `close`)

**Asked:** document how the tower launcher (`sighting/tower-fleet.mjs`) calls the wall and reads it back —
the `wallCli` call contract, the `launchResult` record, the typed-code map, and what `close --apply` does.

**Sources (exact; `L` = `<repo>/sighting/tower-fleet.mjs`, `T` = `<repo>/test/tower-fleet.test.mjs`,
`S` = `/home/vgpnk/Projects/ufo-fsd-alpha/scripts/ufo-sighting`)**

- `L:507-521` — `run` / `wallCli`; `L:485-505, 613, 852` — the launch argv build + spawn.
- `L:536-542, 966-1006` — `readWall` (`status --lite`) + `wallRegistry`; `L:548-563` — `wallRowLive`.
- `L:706-717, 1151-1229` — `open` + `verbClose`; `L:855-889` — the launch result handling.
- `L:88-90, 109-115, 624-634, 621-626, 771-793, 907, 926-931, 945-947, 1297-1305` — exit codes, typed envelope,
  failure recording, `fleet.json` write, `--json` emit, the top-level catch.
- `S:95` — the shim fall-through; `ufo/config/ufo.json` — band authority.
- Tests: `T:1569-1571, 1600-1624, 1569, 1047-1095, 919-920, 348, 449-452, 874-878`.

**Observed**

- `wallCli(spec, ...subArgs)` = `spawnSync("bash", [<spec.ufoRoot>/scripts/ufo-sighting, ...subArgs],
  {encoding:"utf8"})` — no `options` object, so **no env/cwd override**: the child inherits the operator's
  environment (including `UFO_SIGHTING_TMUX_SOCKET`) verbatim. The path comes from the spec's `ufoRoot`, so
  a stub substrate is legal; `bash <path>` needs no exec bit. Verbs used: `open` (no flags, exit status only),
  `status --lite` (stdout parsed as JSON), `launch …` (stdout parsed as JSON), `complete --mission <id>
  --note "tower-fleet close"`. No `--json` flag is ever passed to the wall (the launcher's own `--json` is a
  different surface).
- Launch argv: `launch --run-id <id> --session-id <id> --title <t> --fleet <fleet> --cwd <worktree>
  --no-open --relay --runner-reservation 1 -- <omp argv>`; the plan-time array is pinned token-by-token in
  the test, but **no test reaches the wall-launch step** (every test `launch` is a refusal), so the spawn
  shape is unpinned at runtime.
- `launchResult` is **not** an `{ok,code,message}` envelope: it is the wall's post-launch **status view**
  (the wall `launch --no-open` returns `getStatus`, which has no `ok`/`code`/`message`). The record keeps the
  whole snapshot in `fleet.json`, while the launcher reads exactly one field, `missions[].paneId` matched by
  `runId`/`missionId`. The `--json` summary strips `launchResult` down to a boolean `launchResultRecorded`.
- A null `paneId` records **no failure**, only a warning (`launched <id> · pane ?`, exit 0, `fleet.json.ok:
  true`). And a `launchResult` may be **adopted from a prior run's state** (`launchResultFrom:
  "prior-state"`) — so `launchResult != null` must never be read as "launched successfully this run".
- `launchResult` has **no reader and no test** anywhere (grep over both repos): document its persistence as
  observational.
- Typed-code map (all via one top-level catch → `{ok:false,code,message}` on **stderr**, `process.exit(2)`;
  usage errors → `{ok:false,code:"USAGE",…}` + usage line, exit **64**):
  scheme-wide (`loadSpec`, all four verbs) `L1_CEILING_EXCEEDED` (precedes `PANE_CEILING_EXCEEDED`),
  `PANE_CEILING_EXCEEDED`, `SCOPE_OVERLAP`, `INVALID_SPEC`; authority-wide (before `loadSpec`, all verbs)
  `CONFIG_UNREADABLE`; `MUTATION_REQUIRES_APPLY` (launch/close, before the spec is read);
  `INTERACTIVE_GUARD` (`plan`/`launch`, before any wall call); `UNKNOWN_MISSION` (`close`, before the
  registry read); thrown-before-loop `WALL_OPEN_FAILED`, `STATE_DIR_UNAVAILABLE`, `COMMAND_MISSING`,
  `WALL_STATUS_FAILED`, `WALL_ABSENT`, `PANE_LIVE` (without `--force`), `RENDER_UNRESOLVED`;
  per-mission **recorded** (loop continues, run ends `LAUNCH_PARTIAL` exit 2) `WORKTREE_ADD_FAILED`,
  `RUN_ID_RESERVED`, `LAUNCH_FAILED` (every non-zero wall `launch` — the wall's own code survives only in
  the detail text), `WALL_OUTPUT`, `MISSION_FAILED`; `COMPLETE_FAILED` (`close`, recorded per row, terminal
  exit 2 after the loop); `USAGE` (64), `UNEXPECTED_ERROR` (2).
- `WORKTREE_ADD_FAILED` does **not** abort the run: it is recorded and the loop continues, `fleet.json` is
  still written, and the run ends `LAUNCH_PARTIAL` (the tower skill prose claims an outright abort —
  refuted). Likewise a failing wall `complete` does not abort `close`; it exits 2 only after every target
  was attempted.
- `close --apply` prints, per result row, `completed wall mission <id>[ (pane left running: --force)]`,
  `skipped <id> — not in the wall's registry`, or `FAILED <id> — exit <status>: <detail>`, then for **every**
  row a launcher-derived `git -C <repo> worktree remove <path>` line (path = `worktreeRoot/<mission.id>`,
  never git-verified) with the "never `omp worktree clear`" warning. `--json` prints no command at all
  (`worktreeRemoval: "manual-only"`). `close` **never** removes a worktree or branch, never writes state,
  never kills a pane (`--force` completes live rows and warns their panes keep running), and never frees the
  wall run id (a re-launch of the same id lands on `RUN_ID_RESERVED`).
- `--json` + a partial failure prints a full summary on **stdout** *before* the stderr `LAUNCH_PARTIAL`
  envelope — so "typed error ⇒ empty stdout" is false for `LAUNCH_PARTIAL`/`COMPLETE_FAILED`.
- Registry reads: `status --lite` → `wallRegistry` consumes `missions[]`, `levels.l1` (numeric > 0 = live; a
  **missing** `levels.l1` counts as LIVE, a deliberate fail-safe), `completed[]`+`completedMissionCount`,
  `stopped[]`+`stoppedMissionCount`, `staleMissionCount`, `status` (`"absent"` is load-bearing), `hatch`,
  and per-row `fleet`/`runId`/`missionId`/`paneId`/`phase`. `open` runs once per `launch` before any wall
  read; `status` and `close` never `open`.

**Changed:** nothing.

**Unknown:** whether any tooling outside these two repos reads `<stateDir>/fleet.json.launchResult`; the
byte-identity of the `launch --no-open` receipt and `status --lite` (both go through `getStatus`).