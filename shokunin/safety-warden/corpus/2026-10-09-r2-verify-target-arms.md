# r2-verify-target-arms — r2-verify-target-arms — arms confirmed; in-root link refusal mutation-tested

Asked: do the `assertSafeWriteTarget` arms fire as the card says, including the unconditional in-root leaf refusal?
Source: `sighting/tower-fleet.mjs:257-285` (:264,:267-269,:270-273,:274-279,:280-283,:284), `:287-307,:708,:714`; card `:76-83`. Lane: `VerifyTargetArms`.

- Baseline missing leaf → `exit 0`, 3 wall lines (tolerance confirmed). Symlink leaf → `exit 2` "is a symlink — refusing a write through it", 0 wall lines. **In-root symlink leaf → still refused** (sentinel file untouched). Dangling leaf → "resolves through a dangling symlink". Symlinked parent → "resolves outside its write root". Two-hop leaf and parent chains → same two envelopes. Zone recheck on the resolved leaf → "resolves inside ufoRoot … the substrate is never written" (field without the " root" suffix, i.e. `:284`, not `:264`). Dangling root → load-time root guard.
- All refusals: 0 wall lines, empty stdout, config sha unchanged.
- **Mutation probe**: making the leaf check escape-only (`isSymbolicLink() && !beneath(root)`) let an in-root link write land (`exit 0`, sentinel overwritten) → mutant **KILLED**, so containment alone does not stop an in-root link and the unconditional check is load-bearing. Pristine bytes restored (`80f0814e…`).

## Unknowns
- `rootPath.dangling` half of `:267-269` is statically unreachable (refused earlier at load `:401-402`) — defense-in-depth. Only `launch --apply` driven.
