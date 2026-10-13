# auth-file-copy — the `--auth-file` arm

Asked: establish the auth-copy rules, bounds, destination, and the no-auth
default. Source: `scripts/prepare-ephemeral-l1.mjs:36,685-703`;
`tests/prepare-ephemeral-l1.test.js:422-517`. Lane `AuthFile` (reviewer).

Guard: `authFile !== undefined` (:685). With the flag absent, `data/opencode`
holds only the empty `opencode.db` and no auth is copied (doc:46).

Ordered checks:

| # | rule | line | message |
| --- | --- | --- | --- |
| 1 | absolute + `basename === policy.opencode.authFile` (`auth.json`) | 686-688 | `--auth-file must name an absolute auth.json` |
| 2 | raw `lstat` | 689 | missing path leaks **bare ENOENT** (not a contract message) |
| 3 | not symlink and regular | 690 | `auth file must be a real regular file` |
| 4 | size > 1 MiB | 691 | `auth file exceeds the 1 MiB bound` |
| 5 | owned by this uid (POSIX-conditional) | 692-694 | `auth file must be owned by this user` |
| 6 | EXCL copy + post-copy re-bound + chmod 0600 | 700-703 | (post-copy >1 MiB → bound message) |

`MAX_AUTH_FILE_BYTES = 1048576` (:36), strictly `>` so exactly 1 MiB passes.
Destination: `path.join(paths.XDG_DATA_HOME, "opencode", policy.opencode.authFile)`
= `<root>/<id>/isolation/data/opencode/auth.json` (:695); the dir chain is
pre-authored by the `OPENCODE_DB` dirname ensure + EXCL claim (:681-682).
`COPYFILE_EXCL` refuses a planted destination (the mission root is fresh, so no
retry path can legitimately reach it).

Not copied: ambient OpenCode config, skills, plugins, git/ssh credentials,
provider env. `environment.json` never spreads `process.env` (706-710) and holds
no credential values; the auth file's **path** only reaches the map via
`XDG_DATA_HOME`. Any refusal `rm -rf`s the mission root (:746-752), so a refused
auth never leaves a partial mission.

## Gaps

- The suite pins abs/basename/symlink/1 MiB (L436-469) but **not** the ownership
  refusal, the missing-file ENOENT passthrough, a non-string `authFile`, the
  exactly-1 MiB boundary, or EXCL on a planted destination.

## Unknowns

- The EXCL-on-planted-destination case is unconstructible by design.