# 2026-10-09 — every verb, its wall mutation, and its typed refusal codes

Question assigned: from `ufo-fsd-alpha/scripts/ufo-sighting` and its lib, list every verb,
whether it mutates the wall, and the typed refusal codes each can emit.

Sources read (all under `/home/vgpnk/Projects/ufo-fsd-alpha`):

- `scripts/ufo-sighting` (public bash shim, 121 lines)
- `scripts/ufo-sighting.mjs` (4714 lines; dispatch at 4398–4700, verb bodies as cited below)
- `scripts/ufo-sighting-lib/base.mjs` (fail/emitFatal 120–135, validators 264–426)
- `scripts/ufo-sighting-lib/argv.mjs` (preflight 285–509)
- `scripts/ufo-sighting-lib/surface.mjs` (manifest + usage + error scrape, 1–325)
- Live probe (safe, read-only): `bash scripts/ufo-sighting surface --json`, exit 0 —
  ground truth for the full typed-code set and the exit-code rule.

## The failure envelope (applies to every verb)

`fail(code,message,details)` throws `SightingError` (base.mjs:134–136). An uncaught one
reaches `emitFatal` (base.mjs:120–135): one JSON line `{ok:false,code,message,details?}`
on **stderr**, `process.exitCode = 2`. There is no exit 64 (surface.mjs exitCodes block;
corpus 2026-10-09-refusals-and-surface). A boot config fault (`SIGHTING_CONFIG === null`)
emits the same envelope with code `UNEXPECTED_ERROR` and never enters a verb
(ufo-sighting.mjs:4702–4706, base.mjs:137–145,191–193). Success is exit 0.

## Verb inventory and dispatch citations

Public verbs (dispatch ufo-sighting.mjs:4444–4674; usage surface.mjs:233–247):
`open` 4444, `surface` 4451, `status` 4461, `overview` 4468, `reconcile` 4506,
`respawn-terminal` 4511, `inquiry` 4518, `launch` 4555, `register` 4586, `twin` 4604,
`remove` 4616, `resume` 4627, `complete` 4648, `steer` 4659, `peek` 4667,
`help`/`--help`/`-h` 4675. Hidden verbs: `__idle` 4403, `__pane-run` 4408,
`__reconcile` 4413. Non-verb entry paths: trigger short-circuit 4428–4431
(`resolveTrigger` 1186–1189 → `openWall`), attach guard `INVALID_ATTACH_ROUTE` 4400–4402,
legacy native-trial path 4680–4700 (`--run-id` → `launchMission`; unknown bare word →
`INVALID_ARGUMENT` 4685–4687; bare flags → `runLegacyNativeDirect`, surface.mjs:318–325).
Shim-only routes (plain-text stderr + exit 2, **not** the JSON envelope):
`--inquiry` (scripts/ufo-sighting:72–93), `--ufo-sighting-inquiry-direct` (29–68),
`--ufo-sighting-native-direct` (70–72), `UFO_SIGHTING_ATTACH=1` zero-arg tmux attach (22–27).

## Mutation classification

