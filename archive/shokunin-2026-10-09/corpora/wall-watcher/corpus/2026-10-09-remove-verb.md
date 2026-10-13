# 2026-10-09 — `remove` verb

**Asked:** document `remove` — the `--mission` contract, side effects, and refusals.

**Sources (exact; `ufo` = `/home/vgpnk/Projects/ufo-fsd-alpha`)**

- `ufo/scripts/ufo-sighting.mjs:4616-4626` — the `remove` branch + composite envelope.
- `ufo/scripts/ufo-sighting.mjs:3158-3172` — `removeMission`.
- `ufo/scripts/ufo-sighting.mjs:3151-3156` — `matchMissionByIdentifier`.
- `ufo/scripts/ufo-sighting.mjs:1917-1975, 1155-1180` — `settleWallGeometry` / `killFleetWindowIfEmpty`.
- `ufo/scripts/ufo-sighting-lib/surface.mjs:64, 118-120, 233-238, 267` — descriptor, states, `missionId` contract.
- Tests: `ufo/tests/ufo-sighting.test.js:2952-2968, 2977-3003, 3009, 3861-3863, 4355`.
- Probe: `remove --help` → `usage: ufo-sighting remove --mission RUN_OR_MISSION`, exit 0.

**Observed**

- Flags: exactly `--mission VALUE` (required). Refusals: `remove requires --mission`,
  `remove takes no command after --`, `remove does not support --<flag>` — all `INVALID_ARGUMENT`, exit 2.
- Identifier: matched raw against `row.id` **or** `row.runId`; two matches → `MISSION_AMBIGUOUS`. There is
  **no** pattern guard: a malformed identifier matches nothing and falls to the absent-row path.
- **No typed unknown-mission refusal, and no live-mission guard.** `remove` on an absent row (or with no
  manifest / no session) is an idempotent no-op: exit 0 with `removed:false`, no manifest rewrite, no
  `registryRevision` bump (test 3000-3003). A live **or** completed row is removable: "remove hard-deletes
  live and completed rows, kills panes, and is idempotent". This is the deliberate contrast with
  `complete`/`peek`/`steer`, which DO fail typed `MISSION_NOT_FOUND` / `MISSION_NOT_LIVE`.
- Side effects, in order: drop the row from `state.missions` → durable `writeManifest` **before** any pane
  kill (crash consistency) → `settleWallGeometry(..., {killEmptyFleetWindow:true})` (the removed mission's
  pane becomes destroyable and is `kill-pane`d; an emptied fleet window is killed; foreign and
  overview/dashboard panes are preserved) → `updateSessionStatus` → second `writeManifest` purely to bump
  `registryRevision` and poke manifest watchers.
- `.ufo/sessions/<runId>` is **not** touched by `remove` — only `complete` runs `planMissionRetention`/
  `applyMissionRetention`. No `rmSync` of the session dir on the remove path.
- Envelope: `{ removed, ...getStatus }` — composite and **non-atomic**: the verb effect ran under the
  operation lock, the trailing status snapshot did not (source comment at `:4621-4623`); atomic consumers
  read the manifest.
- No shim route for `remove` (unlike `inquiry`/native); the docs do not cover it — cite code + `surface --json`.

**Changed:** nothing.

**Unknown:** whether `parseNamedOptions` accepts the `--mission=<id>` equals form for this verb was not
exercised (it does for other verbs).