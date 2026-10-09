# 2026-10-09 — close never removes a worktree (manual-only)

**Asked.** Extract the close-path worktree contract from `sighting/tower-fleet.mjs`.
**Sources.** `sighting/tower-fleet.mjs` `verbClose` :1151-1230 (wall `complete` shell-out :1195; human print :1220-1224; JSON :1209; `--mission` :1153-1156; `PANE_LIVE` :1157-1174; `--force` warn :1173); `.omp/skills/tower/SKILL.md:168-172`.
**Observed.**
- `close --apply` never removes a worktree: the only shell-out in `verbClose` is the wall `complete` (:1195); the sole argv containing `worktree` in the whole file is the launch-path `omp worktree add` (:805-811); header comment :22-24 says worktrees are "never automatically" removed.
- It prints, in the human (non-`--json`) branch only, one line per mission: ``  git -C <spec.repo> worktree remove <row.worktree>`` (:1223) — two leading spaces, no quoting, one per `results` entry with no filter (also emitted for `absent`/skipped and failed rows). `spec.repo = path.resolve(raw.repo.trim())` (:332); `row.worktree = path.join(spec.worktreeRoot, mission.id)` (:1179). It is a plain `git` command, not an `omp worktree` verb.
- `--json` emits `worktreeRemoval: "manual-only"` (:1209) and suppresses the human block.
- `--mission <id>` filters (:1153-1156; unknown → `UNKNOWN_MISSION` exit 2, before the wall read); `PANE_LIVE` is a whole-run guard (:1157-1174) unless `--force` (warn :1173). Exit codes 0/2/64.
- Empirical: scratch `/tmp/wtprobe` (JSON specs only, deleted; no add/clear run; real repo untouched). A human `close` on a fleet with no wall rows exits 0 and prints the header + the per-path `git ... worktree remove` lines; `--json` exits 0 with `{ok:true,...,worktreeRemoval:"manual-only"}`; `close --apply` with a live run id → `{ok:false,code:PANE_LIVE,...}` exit 2, no wall mutation; `--mission` unknown → `UNKNOWN_MISSION` exit 2.
- Drift: the `MUTATION_REQUIRES_APPLY` message (:1267) says "close mutates the wall and the worktrees" but close mutates only the wall; `.omp/skills/tower/SKILL.md:171-172` says a failing wall `complete` "aborts first" — the code records a per-mission failure, continues, then raises `COMPLETE_FAILED` (:1197-1204, :1226-1229).
**Changed.** Seed entry.
**Unknown.** The `COMPLETE_FAILED` path was read from source, not exercised (to avoid mutating a real wall mission); the `WALL_ABSENT` path was not induced (live wall attached).

**Lane.** LauncherCloseWt (scout). Report: `reports/worktree-keeper/LauncherCloseWt.md`.
