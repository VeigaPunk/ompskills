# 2026-10-09 — `inquiry` verb and its shim routes

**Asked:** document the `inquiry` verb and its shim routes — flags, id derivation, byte caps, snapshot.

**Sources (exact; `ufo` = `/home/vgpnk/Projects/ufo-fsd-alpha`)**

- `ufo/scripts/ufo-sighting.mjs:4518-4553` — the `inquiry` branch (id derivation at `:4543-4544`, envelope `:4552`).
- `ufo/scripts/ufo-sighting.mjs:2052-2059` — `dispatchArgv` for the internal route; `:4336-4341` — `runPane`.
- `ufo/scripts/ufo-sighting.mjs:2372-2373, 2415-2420` — `launchMission` default `open:true`, the `WALL_NOT_OPEN` gate.
- `ufo/scripts/ufo-sighting.mjs:3933-3938` — twin sessionDir remap.
- `ufo/scripts/ufo-sighting` (shim) `:38-42, 57-65, 73-92` — `--ufo-sighting-inquiry-direct` (strict arity 4),
  the prompt snapshot, the `--inquiry` route.
- `ufo/scripts/ufo-sighting-lib/base.mjs:57, 264-266, 377-387` — `MAX_INQUIRY_PROMPT_BYTES = 1_048_576`,
  `sha`, `sanitizeTitle`.
- `ufo/config/ufo.json` — `sighting.autoOpenWall: true`.
- Tests: `ufo/tests/ufo-sighting.test.js:1237-1238, 1281-1284`.
- Probe: `inquiry --help` → `usage: ufo-sighting inquiry --prompt PATH --session-dir DIR [--slug SLUG] [--no-open]`, exit 0.

**Observed**

- Flags: `--prompt PATH` and `--session-dir DIR` (both required; missing → `INVALID_ARGUMENT`),
  `--slug SLUG` (default `"inquiry"`, passed through `sanitizeTitle`), `--no-open` (bool; `open =
  options["no-open"] !== true`, so the default opens).
- Id derivation: `runId = "inq_" + slug(non-safe→"_").slice(0,38) + "_" + sha256(`${promptPath}:${sessionDir}`).slice(0,8)`;
  `sessionId = "inquiry-" + sha256(sessionDir).slice(0,20)`. The `:`-join is unescaped `[INFERENCE]`.
- Prompt byte cap is enforced **twice**: (a) at the verb, `statSync(promptPath).size > MAX_INQUIRY_PROMPT_BYTES`
  → `INVALID_INQUIRY`; (b) at pane exec in the shim, `head -c 1048577` then `wc -c` rejects > 1048576
  (boundary parity: exactly 1 048 576 accepted on both sides). The manifest records the **original**
  `promptPath`; the shim hands omp a private snapshot `$SESSION_DIR/.inquiry-prompt.snapshot` (mode 600)
  via `@file` to avoid E2BIG and preserve NULs/trailing newlines.
- The prompt must be an existing file; `INVALID_INQUIRY` otherwise.
- Internal route `--ufo-sighting-inquiry-direct`: strict arity `$# -eq 4`; slug re-stripped of control
  characters before the OSC title; `dispatchArgv` builds exactly `[SHIM_PATH,
  "--ufo-sighting-inquiry-direct", sessionDir, slug, promptPath]`; `runPane` spawns it. `--inquiry`
  (shim) resolves `--prompt` + a session dir and execs `ufo-sighting.mjs inquiry …`, and never forwards
  `--no-open`.
- `--no-open` vs the `WALL_NOT_OPEN` gate: the gate keys on `autoOpenWall` (config `true`), not on `open`;
  `--no-open` only suppresses the post-launch hatch.
- The inquiry dispatch kind skips `preflightArgvDispatch` (gated on `kind === "argv"`).
- Live: the manifest held 27 missions with **0** inquiry rows; all 8 live panes are `__pane-run` argv
  dispatches. `ufo/docs/ufo-sighting-terminal-respawn.md` has zero inquiry mentions
  (`docs/BEHAVIOR-MATRIX.md:225` is the only prose).

**Changed:** nothing.

**Unknown:** whether a twin re-applies the inquiry id formula to its remapped `sessionDir` (nit: no code
re-applies it); whether the `:`-join can collide for crafted prompt/session pairs.