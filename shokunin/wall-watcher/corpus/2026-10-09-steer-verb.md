# 2026-10-09 — `steer` verb (wall CLI)

**Asked:** document the wall CLI `steer` verb end to end as the overfit case for this corpus:
flag contract, bounds, typed refusals, and the record it leaves behind.

**Sources (exact; substrate root `= /home/vgpnk/Projects/ufo-fsd-alpha`)**

- `scripts/ufo-sighting.mjs:4659-4666` — the `steer` branch:
  `rejectUnknownOptions(options, ["mission","text","text-file"], "steer")`, `--mission` required.
- `scripts/ufo-sighting.mjs:3511-3541` — `steerMission`.
- `scripts/ufo-sighting.mjs:3427-3440` — `assertLiveSteerable`.
- `scripts/ufo-sighting.mjs:3442-3463` — `readSteerText`.
- `scripts/ufo-sighting.mjs:3465-3479` — `validateSteerLine`.
- `scripts/ufo-sighting.mjs:3481-3487` — `steerSendText`.
- `scripts/ufo-sighting.mjs:3489-3509` — `appendSteerLog`.
- `scripts/ufo-sighting-lib/base.mjs:61` — `MAX_STEER_FILE_BYTES = 65_536`;
  `:63` — `MAX_TEXT_BYTES = 4096`; `:302` — `stateDir()` (`UFO_SIGHTING_STATE_DIR` override,
  default `<ROOT>/.ufo/sighting`).

**Observed**

- Shape: `ufo-sighting steer --mission <id> (--text <line> | --text-file <path>)`. Exactly one of
  `--text` / `--text-file`, else `INVALID_ARGUMENT`.
- The mission must be live (`isLiveStatus` — `starting`/`running`), else `MISSION_NOT_LIVE`; its owned
  pane must not be in copy mode (checked with `display-message -p '#{pane_in_mode}'`), else `PANE_IN_MODE`.
  send-keys into a copy-mode pane exits 0 but never reaches the foreground process, hence the explicit
  refusal instead of a phantom steer.
- Text rules (`validateSteerLine`): exactly one line (no `\n`/`\r`), no control characters
  (`\x00-\x1f`, `\x7f-\x9f`), non-empty after trim, UTF-8 length ≤ 4096 bytes → otherwise
  `INVALID_STEER_TEXT`. `--text-file` is read with `readBoundedUtf8(file, 65_536)` and one trailing
  `\r?\n` is stripped before the 4096-byte rule applies.
- Delivery: one tmux invocation, text and Enter atomic against pane death —
  `send-keys -t <pane> -l -- <escaped text> ; send-keys -t <pane> Enter`. A trailing `;` in the text is
  escaped by `steerSendText` while preserving a preceding backslash run.
- Record: appends `<stateDir>/steers/<runId>.jsonl` (dir created `0700`, file `0600`) with one JSON line
  `{ts, source:"l0", bytes, sha256, via: "text"|"file"}`; then updates manifest fields `steerCount`,
  `lastSteerAt`, `lastSteerBytes` and writes the manifest under the operation lock. A failed log append
  is typed loud `STEER_LOG_FAILED` (the line already reached the pane — provenance must not be lost
  silently).
- Result envelope: `{ ok: true, mission, paneId, steerCount }`.
- Live evidence: `ls -la <ufoRoot>/.ufo/sighting/steers/` — one `<runId>.jsonl` per steered mission, mode
  `-rw-------`, e.g. `tf-audit-band.jsonl` 149 B (one line).

**Changed:** nothing in the substrate (read-only research).

**Unknown / next:** the exact L0 in-pane steer route that also writes `source:"l0"` (if it is distinct
from this wall-CLI verb); whether a `--text-file` path is constrained to the repo tree.