| Verb | Mutates the wall? | Evidence |
|---|---|---|
| `open` | **Yes** — creates manifest+session if absent, reconcile, writes manifest (2×), launches/focuses terminal, applies layouts | 2796–2830 |
| `launch` | **Yes** — new manifest row, spawns `__pane-run` pane, layout, default hatch | 2372–2470, 2336–2351 |
| `inquiry` | **Yes** — same as launch (dispatch kind `inquiry`) | 4518–4553 |
| `register` | **Yes** — adopts an existing pane as a mission row, pane sweep, layout | 4036–4130 |
| `twin` | **Yes** — clones origin dispatch into a new row + pane | 3960–4034 |
| `resume` | **Yes** — stopped row → `starting` → new pane | 3762–3795, 3662–3740 |
| `remove` | **Yes** — drops row (durable first), kills pane, settles geometry, may tear down empty fleet window; absent row → exit 0 `removed:false` | 3158–3184 |
| `complete` | **Yes** — flips row, retention prune, settle; `--dry-run` and already-completed are non-mutating | 3339–3380 |
| `steer` | **Yes** — send-keys into pane + steer-log append + row counters | 3511–3536 |
| `respawn-terminal` | **Yes** — detaches old display client, launches a new one, rewrites manifest terminal/geometry | 2824–2884 |
| `reconcile` | **Yes** — ghost stops, pane reaping, idle keepers, layout repair, manifest writes; absent wall → reports `status:"absent"`, exit 0 | 3798–3813, 1976–2016 |
| `status` (non-`--lite`) | Report + **display side effect** — refreshes tmux pane/window options under a 250 ms lock (never writes the manifest; swallows `WALL_BUSY`) | 2873–3110, lock catch ~2983–2988 |
| `overview` | Display verb — self-marks its **own pane** (`@ufo_overview`, title) and renders; watch loop is fail-open by design | 4468–4505, 1475–1476, 1735 |
| `peek` | **No** — capture-pane under the lock, raw text to stdout | 3544–3556 |
| `surface --json` | **No** — pure manifest print, no state dir, no tmux | 4451–4459, surface.mjs:56–122 |
| `help` | **No** — usage text, exit 0 | 4675–4678 |
| `__idle` | **No** — banner + sleep | 4403–4407 |
| `__pane-run` | **Yes** (pane child) — records the stop row on exit, marker transitions, schedules `__reconcile` | 4336–4393 |
| `__reconcile` | **Yes** — same repair as `reconcile` | 4413–4427, 3798–3813 |
| trigger phrase | **Yes** — routes to `openWall` before verb parsing | 4428–4431 |
| legacy native path | **Yes** — `launchMission` (native-trial) | 4680–4700 |

## Shared floor (every verb that loads state / takes the lock / spawns tmux)

Not repeated per verb below: `UNSAFE_STATE` (state dir not beneath ROOT when
`UFO_SIGHTING_STATE_DIR` set, symlink/non-dir, manifest symlink/oversize:
ufo-sighting.mjs:345–350,386–387,397,432,469,479,556), `INVALID_ENVIRONMENT`
(foreign-owned state dir/manifest via `environmentFail` 357–399/480–481; base.mjs:327–328),
`MALFORMED_MANIFEST` + `FOREIGN_STATE` (schema/validate: 281–295; parse 416–418/512–514),
`MANIFEST_TOO_LARGE` (558), `STATE_IO_ERROR` (703), `WALL_BUSY` (lock timeout 772;
swallowed only by non-`--lite` status), `TMUX_ERROR` (runTmux 820–824, plus
1115/1119/1149/1331/2284), `INVALID_TMUX_SOCKET` (807). Verbs that assert an existing
owned wall can also emit `FOREIGN_SESSION` (962–966, 1100–1106, 3002).

## Per-verb typed refusal codes (verb-specific, with citations)

**open** (also: trigger phrase; and the hatch half of launch/inquiry/twin/resume when
`open` is not disabled): `INVALID_ARGUMENT` (4445–4447, resolveAutoOpenWall conflict
2362–2363), `WALL_NOT_OPEN` (2799–2801), `FOREIGN_SESSION` (1102/1105),
`TERMINAL_RESOLUTION_FAILED` (2485–2494), `DUPLICATE_CLIENTS` (2740, 2768),
`UNSAFE_LAUNCH_PATH` (2746–2747), `TERMINAL_LAUNCHER_MISSING` (2752),
`TERMINAL_LAUNCH_FAILED` (2726–2727), `ATTACH_TIMEOUT` (2771; `INVALID_ENVIRONMENT`
for a bad `UFO_SIGHTING_ATTACH_TIMEOUT_MS` via boundedTimeoutMs base.mjs:252–262),
`INVALID_TERMINAL_PID` (2509–2510), `TERMINAL_PID_UNAVAILABLE` (2775),
`DETACHED_WALL` (2039 via 2779/2783), `INVALID_GEOMETRY` (1193–1197, 1249),
`CAP_EXCEEDED` (2787 attached-surface cap; 1258 layout capacity), `FOREIGN_PANES`
(1853–1856), `LAYOUT_MISMATCH` (1879–1888), `LAYOUT_TOO_SMALL` (1267, 1278, 1286;
partitionCells 1220–1221), `PANE_MISSING` (1339–1340).

