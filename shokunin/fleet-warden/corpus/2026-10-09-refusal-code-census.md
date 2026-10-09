# refusal-code-census — every typed refusal code, its trigger, and its verb(s)

Asked: from `sighting/tower-fleet.mjs`, list every typed refusal code `plan`/`launch`/`status`/`close`
can emit, with a one-line trigger and the emitting function/line.
Source: `sighting/tower-fleet.mjs` @ b251c5a. Lane: `RefusalCensus` (source read, no live runs — this
is an enumeration of literals, not a behavior probe; every line below was read in full).

Envelope: every code below exits 2 as `{ok:false,code,message}` on stderr (top-level catch :1299-1306),
except `USAGE` which exits 64 (:110, `usageExit`). `UNEXPECTED_ERROR` (:1304) is the catch-all for any
non-`TypedError` throw — not a `typed()` literal but part of the refusal vocabulary. Total: 24 exit-2
literals + `USAGE` = 25, matching the bounds' "~25 code literals".

## Shared gates — all four verbs

Reached via `main` (:1271-1288) → `parseArgs` → `loadBandAuthority` → `loadSpec`, before any verb body:

| code | trigger (one line) | site |
| --- | --- | --- |
| `INVALID_SPEC` | spec unreadable / non-object / bad `fleet` / missing `repo` / missing `ufoRoot` / no `missions` | main :1281, :1284; loadSpec :324, :326, :328, :330, :331, :336 |
| `INVALID_SPEC` | mission not object / bad `id` / duplicate id / empty `title`/`axis`/`goal` / empty `scope` array | loadSpec :347, :349, :350, :354, :358 |
| `INVALID_SPEC` | bad skill name / `skills` not array | loadSpec :366, :370 |
| `INVALID_SPEC` | scope entry non-string/blank, empty-after-strip, dot segment/repo root, absolute/`~`, `..`/empty segment | normalizeScopePath :176, :178, :180, :183, :187 |
| `INVALID_SPEC` | `roundCeiling` not positive int / `maxTime` unsafe token | loadSpec :389, :391 |
| `INVALID_SPEC` | `stateDir`/`worktreeRoot` non-string; HEAD unresolvable for `base` default (non-git / detached) | resolveRepoPath :170; gitHeadBranch :314 |
| `INVALID_SPEC` | write root dangling symlink / inside ufoRoot / equals repo root / inside `.git` | assertSafeWriteRoot :240, :244, :247, :250 |
| `CONFIG_UNREADABLE` | config unreadable; missing key; non-positive-int band; `waveMinLanes > waveMaxLanes`; unsafe `l1Alias` | loadBandAuthority :136, :142, :146, :159, :162 |
| `L1_CEILING_EXCEEDED` | `missions.length > sighting.dispatch.maxConcurrentL1` (checked first) | loadSpec :338 |
| `PANE_CEILING_EXCEEDED` | `missions.length > sighting.windowPaneCeiling` | loadSpec :341 |
| `SCOPE_OVERLAP` | any pairwise scope prefix overlap (incl. nesting) across missions | loadSpec :380 |
| `COMMAND_MISSING` | spawnSync ENOENT (e.g. `git` absent during the `base`-default probe) | run :510 |
| `UNEXPECTED_ERROR` | any non-`TypedError` throw escaping to the top level | catch :1304 |

## plan — adds two verb-body codes

`buildPlan` (:597) runs `renderPrompt` + `buildOmpArgv` per mission; plan never touches the wall:

| code | trigger | site |
| --- | --- | --- |
| `RENDER_UNRESOLVED` | `l1-prompt.md` carries an unknown `{{placeholder}}`, or one survives rendering | renderPrompt :443, :447 |
| `INTERACTIVE_GUARD` | omp argv contains `-p`/`--print`/`--mode`, or `--cwd ≠ worktree` | interactiveGuard :460, :463; buildOmpArgv :483 |

Both are tautological guards: the argv and the template are launcher-internal, so these fire only on a
launcher bug, never on spec content (see argv-integrity / interactive-guard entries).

## launch — the widest surface

Shared gates + plan's two, then (all in `verbLaunch`, :706):

