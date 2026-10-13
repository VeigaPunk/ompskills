# 2026-10-09 — waitForOneClient and UFO_SIGHTING_ATTACH (AttachWait)

**Asked:** `waitForOneClient` (`ufo-sighting.mjs:2759-2772`), its callers,
the attach timeout, and where `UFO_SIGHTING_ATTACH=1` is consumed.

## Observed

- Poll: synchronous `do { listClients; ==1 return client; >1 →
  DUPLICATE_CLIENTS; sleep(50) } while elapsed < timeout` → `ATTACH_TIMEOUT`
  (`:2771`, message hardcodes `ufo_sighting:1` not `TMUX_TARGET`).
- Timeout: `boundedTimeoutMs(env.UFO_SIGHTING_ATTACH_TIMEOUT_MS,
  DEFAULT_ATTACH_TIMEOUT_MS=10_000, label)` (`base.mjs:71,255-262`) —
  lower-bound validation only; `" "`→0, `"1e308"` accepted, unset→10000.
- Early-fail: >1 clients on the first poll → `DUPLICATE_CLIENTS` (`:2768`);
  sibling sites `:2740` (pre-launch), `:2843` (respawn), `:2027` (status
  path).
- Callers: exactly `openWall` (`:2808`, after `launchOrFocusAttach :2807`)
  and `respawnTerminal` (`:2855`). `openWall` is reached from
  `launchMission` (`:2439`), `resumeMission` (`:3794`), `twinMission`
  (`:4032`), bare trigger (`:4428`), `open` verb (`:4448`). The operation
  lock is held across the wait — a giant timeout holds the wall hostage
  (other verbs → `WALL_BUSY` after `LOCK_TIMEOUT_MS` 10 s).
- `UFO_SIGHTING_ATTACH=1`: set only on the spawned launcher's env
  (`:2749`,`:2755`); consumed by the shim `scripts/ufo-sighting:26-36` —
  `"1"` + zero args → `exec tmux [-L socket] attach-session -d -t
  ufo_sighting:1`; the `-d` detaches other clients. Node `main:4400-4401`
  rejects `=1` + argv → `INVALID_ATTACH_ROUTE` (test-pinned :3884-3912).

## Unknowns

- Env propagation of `UFO_SIGHTING_ATTACH` through uwsm-app →
  xdg-terminal-exec → terminal → shim (not traced end-to-end).
- `attach-session -d` detaching behavior per the tmux man page (inference).
- 2 s `spawnDetached` confirm-fallback timing on slow launchers.

Confidence: high for the code contract; medium for lock-hold reachability.
