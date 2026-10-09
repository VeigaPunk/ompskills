# verbs-and-usage — the launcher's verb surface

Asked: the verbs, their default, per-verb flags, and the usage-error shape.
Source: `sighting/tower-fleet.mjs` @ b251c5a. Lane: `VerbsUsage`.

- Verb set is a literal: `const VERBS = new Set(["plan", "launch", "status", "close"]);` (:96).
- The verb is positional and first; when argv[0] is absent or starts with `-` the default is
  `plan` (:1236-1237) — a flag-first argv still plans.
- `--spec <fleet.json>` is required for every verb (:1263 `--spec is required`); a missing value
  is a usage error (:1245); a duplicate `--spec` last wins (:1246).
- `--apply` is accepted by all four verbs but required by `launch`/`close`: without it
  `parseArgs` raises `MUTATION_REQUIRES_APPLY` exit 2 (:1266-1268) before `main()` reads the spec
  or touches the wall.
- `--json` — all four. `--mission <id>` and `--force` — `close` only (:1264, :1265).
  `--help`/`-h` — banner to stdout, exit 0 (:1256-1258). Any other token → `usageExit` (:1260).
- Usage error = exit 64, stderr exactly two lines: `{"ok":false,"code":"USAGE","message":...}`
  then the usage banner (:109-115). Banner (:112):
  `usage: node sighting/tower-fleet.mjs [plan|launch|status|close] --spec <fleet.json> [--apply] [--mission <id>] [--force] [--json]`.
- Guard order: spec-required precedes the mission/force guards, which precede
  `MUTATION_REQUIRES_APPLY`; usage refusals outrank it.

Evidence: lane `VerbsUsage` (real transcripts for every refusal).
