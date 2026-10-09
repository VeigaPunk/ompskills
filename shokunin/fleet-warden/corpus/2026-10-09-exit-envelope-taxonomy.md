# exit-envelope-taxonomy — exit codes and the typed refusal envelope

Asked: the exit constants, the refusal envelope, and the fallback path.
Source: `sighting/tower-fleet.mjs` @ b251c5a. Lanes: `ExitEnvelope`, `VerbsUsage`.

- `EXIT_OK = 0` (:88), `EXIT_TYPED = 2` (:89), `EXIT_USAGE = 64` (:90).
- `class TypedError extends Error` (:98) carries `code`; `typed(code, message)` throws it (:105).
- Top-level catch (:1298-1305): a `TypedError` writes exactly one JSON line `{ok:false, code,
  message}` to **stderr** and exits 2; anything else writes `code:"UNEXPECTED_ERROR"`, exit 2.
  Stdout is empty on refusal. `warn()` lines may precede the envelope on stderr, so a parser must
  read the LAST line.
- `run()` (:507-517) turns a spawn `ENOENT` into `COMMAND_MISSING`; a non-ENOENT error falls
  through to `status ?? 127`.
- `usageExit` (:109-115) is the only 64 path — typed `{code:"USAGE"}` JSON + the usage banner,
  both on stderr, exit 64.

Precedence (pinned by the suite): usage 64 outranks the apply guard 2; spec-read `INVALID_SPEC`
outranks `CONFIG_UNREADABLE` (main order :1279 → :1286 → :1287); the L1 ceiling outranks the pane
ceiling (:337 before :340).

Suite gaps: `COMMAND_MISSING`, `UNEXPECTED_ERROR`, `LAUNCH_PARTIAL`, `WALL_STATUS_FAILED`, and
`STATE_DIR_UNAVAILABLE` are source-only — the suite does not pin them.

Evidence: lane `ExitEnvelope` (real transcripts for no-spec 64, missing-spec 2, COMMAND_MISSING 2).
