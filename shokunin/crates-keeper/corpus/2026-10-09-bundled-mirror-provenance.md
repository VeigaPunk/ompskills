# Bundled mirror provenance and the compile-gate blind spot

Asked: which script produces which bundled mirror, how `--check` fails
closed, and what the compile gate can and cannot see. Substrate `5ace2559`
(lanes BundledMirrors, AliasParity, RustScriptBoundary, SeatCompileCheck;
L1 spot-verified the diff).

## Producers

- `bundled/config.json`: declared byte copy of root `config/ufo.json`,
  written by `scripts/sync-ufo-contracts.mjs:1921-1925`; drift flagged at
  `:1985`; `checkRoutesEquivalence` at `:591-700`, invoked `:1712`; reached
  via `npm run contracts:check` (package.json:26).
- `bundled/omp-seat-routing.json`: rendered from the operator's global
  `~/.omp/agent/config.yml` by `scripts/sync-global-routing.mjs`
  (`buildSeatRoutingMirror` :239-300; `--check` byte compare :338-366).
  NOT in any npm script — reached via `sync-ufo-contracts.mjs`'s import of
  `renderSeatRoutingMirror` (:591, :1712).
- A third checker: `scripts/collect-omp-native-handoff-lib/policy.mjs:155-205`
  (`loadSeatRoutingMirror` RECOMPUTES the digest :179-193) and `:283-322`
  `verifyLaunchSeatRouting` pins launch sha/path/per-role routes.

## Observed drift at 5ace2559 (verified by 4 lanes + L1)

- Canonical `config/ufo.json:85` `l1Alias = m_strong`; bundled `config.json:85`
  `= m_daybreak`; `seats.main.alias = m_daybreak`. Also `maxConcurrentL1`
  16 vs 32, `minLanes` 16 vs 64, `waveMinLanes` 16 vs 32, `waveMaxLanes`
  32 vs 100 (bundled carries pre-5ace2559 values).
- Mirror `source.sha256` `dc31bdb2…` ≠ live global config `1ef7b233…`.
- The live global config has NO `m_daybreak` alias — the mirror cannot be
  regenerated with it; regeneration pulls `m_strong` from `config/ufo.json`.
- `sync-global-routing.mjs --check` → exit 1; `sync-ufo-contracts.mjs
  --check` → exit 1, drifted `[omp-seat-routing.json, bundled/config.json]`.
- `build.rs:14-16` header claim "byte-for-byte copy" is FALSE of the
  current bytes; its "dormant override" claim has zero matches in
  bundled/config.json.

## The blind spot (the load-bearing fact)

`cargo check` PASSES on this tree: parity compares bundled `m_daybreak` to
bundled `m_daybreak`. The compiled binary embeds a stale seat table and
`ufo route-plan` serves it. Only the Node `--check` gates observe the drift.
Ordering for a repair: fix producers first (`sync-ufo-contracts` +
`sync-global-routing`), re-run both `--check`s, THEN `cargo check` observes
the new bytes.

## Honesty note

Commit 5ace2559's subject says `l1Alias m_strong` — true of
`config/ufo.json`, false of the bundled bytes, which it did not touch.
The working tree also had uncommitted `config/ufo.json` edits (band
64→16/32/100→32→16) plus `*.bak` residue when lanes ran.
