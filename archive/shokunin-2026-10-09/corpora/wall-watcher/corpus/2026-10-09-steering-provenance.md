# 2026-10-09 — steering provenance (the steer store and what `source:"l0"` means)

**Asked:** document the steer record store: path, schema, modes, and the L0-vs-wall / in-pane distinction.

**Sources (exact; `ufo` = `/home/vgpnk/Projects/ufo-fsd-alpha`)**

- `ufo/scripts/ufo-sighting.mjs:3489-3509` — `appendSteerLog`; `:3511-3541` — `steerMission`.
- `ufo/scripts/ufo-sighting-lib/base.mjs:61, 63, 480-486` — `MAX_STEER_FILE_BYTES`, `MAX_TEXT_BYTES`, `readBoundedUtf8`.
- `ufo/scripts/ufo-sighting-lib/surface.mjs:141` — the published log contract.
- `ufo/scripts/ufo-l0-watch.mjs:913`; `ufo/scripts/ufo-stale-watchdog.mjs:866, 891` — L0 daemons driving the same CLI.
- `ufo/.omp/skills/ufo/SKILL.md:122-130, 153` — the relay/L0 prose.
- Live: `ls -la ufo/.ufo/sighting/steers/`, one JSONL line read.

**Observed**

- Store: `<stateDir>/steers/<mission.runId>.jsonl`, dir `0700` / file `0600`, append-only, keyed by
  **runId** (not mission id), one file per run. Created lazily (a state dir with zero steers has no
  `steers/` dir).
- Line schema (exact key order): `{ts, source, bytes, sha256, via}` — `ts` is the same ISO timestamp also
  written to the manifest row; `source` is the constant `"l0"`; `bytes` is the UTF-8 length of the delivered
  text; `sha256` is the hash of the delivered text (**the text itself is never stored**); `via` is
  `"text"` or `"file"`. Live sample:
  `{"ts":"…","source":"l0","bytes":391,"sha256":"92585d82…","via":"text"}`.
- One writer only (`appendSteerLog`), and it hardcodes `source:"l0"` — the CLI has no inbound `--source`.
  So `"l0"` denotes the L0 operator layer but is an **unauthenticated class label, not a provenance fact**:
  L0 software daemons drive the same CLI (`ufo-l0-watch.mjs`, `ufo-stale-watchdog.mjs`), so their automated
  steers are indistinguishable from a human operator's.
- The wall CLI `steer` **is** the in-pane path (delivery is `tmux send-keys -l` into the mission pane); there
  is no second, separate in-pane verb. But direct typing into a pane bypasses this CLI entirely (`__pane-run`
  spawns the mission child with `stdio: "inherit"`), so a raw keystroke reaches the mission with **no**
  `.jsonl` line and no `steerCount`/`lastSteerAt`/`lastSteerBytes` bump. Only CLI-recorded steers are
  auditable.
- The steer log is **unbounded** — no size check on append; `MAX_STEER_FILE_BYTES` (65 536) bounds only the
  `--text-file` **input**, and `MAX_TEXT_BYTES` (4096) bounds the delivered line.
- Ordering: delivery (tmux send-keys) happens before the log append and the manifest write; a failed append
  is typed loud `STEER_LOG_FAILED` (the line already reached the pane — provenance must not vanish silently).
- `steers/` is not pruned by any wall path.

**Changed:** nothing.

**Unknown:** whether any consumer trusts `source:"l0"` as authenticated; whether direct-pane keystrokes are
ever reconciled into the store by an external watcher (grep found none).