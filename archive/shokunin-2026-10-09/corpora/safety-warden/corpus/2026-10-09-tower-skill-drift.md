# tower-skill-drift — tower-skill-drift — tower/SKILL.md vs the launcher source

Asked: where does `.omp/skills/tower/SKILL.md`'s fleet prose contradict the launcher at the tip?
Source: `.omp/skills/tower/SKILL.md:152-154,171-172`; `sighting/tower-fleet.mjs:798-799,812-817,892-901,945-947,1164-1174,1197-1228`; `sighting/l1-prompt.md:158-162`. Lane: `TowerSkillDrift`.

- Contradicted: (1) skill "a failing wall `complete` aborts first" — observed tf-b's `complete` ran after tf-a failed and `COMPLETE_FAILED` fires last; (2) skill "a failed worktree add aborts the run outright (`WORKTREE_ADD_FAILED`)" — observed both missions failed, the run continued, `fleet.json` written, `LAUNCH_PARTIAL`; (3) skill "existing worktree path reused with a warning" — observed silent reuse (warnings exist only for pane adoption).
- Omissions predating guards: `close` preflight `WALL_ABSENT`/`PANE_LIVE`/`--force`; `RUN_ID_RESERVED`; the `assertSafeWriteRoot`/`assertSafeWriteTarget` symlink refusals; and the residual that a symlinked root's leaf check fires at `:726-731` **after** wall `open`+`status --lite`.
- The skill contains **no** "Never write to the substrate" bullet at tip `87c351a`; that text lives at `sighting/l1-prompt.md:158-162` — cite the launcher/l1-prompt anchors, not the skill.
- Holding: `MUTATION_REQUIRES_APPLY` precedes spec read/wall touch; typed=2/usage=64; ceiling order; `SCOPE_OVERLAP`; `spawnSync` argv arrays; close prints the per-path removal remedy; skills-copy candidate order.

## Unknowns
- Fake wall only; real tmux wall, ghost rows, truncated-registry warning unreachable; real worktree-add success path unverified.
