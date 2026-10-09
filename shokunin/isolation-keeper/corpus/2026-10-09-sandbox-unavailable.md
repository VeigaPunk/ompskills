# sandbox-unavailable — resolution, the typed refusal, and the no-prepend verdict

Asked: how the sandbox executable is resolved, what makes it unavailable, and
whether bwrap is prepended to the child argv. Source:
`scripts/ufo-sighting.mjs:4149-4163,4195-4211,4206`;
`scripts/ufo-sighting-lib/argv.mjs:131-133`. Lane `SandboxUnavailable` (sentinel).

`resolveExecutablePath` (:4149-4163) is module-private. A slash-containing
command → one candidate `path.resolve(cwd, command)`; a bare name → search
`path.delimiter`-split candidates, `filter(Boolean)`, first match wins. Each
candidate: `realpathSync` (symlink resolved; dangling/ENOENT/EACCES swallowed),
then `statSync` — must be a regular file with `mode & 0o111 !== 0`; returns the
canonical realpath.

Sandbox call site (:4201-4205): `resolveExecutablePath(policy.sandbox.executable
= "bwrap", mission.cwd, policy.childEnvironment.PATH)`. The PATH is the **frozen
policy PATH** (`/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin`),
**not** `process.env.PATH`; the operator PATH is irrelevant. `pathVariables`
excludes PATH and the stored-env exact-key check forbids `PATH`, so the
resolution PATH and the injected `--setenv PATH` are the same string.

Refusal (:4206): `if (!sandboxPath) fail("SANDBOX_UNAVAILABLE", \`${...executable}
is required for ephemeral missions\`)` → rendered `bwrap is required for ephemeral
missions`; `fail` throws a `SightingError` (base:247-249). Sibling guards
:4195-4199/:4209 use `environmentFail` → `INVALID_ENVIRONMENT`. Surfacing:
`runPane` rethrow (:4360-4363) → `main` :4410 → `emitFatal` writes
`{ok:false,code:"SANDBOX_UNAVAILABLE",message}` to stderr, exit 2 (source trace,
not runtime-exercised).

Prepend verdict: bwrap is **not** prepended to the child argv, and the child argv
must **not** already invoke it. Assembled return (:4287-4288):
`args.push("--", executablePath, ...argv.slice(1)); return { command: sandboxPath,
args, env: variables }`. `runPane` spawns `spawn(sandbox.command, sandbox.args,
{cwd: mission.cwd, env: childEnvironment, stdio:"inherit"})` (:4364-4373), so the
OS argv is `[canonical-bwrap, flags…, "--", executablePath, ...]`. A `bwrap`
argv[0] fails the gate `!isOpenCodeExecutable` (:4195-4196) → `INVALID_ENVIRONMENT`
("ephemeral sandbox accepts only directly attested OpenCode argv") before sandbox
resolution. `isOpenCodeExecutable` (argv.mjs:131-133) is **basename-based**
(`basename === "opencode"` or the resolved name), so any file named `opencode`
passes. The OpenCode executable itself resolves against `process.env.PATH`
(:4207); missing → `INVALID_OPENCODE_DISPATCH` (:4208); inside the canonical
repo → `environmentFail` (:4209-4211).

Failure mode when PATH lacks the executable: `SANDBOX_UNAVAILABLE` fires before
any write or spawn inside the builder; the only mutation on this path is the
`runPane` catch's marker rollback `registered→prepared` (:4361);
`stopMission` is unreachable, the mission row is untouched, no sandbox exists.

Unavailable conditions: absent from every policy-PATH dir; present but
non-regular or no exec bits; dangling symlink; all candidate dirs unreadable
(EACCES swallowed); `childEnvironment.PATH` empty/absent (zero candidates).

## Boundary finding

`readEphemeralPolicy` (base.mjs:211-224) never validates `sandbox.executable`;
shape enforcement is prepare-side only (:143-149). A truthy sandbox without
`executable` still boots, then a raw TypeError at :4150 surfaces as
`UNEXPECTED_ERROR`, not `SANDBOX_UNAVAILABLE` [trace, not runtime-exercised].