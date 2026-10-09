# launch-idempotence — wall-run-id adoption and reserve semantics

Asked: the relaunch/adoption rules.
Source: `sighting/tower-fleet.mjs` @ b251c5a. Lane: `LaunchAdoption`.

- A run id is reserved while ANY registered row holds it — live `missions[]` OR retired
  `completed[]`/`stopped[]`. Adoption reads `wallRegistry` (:966) `byId`, built retired-first /
  live-last so the live row's `paneId`/`phase` wins (:1000-1002); key is exact `wallRowId`
  (runId ?? missionId, :544-546).
- Adoption happens FIRST, before worktree work: `record.paneId` (:764), `panePhase =
  wallRowDisposition` (:765), `paneReused = true` (:766), `retired = !live` (:767).
- Liveness comes only from `liveViewById` (:576) + `wallRowLive` (:558-563) — the live view's
  `levels.l1`, never a retired row's `phase`.
- A live row is reused with a warning, never re-launched (:775-776); the wall launch at :852 is
  guarded by `if (record.paneReused) { records.push(record); continue; }` (:845-851).
- A retired/reserved row → `RUN_ID_RESERVED` with a remedy (resume if `suspended`, else remove or
  a new id) (:780-790); it is that mission's first failure and the run ends `LAUNCH_PARTIAL`
  exit 2.
- Prior `launchResult` is carried from `fleet.json` as `launchResultFrom: "prior-state"` (:725,
  :768-774); a fresh launch leaves the field off and `--json` collapses it to
  `launchResultRecorded` (:931).
- Byte-identical prompts are left untouched (`promptReused` :840); a hand-edited one is
  overwritten (:842). Adopted rows still mutate disk — no "adopted means read-only" rule.

Evidence: lane `LaunchAdoption`.
