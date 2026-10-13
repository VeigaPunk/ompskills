# 2026-10-09 — lane worktree / integration / commit bindings (l1-prompt)

**Asked.** Every worktree/branch/commit binding for a lane in `sighting/l1-prompt.md`; what a read-only lane gets.
**Sources.** `sighting/l1-prompt.md` (identity table :43-46; isolation duty :150-157; step-6 integration :132-138; settle :163-166).
**Observed.**
- Writer-lane command (verbatim, :151-154): `omp worktree add -C {{repo}} -b tower/{{fleet}}/{{missionId}}-<lane> <path> {{base}}`; `<path>` must be a sibling of `{{worktree}}` and never inside it; the branch is a hyphen-suffixed sibling of the mission branch `tower/{{fleet}}/{{missionId}}` — "a child ref under that one cannot exist".
- Read-only lanes get **no worktree and no branch** — "Otherwise lanes are read-only and report findings to you" (:155-156). When the scope is one file (or one path set), all lanes are read-only and the L1 integrates alone (:156-157).
- Integration (step 6, :132-135): the L1 integrates in `{{worktree}}`; a read-only lane's finding is re-applied under L1 judgment; a writer lane's change is taken from its branch with `git checkout <lane-branch> -- <paths>`; the lane worktree/branch is created **before** dispatch.
- Path-scoped commit (:136-138): `git add -- <paths> && git commit -- <paths>` — the scope is what enters a commit; state-directory artifacts never do.
- Settle duty (:163-166): inspect with `omp worktree list` (`--json`); preview a sweep with `omp worktree clear --dry-run`; preserve unintegrated work; retire a worktree only by its own path; **never `omp worktree clear --all`**.
**Changed.** Seed entry.
**Unknown.** `{{repo}}/{{worktree}}/{{base}}/{{fleet}}/{{missionId}}` are launcher-substituted; whether `{{base}}` equals the mission branch tip is the launcher's concern.

**Lane.** L1PromptLanes (scout). Report: `reports/worktree-keeper/L1PromptLanes.md`.