| code | trigger | site |
| --- | --- | --- |
| `WALL_OPEN_FAILED` | `ufo-sighting open` exits non-zero | :716 |
| `WALL_STATUS_FAILED` | `status --lite` exits non-zero (`wallRegistry` → `readWall`) | readWall :539 |
| `WALL_OUTPUT` | `status --lite` stdout not JSON | parseJsonOutput :527 |
| `STATE_DIR_UNAVAILABLE` | `mkdirSync(stateDir)` throws (e.g. symlinked stateDir root escaping the load gate) | :730 |
| `RUN_ID_RESERVED` | adopted wall row is retired; its run id still reserved — recorded per-mission | :789 |
| `WORKTREE_ADD_FAILED` | `omp worktree add` exits non-zero — recorded per-mission | :815 |
| `LAUNCH_FAILED` | wall `launch` exits non-zero (detail carries the wall's own code, e.g. `RUN_ID_CONFLICT`) | :868 |
| `WALL_OUTPUT` | wall `launch` exits 0 with unparseable stdout — recorded per-mission | :876 |
| `MISSION_FAILED` | non-`TypedError` throw inside the per-mission try (a `TypedError` is re-recorded under its own code, e.g. in-loop `INVALID_SPEC` from `assertSafeWriteTarget`) | catch :896 |
| `LAUNCH_PARTIAL` | run-level: `failures.length > 0` after the loop | :946 |

Per-mission codes (RUN_ID_RESERVED, WORKTREE_ADD_FAILED, LAUNCH_FAILED, WALL_OUTPUT, MISSION_FAILED,
re-recorded TypedErrors) never reach the stderr envelope as the top-level code — they land in
`fleet.json` `missions[].failure.code` and in the `LAUNCH_PARTIAL` summary; the envelope is always
`LAUNCH_PARTIAL`. An fs error at the unguarded `fleet.json` write (:907) escapes as `UNEXPECTED_ERROR`
instead (launch-partial-policy critic (a)).

## status — no codes of its own

`verbStatus` (:1006) contains zero `typed()` calls: shared gates only, plus `WALL_STATUS_FAILED` /
`WALL_OUTPUT` through `wallRegistry` (:967 ← :1007) and `COMMAND_MISSING` / `UNEXPECTED_ERROR`.

## close — its own four, plus wall-read codes

Shared gates + wall-read codes (`WALL_STATUS_FAILED`/`WALL_OUTPUT` via `wallRegistry` :967 ← :1160),
then (all in `verbClose`, :1151):

| code | trigger | site |
| --- | --- | --- |
| `UNKNOWN_MISSION` | `--mission <id>` not in the spec (empty `--mission ''` widens to the fleet and never fires) | :1155 |
| `WALL_ABSENT` | wall reports `status "absent"` — refused before any completion | :1167 |
| `PANE_LIVE` | any target live on the wall without `--force` | :1170 |
| `COMPLETE_FAILED` | wall `complete` exits non-zero — recorded per-mission (:1203), then re-thrown run-level | :1227 |

## launch/close only

| code | trigger | site |
| --- | --- | --- |
| `MUTATION_REQUIRES_APPLY` | `launch`/`close` invoked without `--apply` — fires in `parseArgs` before the spec/config is read | :1267 |

## Verb → code matrix

- **plan**: shared 7 + RENDER_UNRESOLVED, INTERACTIVE_GUARD.
- **launch**: shared 7 + RENDER_UNRESOLVED, INTERACTIVE_GUARD, WALL_OPEN_FAILED, STATE_DIR_UNAVAILABLE,
  WALL_STATUS_FAILED, WALL_OUTPUT(×2), RUN_ID_RESERVED, WORKTREE_ADD_FAILED, LAUNCH_FAILED,
  MISSION_FAILED, LAUNCH_PARTIAL, MUTATION_REQUIRES_APPLY.
- **status**: shared 7 + WALL_STATUS_FAILED, WALL_OUTPUT.
- **close**: shared 7 + WALL_STATUS_FAILED, WALL_OUTPUT, UNKNOWN_MISSION, WALL_ABSENT, PANE_LIVE,
  COMPLETE_FAILED(×2), MUTATION_REQUIRES_APPLY.
- **USAGE** (:110) sits outside the envelope at exit 64 for all verbs.

"Shared 7" = INVALID_SPEC, CONFIG_UNREADABLE, L1_CEILING_EXCEEDED, PANE_CEILING_EXCEEDED,
SCOPE_OVERLAP, COMMAND_MISSING, UNEXPECTED_ERROR.

Evidence: source read of `sighting/tower-fleet.mjs` @ b251c5a in full (:1-1306); every literal located
by regex sweep for `typed("[A-Z_]+"` / `code: "[A-Z_]+"` / `recordMissionFailure`. Cross-checked against
exit-envelope-taxonomy, spec-validation-refusals, launch-partial-policy, and close-policy entries —
no contradictions; close-policy's hole A (empty `--mission`) explains why UNKNOWN_MISSION can stay silent.

UNKNOWN: none — the census is a complete literal enumeration; reachability nuances per code are pinned
in the per-topic entries (spec-validation-refusals for INVALID_SPEC CLI reachability, launch-partial-policy
for the recorded-vs-envelope distinction).
