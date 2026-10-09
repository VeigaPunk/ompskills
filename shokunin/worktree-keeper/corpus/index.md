# worktree-keeper corpus — index

Append-only. One row per entry `| entry | topic | added |`. Read this first,
then the entries relevant to the assignment.

Domain anchor: `omp worktree` (binary `/home/vgpnk/.local/bin/omp`, v18.8.6, no
source tree), `.omp/skills/tower/SKILL.md`, `sighting/tower-fleet.mjs`,
`sighting/l1-prompt.md`, and this repo's real branch/worktree/merge state.
Seeded from the mission's round-1 research wave (30 lanes,
`.tower/fleets/shokunin2/reports/worktree-keeper/`).

| entry | topic | added |
| --- | --- | --- |
| [2026-10-09-wt-verb-surface.md](2026-10-09-wt-verb-surface.md) | `omp worktree` verbs/flags/examples; no `remove`; exit codes | 2026-10-09 |
| [2026-10-09-wt-add-argv.md](2026-10-09-wt-add-argv.md) | `add` argv grammar, `-C`/PATH semantics, clone-first, `__fnmcd` is not omp | 2026-10-09 |
| [2026-10-09-wt-list-semantics.md](2026-10-09-wt-list-semantics.md) | what `list` actually reads (agent yard, not git worktrees) | 2026-10-09 |
| [2026-10-09-wt-clear-semantics.md](2026-10-09-wt-clear-semantics.md) | `clear` orphan definition, `--all`, dry-run, the mis-set-base `.git` hazard | 2026-10-09 |
| [2026-10-09-wt-add-failures.md](2026-10-09-wt-add-failures.md) | `add` failure modes and exit codes (path/branch/base/non-repo) | 2026-10-09 |
| [2026-10-09-wt-retire-by-path.md](2026-10-09-wt-retire-by-path.md) | no per-path omp verb; retire via `git worktree remove <path>` | 2026-10-09 |
| [2026-10-09-wt-binary-strings.md](2026-10-09-wt-binary-strings.md) | managed root, `worktree.*` keys, orphan reasons, isolation markers | 2026-10-09 |
| [2026-10-09-tower-plan-dispatch.md](2026-10-09-tower-plan-dispatch.md) | tower `## Plan before dispatch` isolation discipline | 2026-10-09 |
| [2026-10-09-tower-settle-cleanup.md](2026-10-09-tower-settle-cleanup.md) | tower `## Settle, recover, and clean up` + CLI drift verdicts | 2026-10-09 |
| [2026-10-09-branch-naming.md](2026-10-09-branch-naming.md) | `tower/<fleet>/<id>` + lane sibling; child-ref impossibility | 2026-10-09 |
| [2026-10-09-lane-bindings-l1-prompt.md](2026-10-09-lane-bindings-l1-prompt.md) | l1-prompt lane worktree/integration/commit bindings | 2026-10-09 |
| [2026-10-09-tower-skill-drift.md](2026-10-09-tower-skill-drift.md) | tower SKILL drift ledger (worktree & cleanup) | 2026-10-09 |
| [2026-10-09-launcher-worktree-add.md](2026-10-09-launcher-worktree-add.md) | launcher worktree creation contract (branch/path/argv/failure) | 2026-10-09 |
| [2026-10-09-launcher-write-confinement.md](2026-10-09-launcher-write-confinement.md) | write-confinement zones for worktreeRoot/stateDir + residual holes | 2026-10-09 |
| [2026-10-09-launcher-close-manual-only.md](2026-10-09-launcher-close-manual-only.md) | `close` never removes a worktree; prints the retire command | 2026-10-09 |
| [2026-10-09-launcher-scope-gate.md](2026-10-09-launcher-scope-gate.md) | `SCOPE_OVERLAP` one-writer gate + worktree-root defaults | 2026-10-09 |
| [2026-10-09-launcher-reuse-idempotence.md](2026-10-09-launcher-reuse-idempotence.md) | `existsSync`-only reuse, silent reuse, the recreate trap | 2026-10-09 |
| [2026-10-09-branch-inventory.md](2026-10-09-branch-inventory.md) | real branch naming grammar and counts | 2026-10-09 |
| [2026-10-09-merge-history.md](2026-10-09-merge-history.md) | integration history: `Merge tower/<fleet>/<id>`, ordering, retries | 2026-10-09 |
| [2026-10-09-commit-scope-practice.md](2026-10-09-commit-scope-practice.md) | path-scoped commit practice observed in the repo | 2026-10-09 |
| [2026-10-09-worktree-inventory.md](2026-10-09-worktree-inventory.md) | real worktree layout, counts, foreign/stale trees | 2026-10-09 |
| [2026-10-09-lane-branch-reality.md](2026-10-09-lane-branch-reality.md) | lane branches: none exist; unit is the mission | 2026-10-09 |
| [2026-10-09-card-convention.md](2026-10-09-card-convention.md) | shokunin card template (frontmatter + three sections) | 2026-10-09 |
| [2026-10-09-corpus-convention.md](2026-10-09-corpus-convention.md) | corpus index/entry conventions | 2026-10-09 |
| [2026-10-09-shokunin-contract.md](2026-10-09-shokunin-contract.md) | the shokunin card+corpus contract as a checklist | 2026-10-09 |
| [2026-10-09-verification-pattern.md](2026-10-09-verification-pattern.md) | how prior cards were verified by dispatch | 2026-10-09 |
| [2026-10-09-cross-axis-patterns.md](2026-10-09-cross-axis-patterns.md) | single-writer-per-path; identity encoded in path/ref | 2026-10-09 |
| [2026-10-09-wt-intent-reverse.md](2026-10-09-wt-intent-reverse.md) | intent of omp's agent-scoped worktree subsystem | 2026-10-09 |
| [2026-10-09-wt-clone-first.md](2026-10-09-wt-clone-first.md) | clone-first (`worktree.clone`), FICLONE fallback is exit 0 | 2026-10-09 |
| [2026-10-09-worktree-hazards.md](2026-10-09-worktree-hazards.md) | safety invariants binding any worktree actor | 2026-10-09 |
