# create-layout-perms — the mission root layout and the owner-only discipline

Asked: quote the laid-out tree, the permission enforcement, and the marker
write. Source: `scripts/prepare-ephemeral-l1.mjs:255-283,442-535,659-752`;
`config/ephemeral-l1.machine.json`. Lane `CreateLayout` (scout).

Layout (`createEphemeralL1` 659-752):

| path | writer | mode |
| --- | --- | --- |
| `<configuredRoot>/<id>/` | `mkdirSync` atomic claim :670 | 0700 |
| `checkout/` | `snapshotCheckout` :678; `chmod 0700` :618 | 0700 |
| `isolation/` | `ensurePrivateDirectory(..., configuredRoot)` :679 | 0700 |
| `isolation/{home,config,data,cache,state,tmp}` | `environmentPaths` loop :681 | 0700 |
| `isolation/config/opencode/` (+ `agents/`) | `prepareOpenCode` :469-471 | 0700 |
| `isolation/config/sandbox-resolv.conf` | `snapshotResolver` :454/459/464 | 0600 |
| `isolation/data/opencode/opencode.db` | `writeFileSync ""` :682 | 0600 |
| `isolation/data/opencode/auth.json` | only `--auth-file` :695-703 | 0600 |
| `isolation/config/opencode/{opencode.json,.gitignore,agents/*.md}` | `prepareOpenCode` :515/534/483/508 | 0600 |
| `isolation/environment.json` | :711/714/715 | 0600 |
| `.ufo-ephemeral-l1.json` | :729/736/737 | 0600 |

Every file write uses `O_EXCL|O_NOFOLLOW` + `flush:true` then `chmod`.
`ensurePrivateDirectory` (255-283): mkdir `0700` if absent, O_NOFOLLOW open,
`fstat` directory check, uid check, `fchmod 0700`, then a realpath containment
check against `within` (`resolves outside the configured root`). `mkdirSync` is
the atomic mission claim — EEXIST → `ephemeral mission already exists: <id>`;
on any later failure the whole root is `rm -rf`'d before the error re-throws
(748-752).

Marker write (:717-737): the 10-field document below, `state: "prepared"`,
`activePids: []`, bounded by `maxEnvironmentBytes` (:733-735, the same bound
destroy enforces so a later policy shrink cannot strand an oversized mission).

Note: `envFile` is the literal `isolation/environment.json` (:711) — the
consumer's `beneath()` is strict, and the file sits one private directory deep
under the root, satisfying the chain check.

## Unknowns

- `flush:true` durability is asserted by comment, not measured.