# write-root-zones — write-root-zones — the four-condition denylist on stateDir/worktreeRoot

Asked: when is a write ROOT (`stateDir`/`worktreeRoot`) refused?
Source: `sighting/tower-fleet.mjs:237-252` (dangling :239-241, ufo zone :243-245, repo-root :246-248, `.git` :249-251, `inside()` :242); call sites :401-402. Lane: `WriteRootZones`.

- 13-case hostile/control battery on a scratch root: 12 refused `exit 2 INVALID_SPEC`, safe control `exit 0`. Zones proven: inside `ufoRoot` **lexical OR real**, separator-exact equality-or-prefix (a sibling `ufoEvil/` passes); exactly the repo root (equality only — `<repo>/sub` and a `<repo>`-sibling pass); inside `<repo>/.git` (separator-aware: `.git` refuses, `.github` passes); dangling symlink refused before any zone test.
- **Both comparison sides are realpath-resolved** (`repoReal`/`ufoReal`), so neither a symlinked child nor a symlinked parent/`repo`/`ufoRoot` can launder the write.
- It is a **denylist, not repo containment**: `stateDir: /etc/...` validates (`plan` exit 0). Any card claim must be "never writes the substrate / the repo root / `.git`", not "writes stay in the repo".
- A symlinked `stateDir` whose target is *outside* all zones is refused **later**, at `:727` inside a `try`, as `STATE_DIR_UNAVAILABLE` — after the wall was already opened.

## Unknowns
- `launch`-time `assertLaunchWriteTargets` was exercised by sibling lanes, not this one (plan-only here); bind-mount and ENOTDIR-intermediate root variants unprobed.
