# removal-rules — removal-rules — never an automated sweep; per-path remedy only

Asked: what removal rules does the launcher carry?
Source: `sighting/tower-fleet.mjs:21-24` (contract), `:70-81` (imports), `:1208-1209` (`worktreeRemoval`), `:1220-1224` (close output); suite refusal probes. Lane: `RemovalRules`.

- The launcher imports **no** delete/remove primitive (import set has no `rm`/`unlink`/`rmdir`); `omp worktree clear` appears only in the contract comment (:22) and the printed message (:1221).
- `close --apply` prints, per mission, the literal `git -C <repo> worktree remove <path>` (:1220-1224) and `--json` declares `worktreeRemoval: "manual-only"` (:1209). Reproduced: `close --json` exit 0 with `"worktreeRemoval":"manual-only"`; human output "Worktrees are NEVER removed automatically…".
- The rule: **the operator removes, by exact path, never an automated sweep** — and the sweep (`clear`) is broader than "repo-wide" (see `omp-worktree-verbs`).

## Unknowns
- The printed `git worktree remove` was not executed (leaf lane, no git writes); the close leg with a wall-registered mission shares the same emit path.
