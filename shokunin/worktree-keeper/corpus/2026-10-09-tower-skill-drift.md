# 2026-10-09 — tower SKILL drift ledger (worktree & cleanup)

**Asked.** Audit `.omp/skills/tower/SKILL.md`'s worktree/cleanup prose for drift against its own sources.
**Sources.** `.omp/skills/tower/SKILL.md:110-118,152-154,168-171`; `omp worktree --help` + live probes; `sighting/tower-fleet.mjs:394,421,798-800,803,814-820,945-946,1209,1220-1223`; peer lanes WtClearSemantics, TowerSettleCleanup.
**Observed.**
- `SKILL.md:110-112` "inspect with `omp worktree list` (`--json`)": mechanics HOLD, fitness **DRIFT** — the verb exists with `--json` (observed `[]`, exit 0), but it scans config `worktree.base` (default `~/.omp/wt`) and printed "No agent-managed worktrees found under /home/vgpnk/.omp/wt." while the repo holds many git worktrees; `-C <repo>` is accepted but ignored. Tower fleet trees at `<repo>/.tower/worktrees/<fleet>/<id>` (:394, :421) are invisible.
- `SKILL.md:110-112` "clear --dry-run prints what would go without touching the filesystem": HOLDS (help text; observed exit 0, fs untouched; with an orphan present it prints "would remove … / 1 dir would be removed.").
- `SKILL.md:115-116` "clear is a repo-wide orphan sweep, not a per-path delete": "not-per-path" and "orphan sweep" HOLD, but "**repo-wide**" is DRIFT — the root is `worktree.base`/`OMP_WORKTREE_DIR`, machine-global across parent repos and independent of cwd/repo, so it is not repo-scoped at all (the `tower-fleet.mjs:22` header carries the same mislabel the prose was copied from). PATH is documented for `add` only; `omp worktree clear /tmp/somepath --dry-run` exits 0 and ignores it.
- `SKILL.md:117-118` "never `clear --all`; it clears every entry, incl. live PR-checkout worktrees": HOLDS (help text; the `e.all` branch in the ELF; `clear --dry-run --all` → "No worktrees to remove." exit 0 — the message swaps `orphaned`→`worktrees` only with `--all`).
- `SKILL.md:152-153` "a failed worktree add aborts the run outright": **DRIFT** — `tower-fleet.mjs:814-820` records `WORKTREE_ADD_FAILED` then `records.push(record); continue;`; the header contract (:33-35) says a failed mission never aborts the run (exit 2 `LAUNCH_PARTIAL`).
- `SKILL.md:153-154` "existing path … reused with a warning": reuse HOLDS, "with a warning" **DRIFT** — `:798-800` `if (existsSync(row.worktree)) { record.worktreeReused = true; }` is silent; the only warn (:803) fires when a reused row's worktree is **missing**.
- `SKILL.md:168-171` "close never removes a worktree; prints `git -C <repo> worktree remove <path>`; warns unmerged work preserved first": HOLDS (`:1209` `worktreeRemoval: manual-only`; `:1220-1223` prints exactly that command with the preservation warning; no `omp worktree clear` invocation exists in the file).
- Visibility criterion is root membership — proved by `OMP_WORKTREE_DIR` override making a repo worktree visible as `live … kind pr-checkout` — therefore `list`/`clear` cannot reach tower fleet trees ([INFERENCE] as an entailment of the observations).
**Changed.** Seed entry; drives the card's drift note.
**Unknown.** Real `clear`/`--all` mutation was not executed (lane rule; WtClearSemantics owns it); an end-to-end `launch --apply` with a genuinely failing add was not run, so the abort-vs-continue drift rests on code + the launcher's own contract.

**Lane.** TowerSkillDrift (critic). Report: `reports/worktree-keeper/TowerSkillDrift.md`.
