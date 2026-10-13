# cli-verbs-argv — the create/destroy CLI surface

Asked: enumerate verbs, flags, exit codes, and the envelope. Source:
`scripts/prepare-ephemeral-l1.mjs:895-961`;
`tests/prepare-ephemeral-l1.test.js:1280-1311`. Lane `CliVerbs` (scout).

Verbs: `create` (`--source`, `--id`, `--auth-file`; reject at :926) and `destroy`
(`--root`, `--parent-root`, `--force`; reject at :930). Any other flag →
`create does not support --<key>` / `destroy does not support --<key>`.

`parseOptions` (:895-910) is strict: every flag consumes the next argv token as
its value (no `--key=value`, no valueless flag); a value starting with `--` is
refused (`<flag> requires a value`); a repeated flag is refused (`invalid or
repeated option: <flag>`); a bare positional or a bare `--` is refused
(`unexpected argument: <arg>`). `--help` is not supported and falls through to
the usage error.

Exit codes: success `0`; **every** error `2` — there is no distinct usage exit.
Success writes `JSON.stringify(main(), null, 2)` to stdout (:957); failure writes
`JSON.stringify({ error: error.message })` (one key, no `code`) to stderr
(:959-961).

`create` result keys (6, :739-744): `clone`, `isolationRoot`, `envFile`,
`cleanupCommand`, `sourceHead`, `snapshotDigest`. `destroy` result keys:
`destroyed`, `sourceHead`, `snapshotDigest`, plus `forced: true` on the force
path. `cleanupCommand` = `[process.execPath, MODULE_PATH, "destroy", "--root",
missionRoot]` (:742).

`--force` coerces only literal `"true"` or `"1"` (:939); any other value parses
as ordinary destroy. `main` reads the policy only after the command is known
(:913) so command/option errors never depend on the policy file. The CLI
**always** creates under the policy-configured root (the policy is the
containment authority for *where* missions live); embedders needing a custom
root call `createEphemeralL1` directly.

Real transcripts (no FS side effects): `[]`, `--help`, `bogus`, `destroy`
(→ `destroy requires a root`), `create --root /tmp/nope` (→ `create does not
support --root`), `create --id` (→ `--id requires a value`), duplicate `--id`,
bare positional, `--`, `--id=foo` — all exit 2 with the JSON envelope above.
`destroy --root /tmp/probe-nope` fails on the configured root with a raw
`ENOENT ... '/scratch'`.

## Unknowns

- Whether an external consumer parses prepare's stderr expecting a `code` field
  (none exists).