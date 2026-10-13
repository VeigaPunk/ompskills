# close-policy — liveness refusal, --force, absent/unknown handling, COMPLETE_FAILED

Asked: every `close` rule, plus adversarial holes.
Source: `sighting/tower-fleet.mjs` @ b251c5a (`verbClose` :1151). Lane: `ClosePolicy`.

- `close` requires `--apply` → `MUTATION_REQUIRES_APPLY` exit 2 (:1266-1268).
- Unknown `--mission <id>` → `UNKNOWN_MISSION` exit 2, before any wall read (:1153-1156).
- Whole close refuses `PANE_LIVE` when any target is live and `--force` is absent (:1169-1171);
  `--force` warns and completes anyway, panes keep running (:1172-1174).
- `WALL_ABSENT` refuses when the wall reports status `absent` (:1164-1168).
- A mission absent from the wall registry is skipped with a warning, not an error (:1180-1189).
- A wall `complete` failure is recorded per mission; the run ends `COMPLETE_FAILED` exit 2 after
  the others land (:1201-1205, :1226-1228).
- Worktrees are NEVER removed: human output prints a per-path `git -C <repo> worktree remove
  <path>` (:1220-1224); `--json` emits `worktreeRemoval: "manual-only"` plus the paths (:1209).

Adversarial (real source holes, reproduced):
- **A — `close --mission ''` widens scope to the whole fleet.** `if (options.mission)` (:1153) is
  falsy for `''`, so no `UNKNOWN_MISSION` and no filtering: every fleet mission is completed.
  (`--mission ' '` is truthy → `UNKNOWN_MISSION`.) Fix: `options.mission !== null` plus a
  `MISSION_ID_PATTERN` check.
- **B — the printed removal command is unquoted** (:1223 interpolates `spec.repo` and
  `row.worktree` raw). A repo path containing a space or `$(...)` splits or executes on paste.
  The launcher executes nothing itself. Fix: reuse `quoteArg` (:619).

Evidence: lane `ClosePolicy` (both holes reproduced with exact transcripts).
