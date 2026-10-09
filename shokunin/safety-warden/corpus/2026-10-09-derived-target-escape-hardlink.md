# derived-target-escape-hardlink — derived-target-escape-hardlink — F1 symlink escapes closed; hardlink leaf OPEN (HIGH)

Asked: are the four F1 child-symlink escapes dead at the tip, and is anything else open on the same paths?
Source: `sighting/tower-fleet.mjs:257-285,287-307,697→699,708/714,727,797,835,837→842,906→907`; `reports/tf-safety-r2.md:35-93,173-197`; suite `test/tower-fleet.test.mjs:1631-1682`. Lane: `DerivedTargetEscapeRepro` (25 runs, isolated scratch roots, positive control, mid-run plants via a wall-stub `open` hook).

- **The four F1 escapes are CLOSED**: worktree slot, prompt, sessions parent, `fleet.json` each `exit 2 INVALID_SPEC` with a path-naming message, 0 wall bytes, `<ufoRoot>` byte-identical (`0e416f0a…`). A positive control (honest launch) still wrote the three owned files and 3 wall calls, and still left `<ufoRoot>` identical.
- Ordering pinned behaviorally: :697 guard beats the recursive `mkdirSync` :698; :797 beats `omp worktree add` :805; a mid-run slot refusal is `INVALID_SPEC`, not `WORKTREE_ADD_FAILED`.
- **NEW HIGH, open — hardlink leaf.** `ln <ufo>/config/ufo.json <state>/<id>.prompt.md` → `exit 0`, `ok:true`, pane launched, and `writeFileSync` (`w` → `O_TRUNC`) replaced the band authority's **bytes** (three legs: prompt `…d9611684`, fleet.json `…3f28a804`, a hardlinked `SKILL.md` via `cpSync` `…c89287a4`); `stat` shows shared `ino` with `nlink=2`. `isSymbolicLink()` is false and `realpathDeepest` resolves inside the root, so every check passes. `find` shows **no new path** — only content hashing detects it. Feasible here: `ompskills` and `ufo-fsd-alpha` share filesystem id `cc4be4baa8652d82`; `fs.protected_hardlinks=1` does not block a same-owner link.
- Consequence observed: the next run against a clobbered root fails closed (`CONFIG_UNREADABLE` "not valid JSON" / "missing sighting.dispatch.maxConcurrentL1") — the fleet is dead until the authority is restored.
- Smallest remediation (not applied; read-only lane): refuse a leaf whose `lstatSync(target).nlink > 1` beside the symlink check (`:270-279`) and apply it to every file `cpSync` lands, plus temp-file+`renameSync` for the two `stateDir` writes.

## Not carried by the source
- Post-open refusals are not zero-mutation: the `:727` `stateDir` and `:906` `fleet.json` guards fire after wall `open`; at `:906` the refusal also loses the report channel (`--json` stdout empty, no `fleet.json`, live orphan pane). "Refusals cause zero mutation" scopes to *filesystem* mutation and the pre-flight.

## Unknowns
- The true check→syscall swap race is not exercisable from a read-only lane (sibling `toctou-window` reached it with a flipper); bind mounts untested.
