# 2026-10-09 — the full verb/route surface (public, extras, hidden, shim)

**Asked:** enumerate the complete verb surface of the wall CLI, and document the native-trial entry,
the hidden verbs, and the shim routes.

**Sources (exact; `ufo` = `/home/vgpnk/Projects/ufo-fsd-alpha`)**

- `ufo/scripts/ufo-sighting.mjs:4399-4700` — `main()` dispatch, read top-to-bottom.
- `ufo/scripts/ufo-sighting-lib/surface.mjs:74-232, 256-292, 303-308` — manifest `verbs`/`extras`,
  `USAGE_LINES`, `VERB_USAGE_INDEX`, `usageForVerb`.
- `ufo/scripts/ufo-sighting:26-36, 38-66, 68-71, 73-92, 94` — the shim routes.
- `ufo/scripts/ufo-sighting.mjs:2052-2062` — `dispatchArgv`; `ufo/scripts/ufo-sighting-lib/surface.mjs:318-325` — `runLegacyNativeDirect`.
- `ufo/config/ufo.json:51-55, 73` — `sighting.triggers`, `sighting.autoRegisterInvokedNativeTrial`.
- Probes: `surface --help` (0), `help` (0), `bogus-verb` (2, typed), `bogus-verb --help` (0), per-verb
  `--help` over 14 verbs (all 0); `tmux list-panes` start commands.

**Observed**

- Dispatch precedence inside `main()` (literal order): `UFO_SIGHTING_ATTACH=1` zero-arg guard →
  `__idle` → `__pane-run <id>` → `__reconcile [--delay N]` → hatch-trigger short-circuit → verb `--help` →
  named verbs (`open`, `surface`, `status`, `overview`, `reconcile`, `respawn-terminal`, `inquiry`,
  `launch`, `register`, `twin`, `remove`, `resume`, `complete`, `steer`, `peek`) → `help` → `--run-id`
  native-trial route → legacy native direct. The three `__*` verbs are matched first, so a verb name or a
  hatch phrase can never shadow them.
- Public verbs (manifest `verbs` + usage): `open`, `surface --json`, `status [--lite]`,
  `overview [--watch] [--width N]`, `reconcile`, `respawn-terminal [--geometry]`,
  `inquiry --prompt --session-dir [--slug] [--no-open]`,
  `launch --run-id --session-id [--title --fleet --env-file --no-open --auto-open|--no-auto-open --relay
  --runner-reservation] -- COMMAND`, `remove --mission`, `resume --mission -- COMMAND`,
  `complete --mission [--note] [--dry-run]`, `steer --mission (--text|--text-file)`,
  `peek --mission [--lines N]`.
- Public extras (manifest `extras`, **no** `states` map): `register --run-id --session-id [--pane-id %N
  --title --substrate --cwd --runner-reservation --geometry --relay] -- COMMAND`, `twin --origin
  [--run-id --session-id --title --runner-reservation --geometry --no-open]`, `help`.
- Hidden (in neither usage nor manifest): the hatch triggers (whole argv joins to one of
  `sighting.triggers` → `open`, no flags); `__idle` (prints `"UFO Sighting\nNo active missions. The hatch
  is open.\n"`, blocks on `setInterval`); `__pane-run <missionId>` (the mission pane wrapper; missing id →
  `INVALID_ARGUMENT`); `__reconcile [--delay ms]` (0..60000, else `INVALID_ARGUMENT`); the `--run-id`
  native-trial route (any argv reaching the end with `--run-id` before a `--`); the legacy native-direct
  path (empty argv or `argv[0]` starting with `--`). Shim-only routes: `UFO_SIGHTING_ATTACH=1` + zero
  args (attach), `--ufo-sighting-inquiry-direct DIR SLUG PROMPT` (strict arity 4),
  `--ufo-sighting-native-direct …`, `--inquiry PROMPT_FILE` (arity 2); everything else falls through to
  `exec node … ufo-sighting.mjs "$@"`.
- The mission goal's verb list is accurate but partial: all nine named verbs exist; the goal omits
  `surface`, `respawn-terminal`, `inquiry`, `register`, `twin`, `resume`, `help`, the triggers, and the
  hidden/legacy routes. No named verb is missing.
- Usage-line drift: `launch`/`register`/`twin`/`resume` accept (and the surface manifest lists)
  `--substrate`, `--cwd`, `--geometry`, `--title`, `--runner-reservation` that the usage line omits; for
  `complete` the usage line carries `--dry-run` that the surface descriptor omits. Take the flag contract
  from the `rejectUnknownOptions` allowlists, and `surface --json` as the machine-readable authority.
- `<verb> --help`/`-h` exits 0 for every verb **including unknown ones** (full usage fallback); only the
  first token after the verb counts, so `status --lite --help` fails `missing value for --help`.
  `bogus-verb` alone is the typed `INVALID_ARGUMENT` (exit 2). A leading-dash argv is treated as the
  legacy native-trial path, so an unknown *flag* is not a verb-level error.
- `--run-id` native route: validates `NATIVE_RUN_ID_PATTERN` (1–16 chars) and launches
  `dispatch: {kind:"native-trial"}` with `open:true`. The `native-trial` kind has exactly two producers:
  this hidden route and a twin of a native row. `sighting.autoRegisterInvokedNativeTrial` gates only
  `run-omp-native-trial.mjs`'s interactive launch (the launcher→wall handoff uses the documented `launch`).
- Live pane start commands confirm the vocabulary: `%2` `overview --watch`, `%0` `__idle`, and all 8
  window-2 panes `__pane-run m_<32hex>`.

**Changed:** nothing.

**Unknown:** the end-to-end exit/stdout of `ufo-sighting --bogus-flag` (the legacy path hands off to
`run-omp-native-trial.mjs`, which predicts a plain-text `BLOCKED` at exit 2 — not observed).