**surface**: `INVALID_ARGUMENT` only (unknown flag 4453–4454, trailing command 4453,
`--json` required 4457). Otherwise no typed codes (no state/tmux access).

**status**: `FOREIGN_SESSION` (3002); state-floor codes via `loadStatusView`
(531–534). No verb-specific codes of its own; `WALL_BUSY` from the display refresh is
caught and ignored (~2983–2988).

**overview**: `INVALID_ARGUMENT` only (usage errors 4469–4471; `--width` must be a
positive integer 4475–4478, validated before any marker mutation). The self-mark and
watch loop are wrapped fail-open (4480–4497 try/catch; 1475–1476 "Every other verb stays
fail-closed"; 1735 "Display-only; self-heals").

**reconcile**: state floor + `FOREIGN_SESSION` (1102/1105); `reconcileLocked` settle can
emit `FOREIGN_PANES`, `LAYOUT_MISMATCH`, `LAYOUT_TOO_SMALL`, `CAP_EXCEEDED` (1258),
`PANE_MISSING` via `applyLayout` (1976–2016 → 1917–1974 → 1802–1891); manifest-write
codes. Absent wall → early return, exit 0 (3805–3806).

**respawn-terminal**: `WALL_ABSENT` (2832–2833), `FOREIGN_SESSION` (assertOwnedWall
961–966), `DUPLICATE_CLIENTS` (2842–2843), `CLIENT_DETACH_FAILED` (2848–2849),
`MISSION_STATE_UNSAFE` (977–978 via continuitySnapshot 2844), `MISSION_CONTINUITY_BROKEN`
(995–998 via 2872–2873), plus the whole open-hatch set: `TERMINAL_RESOLUTION_FAILED`,
`TERMINAL_LAUNCH_FAILED`, `TERMINAL_LAUNCHER_MISSING`, `UNSAFE_LAUNCH_PATH`,
`ATTACH_TIMEOUT`, `INVALID_ENVIRONMENT`, `INVALID_TERMINAL_PID`,
`TERMINAL_PID_UNAVAILABLE`, `DETACHED_WALL`, `INVALID_GEOMETRY`, `CAP_EXCEEDED`,
`FOREIGN_PANES`, `LAYOUT_MISMATCH`, `LAYOUT_TOO_SMALL`, `PANE_MISSING` (same cites as
open).

**inquiry**: `INVALID_ARGUMENT` (4519–4526), `INVALID_INQUIRY` (prompt not a file or
over 1 MiB: 4527–4537), then the full launch set (below), then the hatch set when
`--no-open` is absent.

**launch**: `INVALID_ARGUMENT` (unknown flags / missing `--` command 4556–4564;
`--runner-reservation` range 2106–2110; `--fleet` pattern base.mjs:277–280),
`INVALID_ENVIRONMENT` (env-file load 4565–4567 → loadMissionEnvironment; ephemeral
guard rails 2379–2386), `INVALID_DISPATCH` (validateArgv base.mjs:414–424),
`INVALID_CWD` (2073–2074; argv.mjs:351–353), `INDIRECT_OPENCODE_DISPATCH` /
`INDIRECT_OMP_DISPATCH` (argv.mjs:293–295, 304–306), `OPENCODE_SUBSTRATE_MISMATCH` /
`OMP_SUBSTRATE_MISMATCH` (argv.mjs:308–314), `INVALID_OPENCODE_DISPATCH` (argv.mjs:65,
70, 79, 82, 112), `INVALID_OMP_DISPATCH` (argv.mjs:299, 302, 323, 327, 338, 346, 361),
`HEADLESS_MISSION_REJECTED` (argv.mjs:307, 316), `OMP_RESUME_MISMATCH`
(argv.mjs:353, 372, 378, 394, 449), `OPENCODE_EXPORT_FAILED` (argv.mjs:234, 254, 260),
`OPENCODE_RESUME_MISMATCH` (argv.mjs:270), `WALL_NOT_OPEN` (2419–2420),
`FOREIGN_SESSION` (1102/1105), `L1_CEILING_EXCEEDED` (2179–2185), `CAP_EXCEEDED`
(2177–2184), `RUNNER_CEILING_EXCEEDED` (2129–2136), `RUN_ID_CONFLICT` (2215),
`SESSION_ID_CONFLICT` (2217), `NATIVE_SESSION_CONFLICT` (2221), `INVALID_RUN_ID` /
`INVALID_SESSION_ID` (newMission 2070–2071; base.mjs:392–402),
`FLEET_WINDOW_AMBIGUOUS` (926–929 via ensureFleetWindow 1131–1132), `INVALID_ARGUMENT`
fleet-collision (1134–1135), `TMUX_ERROR` cannot-establish-fleet-window (1149),
layout set (`FOREIGN_PANES`/`LAYOUT_MISMATCH`/`LAYOUT_TOO_SMALL`/`PANE_MISSING`),
`INVALID_GEOMETRY`/`DUPLICATE_CLIENTS` (selectedGeometry 2021–2051), `MALFORMED_MANIFEST`
(row validation), hatch set when open (default): `TERMINAL_RESOLUTION_FAILED`,
`ATTACH_TIMEOUT`, `TERMINAL_LAUNCH_FAILED`, `TERMINAL_LAUNCHER_MISSING`,
`UNSAFE_LAUNCH_PATH`, `TERMINAL_PID_UNAVAILABLE`, `DETACHED_WALL`, `CAP_EXCEEDED`
(2787), `INVALID_ENVIRONMENT`. Hatch failure after a successful spawn records the
verbatim code on the row, stops it, and removes it (2448–2469).

**register**: `INVALID_ARGUMENT` (4591–4592), the argv-preflight set (`INVALID_DISPATCH`,
`INVALID_CWD`, `INDIRECT_*`, `*_SUBSTRATE_MISMATCH`, `INVALID_OMP_DISPATCH`,
`INVALID_OPENCODE_DISPATCH`, `HEADLESS_MISSION_REJECTED`, `OMP_RESUME_MISMATCH`,
`OPENCODE_EXPORT_FAILED`, `OPENCODE_RESUME_MISMATCH`), `WALL_ABSENT` (4038–4039),
`FOREIGN_SESSION`, `INVALID_PANE` (4052–4064: bad id, not in session, dead, overview
pane, not default window), `INVALID_RUN_ID`/`INVALID_SESSION_ID` (4066–4067),
`REGISTRATION_CONFLICT` (4083–4084), `L1_CEILING_EXCEEDED` (4089), `CAP_EXCEEDED`
(4090), `RUNNER_CEILING_EXCEEDED` (4092), `RUN_ID_CONFLICT`/`SESSION_ID_CONFLICT`/
`NATIVE_SESSION_CONFLICT` (ensureUniqueMission 4095–4107 → 2215–2221), `INVALID_GEOMETRY`/
`DUPLICATE_CLIENTS` (4086), layout set via applyLayout (4125–4126).

**twin**: `INVALID_ARGUMENT` (4605–4612), `MISSION_AMBIGUOUS` (pre-check 3953–3957 via
3154), `OPENCODE_RESUME_TWIN_UNSAFE` (3949–3950), `ORIGIN_NOT_FOUND` (3965–3967, 3972),
`TWIN_RECURSION` (3973), `TWIN_EXISTS` (3981), `INVALID_RUN_ID`/`INVALID_SESSION_ID`
(3987), `INVALID_DISPATCH` (cloneDispatchForTwin 3927–3928), `OMP_CONTINUE_TWIN_UNSAFE`
(3904–3905), `OMP_EPHEMERAL_TWIN_UNSAFE` (3907–3908), `INVALID_CWD`,
`L1_CEILING_EXCEEDED`, `CAP_EXCEEDED`, `RUNNER_CEILING_EXCEEDED` (asserts at
3994–3996), uniqueness conflicts, fleet-window + layout codes, `WALL_NOT_OPEN`/
`FOREIGN_SESSION` (3969), hatch set when open (default).

**remove**: `INVALID_ARGUMENT` (4618–4620), `MISSION_AMBIGUOUS` (3154), `FOREIGN_SESSION`
(3185 area ensureOwnedSession), layout set via settleWallGeometry, manifest-write codes.
Never `MISSION_NOT_FOUND` on an absent row — that is `removed:false`, exit 0
(3161–3163); live rows are removed (kill+drop per surface.mjs states).

**resume**: `INVALID_ARGUMENT` (4631–4636; `--cwd` 3723–3726), `INVALID_DISPATCH`,
argv-preflight set, `MISSION_NOT_FOUND` (3788, 3649), `MISSION_AMBIGUOUS` (3154),
`IDENTITY_MISMATCH` (3650–3659), `RESUME_COMPLETED` (3686–3687), `RESUME_LIVE`
(3689–3693), `RESUME_UNSUPPORTED` (3696), `FOREIGN_SESSION` (3789), `NATIVE_SESSION_CONFLICT`
(3733–3734), `INVALID_GEOMETRY`/`DUPLICATE_CLIENTS` (3663), `L1_CEILING_EXCEEDED` (3698),
`CAP_EXCEEDED` (3699), `RUNNER_CEILING_EXCEEDED` (3701–3703), fleet-window + layout codes
via spawnPaneForMission, `MALFORMED_MANIFEST`, hatch set when open (default),
`WALL_NOT_OPEN` inside the hatch.

**complete**: `INVALID_ARGUMENT` (4650–4652; note validation 3194–3199),
`MISSION_NOT_FOUND` (3400–3405), `MISSION_AMBIGUOUS` (3154), `FOREIGN_SESSION`
(3403), layout set via settleWallGeometry (3368), manifest-write codes. Never emits
`MISSION_NOT_LIVE` — completed rows are an idempotent no-op (3354–3357); `--dry-run`
mutates nothing (3346–3352).

**steer**: `INVALID_ARGUMENT` (4661–4663; exactly one of `--text`/`--text-file`
3444–3446), `INVALID_STEER_TEXT` (read failure 3453–3454; line/control/empty/byte-bound
3465–3477), `MISSION_NOT_FOUND` (3400–3405), `MISSION_AMBIGUOUS` (3154),
`FOREIGN_SESSION` (3403), `MISSION_NOT_LIVE` (3428–3429), `DEAD_PANE` (3410–3422),
`PANE_IN_MODE` (3436–3437), `STEER_LOG_FAILED` (3506–3507), `TMUX_ERROR` (send-keys
3522–3523), manifest-write codes.

**peek**: `INVALID_ARGUMENT` (4668–4672; `--lines` 3564–3568), `MISSION_NOT_FOUND`,
`MISSION_AMBIGUOUS`, `FOREIGN_SESSION` (resolveWallMission 3400–3405/3154),
`MISSION_NOT_LIVE` (3551–3552), `DEAD_PANE` (3554), `TMUX_ERROR` (capture 3555).
Success prints raw text, not JSON.

**help**: none (exit 0 usage text).

**__idle**: none.

**__pane-run**: `INVALID_ARGUMENT` (missing mission id 4409), `MISSION_NOT_FOUND`
(4338–4339), `INVALID_DISPATCH` (dispatchArgv → validateDispatch 2049–2058),
`INVALID_ENVIRONMENT` (env file drift/load 4346–4351), `SANDBOX_UNAVAILABLE` (4205–4206),
`INVALID_OPENCODE_DISPATCH` (4207–4208) + environmentFail (4210), state-floor codes; a
failed stop-record is retried once then rethrown typed (3599–3617). `SPAWN_FAILED` is
recorded on the row as data, not emitted as a refusal (4386–4388).

**__reconcile**: `INVALID_ARGUMENT` (--delay range 4417–4420), then the reconcile set.

**Legacy native path**: `--run-id` → `INVALID_RUN_ID` (native pattern, base.mjs:392–394)
then the launch set; unknown bare word → `INVALID_ARGUMENT` 4685–4687; bare flags pass
through to run-omp-native-trial (exit code passthrough, surface.mjs:318–325).
`INVALID_ATTACH_ROUTE` (4400–4402) guards the `.mjs` attach entry.

## Ground truth: the complete code set

`surface --json` `.errors` (scraped from `fail("` in the CLI + lib by `surfaceErrors`,
surface.mjs:37–45), observed 2026-10-09, exit 0 — 65 codes:

ATTACH_TIMEOUT, CAP_EXCEEDED, CLIENT_DETACH_FAILED, DEAD_PANE, DETACHED_WALL,
DUPLICATE_CLIENTS, FLEET_WINDOW_AMBIGUOUS, FOREIGN_PANES, FOREIGN_SESSION, FOREIGN_STATE,
HEADLESS_MISSION_REJECTED, IDENTITY_MISMATCH, INDIRECT_OMP_DISPATCH,
INDIRECT_OPENCODE_DISPATCH, INVALID_ARGUMENT, INVALID_ATTACH_ROUTE, INVALID_CWD,
INVALID_DISPATCH, INVALID_ENVIRONMENT, INVALID_GEOMETRY, INVALID_INQUIRY,
INVALID_OMP_DISPATCH, INVALID_OPENCODE_DISPATCH, INVALID_PANE, INVALID_RUN_ID,
INVALID_SESSION_ID, INVALID_STEER_TEXT, INVALID_TERMINAL_PID, INVALID_TMUX_SOCKET,
L1_CEILING_EXCEEDED, LAYOUT_MISMATCH, LAYOUT_TOO_SMALL, MALFORMED_MANIFEST,
MANIFEST_TOO_LARGE, MISSION_AMBIGUOUS, MISSION_CONTINUITY_BROKEN, MISSION_NOT_FOUND,
MISSION_NOT_LIVE, MISSION_STATE_UNSAFE, NATIVE_SESSION_CONFLICT,
OMP_CONTINUE_TWIN_UNSAFE, OMP_EPHEMERAL_TWIN_UNSAFE, OMP_RESUME_MISMATCH,
OMP_SUBSTRATE_MISMATCH, OPENCODE_EXPORT_FAILED, OPENCODE_RESUME_MISMATCH,
OPENCODE_RESUME_TWIN_UNSAFE, OPENCODE_SUBSTRATE_MISMATCH, ORIGIN_NOT_FOUND, PANE_IN_MODE,
PANE_MISSING, REGISTRATION_CONFLICT, RESUME_COMPLETED, RESUME_LIVE, RESUME_UNSUPPORTED,
RUNNER_CEILING_EXCEEDED, RUN_ID_CONFLICT, SANDBOX_UNAVAILABLE, SESSION_ID_CONFLICT,
STATE_IO_ERROR, STEER_LOG_FAILED, TERMINAL_LAUNCHER_MISSING, TERMINAL_LAUNCH_FAILED,
TERMINAL_PID_UNAVAILABLE, TERMINAL_RESOLUTION_FAILED, TMUX_ERROR, TWIN_EXISTS,
TWIN_RECURSION, UNSAFE_LAUNCH_PATH, UNSAFE_STATE, WALL_ABSENT, WALL_BUSY, WALL_NOT_OPEN.

Every code above is accounted for by at least one verb in the per-verb lists
(`FOREIGN_STATE`, `UNSAFE_STATE`, `MALFORMED_MANIFEST`, `MANIFEST_TOO_LARGE`,
`STATE_IO_ERROR`, `WALL_BUSY`, `TMUX_ERROR`, `INVALID_TMUX_SOCKET`, `INVALID_ENVIRONMENT`
live in the shared floor).

## Confidence and unknowns

- High confidence: dispatch routes, per-verb code lists, mutation classification — all
  directly cited to lines read this session; the code set is the CLI's own scrape.
- Notes: (1) `overview`'s watch loop deliberately swallows per-tick errors, so its
  practical typed surface is `INVALID_ARGUMENT` only. (2) `status --lite` skips the
  display refresh and thus the lock entirely. (3) `RECONCILE_UNATTESTED_STOP` and
  `SPAWN_FAILED` are row-recorded causes, not CLI refusals — the scrape agrees (absent
  from `.errors`). (4) The shim's own route errors are plain text, exit 2, outside the
  JSON envelope. (5) Untyped unexpected errors surface as `UNEXPECTED_ERROR`, exit 2
  (emitFatal), which is a fallback, not a verb contract.
