# 2026-10-09 — the live wall and the wall test suites

**Asked:** observe the live wall read-only and record ground truth; mine the wall test suites for the
behaviour contract a card author must not contradict.

**Sources (exact; `ufo` = `/home/vgpnk/Projects/ufo-fsd-alpha`)**

- Live probes (all exit 0): `tmux list-sessions`, `tmux list-windows -t ufo_sighting`,
  `tmux list-panes -a -t ufo_sighting -F '…pid/dead/cmd'`, `tmux show-options -t ufo_sighting`,
  `tmux show-options -t ufo_sighting -v @ufo_sighting_{wall_id,owner,protocol}`,
  `tmux show-options -p -t %2|%0|%22…%29`, `tmux show-options -w -t ufo_sighting:1|:2`,
  `status --help`, `peek --help`, `tmux -V`.
- Tests: `ufo/tests/ufo-sighting.test.js` (4682 lines, 117 top-level tests),
  `ufo/tests/ufo-sighting-wall-heavy.test.js` (425 lines, 7 tests),
  `ufo/tests/helpers/ufo-sighting-fixture.mjs` (267 lines).

**Observed**

- Live wall matches the code's declared names/markers on every axis probed: session `ufo_sighting`; window
  index `1` named `fleet` (`TMUX_TARGET = ufo_sighting:1`); a fleet window `shokunin` matching
  `FLEET_NAME_PATTERN`; the ownership triad equals the manifest `wallId`/`ROOT`/`MANIFEST_SCHEMA`; all 8
  running manifest rows equal the live panes `%22`–`%29` (id/paneId/panePid/title/runId/sessionId/relay/
  `@ufo_position` `1-of-8`…`8-of-8`); the overview pane `%2` is bound (`@ufo_overview=dashboard`,
  `@ufo_overview_pid == pane_pid`); the idle keeper `%0`; phase counts working 8 / suspended 17 /
  completed 2 equal both `statusPhase` and the manifest grouping; 8 panes ≤ `windowPaneCeiling` 16 with a
  geometry cap 15 (16:9). No blockers.
- Marker caveats: `#{pane_title}` is volatile (the child process retitles the pane) — mission identity must
  come from the `@ufo_*` markers + manifest rows + `panePid`, **never** `pane_title` (the overview title
  does stick); `@ufo_l2 ?` / `@ufo_fleet_l2 ?` is the declared unavailable-count placeholder, not
  corruption. `show-options -p -g` is not a global-only scope view on tmux 3.7b — canonical reads are the
  pane-local form or the exact `-v` form used by `readSessionOwnership`.
- Fixture capabilities (`ufo-sighting-fixture.mjs`): `fixture()` builds an isolated tmp state dir + a
  private tmux socket and **strips every ambient `UFO_SIGHTING_*` var**; `pinnedCeilingFixture()` copies the
  real `config/ufo.json` (patched runner/L1 ceilings) plus the shim and the whole lib tree into a scratch
  project — **the only mechanism that pins a ceiling value**; `runWall`/`jsonResult` assert an exit code
  and parse stdout on 0, **stderr** on a refusal; `assertGrid` pins the pane grid; `forcedOverviewEnv`
  forces an overview pane and deletes `TMUX`/`TMUX_PANE`; `waitForManifestQuiescence` waits for
  `registryRevision` to stop changing — **required after any pane-killing verb**, because the dying pane
  wrapper schedules a detached `__reconcile` that rewrites the manifest twice (~122–268 ms after return).
- Contract facts the card must not contradict: refusals are JSON on stderr with exit 2; verb help exits 0;
  the manifest is mode 0600 in a 0700 dir; `registryRevision` bumps on every write; `remove` on an absent
  row is an idempotent no-op; a state-dir mode of 0755 is repaired to 0700; completed rows consume no live
  geometry capacity; the overview strip is not charged against `windowPaneCeiling`.
- Discrepancies found in the substrate (operator-owned, recorded not fixed): a test pins
  `maxConcurrentL1` **32** while the live config is **16**; the fixture comment mislabels a hermetic
  16-runner pin as the documented contract (docs say 1056); stale band/most-ceiling prose lives in
  `AGENTS.md`, `docs/BEHAVIOR-MATRIX.md`, `docs/L2-L3-ROUTING.md` (see the ceilings entry).

**Changed:** nothing.

**Unknown:** window 1's `@ufo_fleet_missions 1` / `@ufo_fleet_l1 1` / `@ufo_l2 2` population was not
derived — the corpus must not assert a meaning for window-1 fleet counters `[INFERENCE]`.