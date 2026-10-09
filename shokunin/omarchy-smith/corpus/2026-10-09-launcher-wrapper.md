# 2026-10-09 — omarchy-launch-or-focus-tui wrapper (LauncherChain)

**Asked:** argv contract of `~/.local/share/omarchy/bin/omarchy-launch-or-focus-tui`,
appId derivation, handoff, metadata convention, behavior when invoked with the
ufo-sighting shim.

## Observed

- File: 9 lines. `:6` `APP_ID="org.omarchy.$(basename "$1")"`; `:7`
  `LAUNCH_COMMAND="omarchy-launch-tui $@"` (unquoted join); `:9`
  `exec omarchy-launch-or-focus "$APP_ID" "$LAUNCH_COMMAND"`. No arg
  validation, no `set -e`.
- `$1` may be a path — only basename feeds the appId; `$@` becomes one string
  and is re-split by `eval` downstream, so spaced paths break the re-split.
- Invoked as `omarchy-launch-or-focus-tui /path/to/ufo-sighting`:
  appId/pattern `org.omarchy.ufo-sighting`; launch argv
  `omarchy-launch-tui /path/to/ufo-sighting`; basename `ufo-sighting` is what
  makes the derived appId equal `APP_ID` in `ufo-sighting-lib/base.mjs:39`.
- Zero args: `basename` errors on stderr, then still execs
  `omarchy-launch-tui` with an empty command — exit 0, no error exit.
- Metadata: `# omarchy:<key>=<value>` lines after shebang; `bin/omarchy`
  (parser ~150-207) reads keys group,name,summary,args,examples,aliases,
  hidden,requires-sudo. The omarchy SKILL.md does not document the launcher
  family.
- Wall side: `ufo-sighting.mjs:2749` `launchTerminal(configured,[SHIM_PATH])`
  with `UFO_SIGHTING_ATTACH:"1"`; `:2746` `UNSAFE_LAUNCH_PATH` regex gate
  protects the downstream `eval`.

## Unknowns

- Live `--app-id` class assignment through real uwsm-app/xdg-terminal-exec was
  stub-verified, not live.
- `;`/quote handling through the eval re-parse is source inference.

Confidence: high for argv/appId/handoff; medium for edge quoting.
