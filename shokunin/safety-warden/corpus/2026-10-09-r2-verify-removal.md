# r2-verify-removal — r2-verify-removal — removal rules confirmed against CLI and close output

Asked: do the removal-rules and omp-verb claims hold?
Source: `sighting/tower-fleet.mjs:21-24,70-81,1209,1220-1224`; `omp worktree --help|list --json|clear --dry-run`; card `:182-197`. Lane: `VerifyRemoval`.

- `close --apply --json` exit 0 with `worktreeRemoval: "manual-only"`; human output printed `git -C /tmp/VerifyRemoval/repo worktree remove /tmp/VerifyRemoval/wt/probe`.
- `omp worktree --help` lists exactly `list, clear, add`; `--all` explicitly includes live PR-checkout worktrees; `list --json` → `[]`; `clear --dry-run` → "No orphaned worktrees to remove".

## Unknowns
- Managed-root precedence and `orphanReason` filtering not behaviorally exercised (list empty); `add` side effects not run (read-only lane).
