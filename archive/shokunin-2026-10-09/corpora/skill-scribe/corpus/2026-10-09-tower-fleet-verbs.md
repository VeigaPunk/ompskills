# tower-fleet operator surface (`sighting/tower-fleet.mjs`)

**Asked:** extract the exact operator surface of the tower fleet launcher.
**Source:** `sighting/tower-fleet.mjs` (1306 lines, worktree-relative). Lines are that file's.

## Observed

- Verbs `VERBS = new Set(["plan","launch","status","close"])` (L96); **default is `plan`**
  (`let verb = "plan"` L1236; `argv[0]` is consumed as a verb only when non-empty and not
  starting with `-`, L1237). Flags: `--spec` (required), `--apply`, `--json`, `--mission`
  (close only), `--force` (close only), `--help`.
- Spec defaults (`loadSpec` L323-401): `base` -> repo HEAD branch (`gitHeadBranch` L387);
  `stateDir` -> `.tower/fleets/<fleet>` (L393); `worktreeRoot` -> `.tower/worktrees/<fleet>`
  (L394); `roundCeiling` -> `1` (L388); `maxTime` -> `"3h"` (L390). Required: `fleet`
  (`^[a-z0-9][a-z0-9_-]{0,47}$` L92), `repo`, `ufoRoot`, non-empty `missions[]` with
  `id` (`^[A-Za-z][A-Za-z0-9_-]{0,63}$` L93, unique), `title`, `axis`, `goal`, `scope[]`
  (repo-relative prefixes), optional `skills[]` (default `[]`).
- Typed refusals (thrown `TypedError`, `{ok:false,code,message}` on stderr, exit 2):
  `CONFIG_UNREADABLE`, `INVALID_SPEC`, `L1_CEILING_EXCEEDED` (L338), `PANE_CEILING_EXCEEDED`
  (L341), `SCOPE_OVERLAP` (L380), `RENDER_UNRESOLVED`, `INTERACTIVE_GUARD`, `COMMAND_MISSING`,
  `WALL_OUTPUT`, `WALL_STATUS_FAILED`, `WALL_OPEN_FAILED`, `STATE_DIR_UNAVAILABLE`,
  `MUTATION_REQUIRES_APPLY` (L1267), `LAUNCH_PARTIAL` (L946), `UNKNOWN_MISSION`, `WALL_ABSENT`,
  `PANE_LIVE`, `COMPLETE_FAILED` (L1227), `UNEXPECTED_ERROR`.
- Inline per-mission failure codes (recorded, not thrown): `RUN_ID_RESERVED`, `WORKTREE_ADD_FAILED`,
  `LAUNCH_FAILED`, `WALL_OUTPUT`, `MISSION_FAILED`, `COMPLETE_FAILED`.
- Exit codes: 0 ok, 2 typed, 64 usage (L88-90).
- Every shell-out uses an explicit argv array (`run` L506-512); `wallCli` wraps
  `bash <ufoRoot>/scripts/ufo-sighting <subArgs>`. `plan` is pure (`writes:false`, L654-681);
  `close` never removes a worktree and prints `git -C <repo> worktree remove <path>` per
  mission (L1214-1225).

## Remaining unknown

The wall CLI's own refusal vocabulary (`scripts/ufo-sighting`) is out of this file.
