# bwrap-argv — the sandbox argv, token by token

Asked: reconstruct the exact bwrap argv with line numbers. Source:
`scripts/ufo-sighting.mjs:4149-4288`; `config/ephemeral-l1.machine.json:15-51`;
`tests/ufo-sighting.test.js:1398-1437`. Lane `BwrapArgv` (mutation-tester).

Assembly order (`buildEphemeralSandboxDispatch`, 4236-4287):

1. `--die-with-parent` (4237), `--new-session` (4238), `--unshare-user` (4239),
   `--unshare-ipc` (4240), `--unshare-pid` (4241), `--unshare-uts` (4242),
   `--unshare-cgroup-try` (4243), `--clearenv` (4244).
2. per `readonlySystemPaths` entry (4247-4258): absent → skip; symlink →
   `--symlink <readlink(p)> <p>`; directory → `--dir <p> --ro-bind <p> <p>`;
   else `environmentFail`.
3. `--dir <namespaceDir>` for each sorted parent directory not already covered by
   `mountedSystemRoots` (4277-4279).
4. `--proc /proc --dev /dev` (4280).
5. `--bind <d> <d>` × 6 — the **writable** set (4281): `mission.cwd`
   (`<root>/checkout`), `HOME`, `XDG_DATA_HOME`, `XDG_CACHE_HOME`,
   `XDG_STATE_HOME`, `TMPDIR`.
6. `--ro-bind <d> <d>` — the single **readonly** dir `XDG_CONFIG_HOME` (4282).
7. `--ro-bind <extraExecutable> <extraExecutable>` — only if the OpenCode
   executable is not covered by the mount set (4269-4271, 4283).
8. `--ro-bind <resolverSnapshot> <resolverMountTarget>` (4284).
9. `--chdir <mission.cwd>` (4285).
10. `--setenv <K> <V>` per `variables` (4286).
11. `-- <executablePath> <argv.slice(1)>` (4287).

Note there is **no `--unshare-net`**: the child shares the host network
namespace; the resolver snapshot is bound in because network is intended.

Writable set: the mission's own checkout + its isolation home/data/cache/state/tmp
— nothing else. Readonly set: the isolation config dir (containing the
OpenCode config, agents, resolver snapshot) + the policy's system roots.

Cleared child environment (`ephemeralChildEnvironment` 4179-4191 + `--clearenv`
4244): `policy.childEnvironment` (PATH; `GIT_CONFIG_GLOBAL/SYSTEM=/dev/null`;
`GIT_TERMINAL_PROMPT=0`; empty `SSH_AUTH_SOCK`/`GIT_ASKPASS`/`GH_TOKEN`/
`GITHUB_TOKEN`) overlaid by `environment.environment` (the 8 path keys + 3
flags), then `TERM=xterm-256color` and the five `UFO_SIGHTING_*` keys. The
ambient `process.env` is not inherited.

Refusals: `SANDBOX_UNAVAILABLE` when `bwrap` is unresolvable (4206),
`INVALID_OPENCODE_DISPATCH` when the OpenCode executable is unavailable (4208),
`environmentFail` (`INVALID_ENVIRONMENT`) for a non-opencode argv (4195), a
cwd that is not `<root>/checkout` (4199), an executable under the canonical
checkout root (4209-4211), a snapshot outside the root (4218-4219), a snapshot
symlink (4221-4222), a size-bound trip (4224-4225), an unapproved resolver
target (4231-4234), or an unsupported system path (4256).

## Unknowns

- bwrap's own flag semantics (never executed); host-dependent system-path and
  resolver-target status.