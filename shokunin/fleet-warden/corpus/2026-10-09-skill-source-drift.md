# skill-source-drift — `.omp/skills/tower/SKILL.md` vs the real launcher

Asked: every skill claim about the fleet launcher, MATCH / DRIFT / SILENT.
Source: `.omp/skills/tower/SKILL.md` §"Sighting fleet (tower mode)" (lines 127-174) vs
`sighting/tower-fleet.mjs` @ b251c5a. Lane: `SkillDrift`.

21 claims audited: **17 MATCH, 1 MATCH-understated, 3 DRIFT, 11 SILENT**. The skill invents no
code name — every code it cites exists in the source — but it lags on three sequencing claims and
is silent on eleven contracts.

DRIFT (skill line vs source line):
- **D1 — "a failed worktree add aborts the run outright (`WORKTREE_ADD_FAILED`)"** (SKILL:152-153)
  vs `tower-fleet.mjs:812-817` — the code records it per mission and `continue`s; the run ends
  `LAUNCH_PARTIAL` (:945-947). The skill even contradicts itself at :154-155 ("still comes up").
- **D2 — "an existing path ... is reused with a warning"** (SKILL:153-154) vs :798-800 — the reuse
  branch sets only `record.worktreeReused = true`; no `warn()` is emitted on that path.
- **D3 — "a failing wall `complete` aborts first (`COMPLETE_FAILED`)"** (SKILL:171-172) vs
  :1197-1204 + :1226-1228 — the failure is recorded per mission, the close continues, and
  `COMPLETE_FAILED` is the final roll-call, not a preemption.

The three DRIFTs share one axis: the skill still describes a first-failure-aborts model, while the
source implements a uniform partial-failure policy.

SILENT (source contracts the skill never states) — the ones a card must carry:
- S1 `close --force` + `PANE_LIVE` (:1169-1171, :1173). S2 `close --mission <id>` + `UNKNOWN_MISSION`
  (:1153-1155). S3 `WALL_ABSENT` (:1164-1168). S4 a mission absent from the registry is skipped
  (:1180-1189).
- S5 relaunch/adoption idempotency: live row reused, retired row → `RUN_ID_RESERVED`
  (:757-791, :960-1004). S6 the write-root refusals incl. the symlink family (:237-307).
- S7 `INTERACTIVE_GUARD` (:454-466) — "interactive pane" is enforced, not convention.
- S8 `CONFIG_UNREADABLE` (:130-163). S9 prompt idempotency (:829-843).
- S10 `status` reconciles wall↔fleet.json both directions (:1006-1147), writes nothing.
- S11 the full typed-code set the skill never names: `COMMAND_MISSING` :510, `WALL_OUTPUT` :527/876,
  `WALL_STATUS_FAILED` :539, `STATE_DIR_UNAVAILABLE` :730, `RENDER_UNRESOLVED` :443/447,
  `LAUNCH_FAILED` :868, `MISSION_FAILED` :896 (plus `WALL_OPEN_FAILED` :716).

Rule: the source wins. A card built from the skill alone would teach an unconditional close, a
silent-warning reuse, and an aborting worktree add — all three wrong.

Evidence: lane `SkillDrift` (live read-only probes; grep confirms SKILL.md carries no `--force`,
`PANE_LIVE`, `RUN_ID_RESERVED`, `INVALID_SPEC`, or `symlink`).
