# launch-env-guards — the `launch --env-file` guard chain and the rebinding

Asked: establish the ephemeral guards that bind an env-file launch and the
registration↔pane-start rebinding. Source: `scripts/ufo-sighting.mjs:32-82,
4555-4581, 2379-2405, 4193-4289, 4291-4334`; `scripts/ufo-sighting-lib/argv.mjs`.
Lane `LaunchEnvGuards` (reviewer, with a real `/tmp` harness + negative CLI
probes).

CLI parse (`--env-file`, 4555-4581): `launch` needs a command after `--`
(`INVALID_ARGUMENT`); the flag is resolved with `path.resolve` first (:4567), then
`loadMissionEnvironment` enforces the reader rules — non-absolute → `environment
file path must be absolute and canonical`; missing → `environment file is
missing`; symlink → `environment file must not be a symlink`; not owner-private →
`must be owner-only`; size `<2` or `> maxEnvironmentBytes` → `environment file
size is outside the policy bound`; bad JSON → `environment file is not valid
JSON`; extra keys → `environment variables contains unsupported fields`; a flag
whose value ≠ policy → `<key> must equal true`; unsupported schema →
`environment schema is unsupported`. `register` **cannot** bind an environment at
all (`--env-file` is off its allowlist → `register does not support --env-file`).

Launch-time guards (`launchMission` 2379-2405, real transcripts):
- Row 1 runs **before** `preflightArgvDispatch`. An env-file launch whose argv
  carries `-c`/`--continue`/`-s`/`--session` is refused
  `ephemeral OpenCode missions cannot continue or select a session` — typed
  `INVALID_ENVIRONMENT`, and it never reaches the OpenCode `export` probe, so no
  subprocess spawns for a refused ephemeral dispatch.
- `substrate !== "opencode"` **or** a non-null native session id →
  `ephemeral isolation requires one fresh direct OpenCode mission` (the
  non-OpenCode preflight return has no `nativeSessionId` key, so `undefined !==
  null` fires).
- `cwd !== <ephemeralRoot>/checkout` → `ephemeral mission cwd must be the
  prepared normal clone`.
- indirect dispatch (`bash -c 'opencode …'`) → `INDIRECT_OPENCODE_DISPATCH`; on
  success the row stores the preflight-normalized argv + `realpathSync`ed cwd
  (2400-2405).

Pane-start sandbox guards (4195-4235, real harness): non-opencode argv or
non-opencode substrate → `ephemeral sandbox accepts only directly attested
OpenCode argv`; wrong cwd → `ephemeral sandbox cwd is not the prepared clone`;
`bwrap` unresolvable → `SANDBOX_UNAVAILABLE`; OpenCode executable unresolvable →
`INVALID_OPENCODE_DISPATCH`; resolver snapshot out of root / symlink / size →
the resolver refusals; resolver target outside `/etc|/run` → `sandbox resolver
mount target is outside approved system roots`. The `4209-4211`
"canonical-or-beneath-ROOT" branch is **unreachable by a repo file** — a
non-`opencode` name is stopped by 4195 first; reaching it needs a real executable
named `opencode` beneath `ROOT`, so that branch is UNEXERCISED.

Rebinding (`newMission` :2090 binds `validateStoredEnvironment(spec.environment)`;
`runPane` :4351-4356): `loadMissionEnvironment(mission.environment.envFile,
{allowedMarkerStates:["registered"]})` then a **byte-identity** compare
`JSON.stringify(...) !== JSON.stringify(mission.environment)` →
`environment file changed after mission registration`. Any change to the file
between registration and pane start is refused.

Marker transitions (:2415, :2429, :2443, :4361, :4367, :4391). A row that dies
before `runPane` reaches :4367 is left parked at `registered`; destroy refuses it
by name (observed: `refusing to destroy a registered ephemeral root`, removed only
by `rm -rf`), matching `docs/EPHEMERAL-L1-MISSIONS.md:97`.

The rebinding predicate is `JSON.stringify` on both objects, so it is
**key-order sensitive**: a deep-equal but key-reordered environment object is
refused (harness: UNTOUCHED true, MANIFEST ROUND-TRIP true, KEY REORDER false,
TMPDIR SWAP false).

Sandbox namespace nuance (same harness transcript): `--dir /run` is emitted as an
empty namespace dir and `/run` is **never** `--ro-bind`ed, so the ambient
`/run/user/<uid>/…` tmux socket is absent inside the sandbox
(`tests/ufo-sighting.test.js:1436` pins the same property).

## Unknowns

- 4209-4211 branch unexercised (needs a planted `opencode` executable under
  `ROOT`).