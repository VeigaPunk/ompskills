# omp-worktree-verbs — omp-worktree-verbs — the real CLI surface behind the removal contract

Asked: what are `omp worktree`'s verbs, and why is `clear --all` forbidden?
Source: `omp worktree --help` / `list --json` / `clear --dry-run` (omp 18.8.6, read-only probes); `sighting/tower-fleet.mjs:22-24,794-817,1209,1220-1224`. Lane: `OmpWorktreeVerbs` (revenger).

- Verbs are `list|clear|add` — **no** `remove`.
- `clear` is a **machine-wide orphan sweep of the shared global agent-managed root** (`OMP_WORKTREE_DIR` ?? `worktree.dir` ?? `~/.omp/wt`), cwd- and repo-independent; default removes only entries carrying an `orphanReason`. It takes **no PATH** (`-C` is `add`-only) and is not a per-path delete; it also does not `git worktree prune` a dangling parent entry.
- `--all` clears **every** entry "including live PR-checkout worktrees" across every repo — irreversible and unscoped. Never run.
- `add -C <repo> -b <branch> <path> <commit>` creates **both** a branch and a checked-out worktree; PATH is required.
- Fleet trees under `<worktreeRoot>` are invisible to `omp list`/`clear`; retirement is `git -C <repo> worktree remove <path>` — fail-closed on a dirty tree ("contains modified or untracked files, use --force", exit 128), exit 0 on a clean tree with the branch surviving.
- Refinement: "repo-wide sweep" is the wrong scope word — the sweep is whole-agent-managed-root and machine-wide, which **strengthens** the never-`clear` ban.

## Unknowns
- `clear`'s actual delete execution never run (forbidden); `--all` rests on help text + a compiled filter line; substrate is a compiled binary, so anchors are strings excerpts.
