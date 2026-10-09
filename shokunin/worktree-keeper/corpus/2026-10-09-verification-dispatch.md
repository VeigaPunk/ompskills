# 2026-10-09 — verification by dispatch (the card's first assignment) + round-2 falsification

**Asked.** Discharge the shokunin verification duty: dispatch the card on a bounded test task from the mission worktree and record the observed result; then falsify the card/corpus with an independent wave.
**Sources.** the dispatch (`task` `agent: worktree-keeper`, job `WorktreeKeeperSmoke`, 45.1s); the 20 round-2 lanes' reports in `reports/worktree-keeper/`.
**Observed.**
- **Dispatch succeeded and the card was discovered** from the mission worktree (`.omp/agents/worktree-keeper.md`); the agent answered **4/4** bounded questions correctly, citing corpus anchors:
  Q1 mission argv `omp worktree add -C /tmp/wksmoke/repo -b tower/acme/wt-demo /tmp/wksmoke/.tower/worktrees/acme/wt-demo <base>` and the writer-lane sibling `tower/acme/wt-demo-lane1` — correct, with the honest caveat that `spec.base`/`{{base}}` substitution and the lane slot name are not stated in the card/corpus (a real gap, since closed in the card).
  Q2 retire with `git -C <repo> worktree remove <path>`, not `omp worktree clear` (yard-scoped) — correct.
  Q3 inventory with `git -C <repo> worktree list`; `omp worktree list --json` prints `[]` because it scans the agent yard — correct.
  Q4 a failed add records `WORKTREE_ADD_FAILED`, the run continues, ends `LAUNCH_PARTIAL` exit 2 — correct.
- **Round-2 falsification wave (20 lanes)**: 18 lanes found the card/corpus claims they tested **hold**; the wave produced 11 corrections, all applied before the round-2 commit:
  card — base default + lane-slot naming added; the merge-actor claim reworded (the launcher never merges; the L1 integrates per l1-prompt :132; argv unrecorded); a leaf sentence added; the bounds now forbid `git worktree remove --force` on a real dirty tree; the `PATH` claim corrected (relative accepted; an inside-repo path recurses into a plain-checkout fallback at exit 0 — noise, not a refusal); the lane-name clause marked as an L1 duty (no source pins validation); "one path" → "one file"; the `orphanReason` senses corrected to the binary's set; the fleet-section label corrected to :127-174; the l1-prompt anchor to :151-155.
  corpus — the `clear` orphan reason quoted verbatim ("no recognizable worktree contents"); the `-b` rule corrected (an existing branch at base is a silent no-op); the test anchor :286 → :287; the ref count corrected to 35 `tower/*` branches (44 local); the `probe1` outlier marked transient; the skill line count 174; "machine-global" → user-global.
- Two card errors were found by adversarial lanes and are the reason the wave existed: the merge-actor attribution (no source records a launcher merge) and the `PATH` "must be absolute and outside the repo" claim (falsified by probe — the launcher's own trees are inside the repo).
**Changed.** Card corrected in place (it is the agent definition, not append-only corpus); corpus entries corrected before publication of the round-2 commit; this entry appended.
**Unknown.** The exact merge argv/actor (no generator in tracked sources); whether `task` discovery would honour the card from a *different* cwd (verified only from the mission worktree); the omp-envelope lane-name validation (not probed).

**Lane.** L1 (integration) + `WorktreeKeeperSmoke` (card dispatch) + 20 round-2 lanes. Reports: `reports/worktree-keeper/`.
