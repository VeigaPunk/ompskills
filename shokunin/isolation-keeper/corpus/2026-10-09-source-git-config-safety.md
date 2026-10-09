# source-git-config-safety — the executable-config sentinel and the scrubbed git env

Asked: establish the threat model in code around `assertSourceGitConfigSafe`.
Source: `scripts/prepare-ephemeral-l1.mjs` (32, 178-240, 557-581, 659-677) +
`tests/prepare-ephemeral-l1.test.js:1320-1343`. Lane `GitConfigSentinel`
(sentinel).

`DANGEROUS_SOURCE_GIT_CONFIG` (:225), verbatim:

```
/^(core\.(fsmonitor|hookspath|sshcommand|pager)|extensions\.worktreeconfig|include(\.if)?|uploadpack\.|filter\.|diff\.|alias\.)/u
```

Start-anchored; the trailing-dot families are prefix matches. Refusal message
(:237): `source git config refuses executable key: ${key}`.

Call order: `validateSource` (557) realpaths/stats, then calls
`assertSourceGitConfigSafe(canonical)` at 562 — the module's **first**
source-side git invocation, before `rev-parse` (563). `createEphemeralL1`
validates the id regex (662) before any git at all, and the guard precedes
`snapshotCheckout`'s clone/diff/ls-files.

**Correction (round 2):** the guard runs `git config --local --list` with
`allowStatus [0,1]` and inspects **stdout only** (:227-230). A malformed
`.git/config` is therefore **not** shown to fail closed here — a `/tmp` probe
returned status 0 with the parse error on stderr and the guard passed; the later
`rev-parse` is what fails. Do not claim this stage refuses a malformed config.

Why `extensions.worktreeconfig` is refused outright: with it on, a
`.git/config.worktree` `core.fsmonitor` is invisible to `git config --local
--list` (the sentinel's read) but visible to merged reads — a live bypass.
Same second-hand invisibility demonstrated for `include.path`. Both proven with
`/tmp` repos: 11/11 families (fsmonitor, hookspath, sshcommand, pager,
worktreeconfig, include.path, includeif, uploadpack, filter, diff.external,
alias.sh) refused in real `validateSource` transcripts.

`scrubbedGitEnvironment` (178-192) is a **full env replacement** (not a
merge): PATH/LANG/LC_ALL/TMPDIR passed through with defaults, then
`GIT_CONFIG_GLOBAL=/dev/null`, `GIT_CONFIG_SYSTEM=/dev/null`,
`GIT_TERMINAL_PROMPT=0`, and `SSH_AUTH_SOCK`/`GIT_ASKPASS`/`GH_TOKEN`/
`GITHUB_TOKEN` set empty; everything else is cleared — `HOME` is absent, a
second block on global config. Poisoned `GIT_DIR`/`GIT_CONFIG_GLOBAL` in
`process.env` are ignored (transcripts).

`git` (:194-212): `maxBuffer = MAX_GIT_OUTPUT = 64 MiB` (:32,200) — a 65 MiB
`cat-file` threw `spawnSync git ENOBUFS` (never a truncated return);
`timeout: 600_000` (kill path not executed); `allowStatus` whitelists exit
statuses only, `result.error` throws regardless; fallback message `git ${args[0]}
failed` renders as the odd `git -C failed`. `gitOutput` returns stdout.

## Residuals

- The guard runs **once**, before `snapshotCheckout`; there is no re-check
  before the diff/clone (TOCTOU note).
- Tests pin only 2/11 families (`core.fsmonitor`,
  `uploadpack.packobjectshook` lowercased) plus zero-mission-dir assertions;
  the test harness uses a different env scheme, so it does not pin
  `scrubbedGitEnvironment`.
- `ufo-sighting.mjs`/lib never import these symbols; the guard is reached via
  the CLI `create` path only.