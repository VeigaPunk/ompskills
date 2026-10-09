# Deferred artifacts and the minimal-footprint directive

**Asked.** The four deferred artifacts, the stated consequences, and whether any
of it is a failure.

**Observed.** `host/apply.mjs`.

- `DEFERRED_ARTIFACTS` L91–96, consumed only at L821 inside `printClosingNotice`
  (L814):
  1. `crates/ufo-core-runtime/bundled/omp-seat-routing.json` — mirror of the seat
     table.
  2. `crates/ufo-core-runtime/bundled/config.json` — mirrors
     `sighting.dispatch.maxConcurrentL1`.
  3. `AGENTS.md` Routing-authority band mentions (~lines 154–170) still say a
     16-100 wave band where the config now enforces 16-32 per wave / 100 per
     round.
  4. `AGENTS.md` generated seat table between the BEGIN/END GENERATED markers.
- **Consequences** L823–832: `contracts:check` and `sync-global-routing.mjs
  --check` report mirror drift (the deferred state, not a regression);
  `cargo build -p ufo-core-runtime` compiles against the **stale** bundled mirror
  while the launcher reads the global config live; and the AGENTS.md band text
  disagrees with the config.
- **Manual close-the-gap** L834–838: `cd <ufo-root>`; `npm run contracts:sync &&
  npm run contracts:check`; `node scripts/render-seat-tables.mjs --check`; then
  hand-edit the AGENTS.md band mentions. Referenced scripts and package scripts
  exist in the substrate.
- **Minimal-footprint directive** L11–17 (header) and L808–813 (deliberately
  not touched).

**Verdict: all four are decisions, none are failures.** L818: "Nothing here is a
failure; all of it is a decision the operator inherits explicitly". No `fail()`
(exit 1) or `usage()` (exit 64) path is attached to any deferral; the dry run
exits 0.

**Ground truth for the disagreement.** `AGENTS.md:154` "16-100" and `:166` "the
16-100 wave band"; `config/ufo.json:93` waveMinLanes 16, `:94` waveMaxLanes 32,
`:88` maxLanes 100, `:79` maxConcurrentL1 16. Generated markers
`AGENTS.md:115/128`. (The deferred entry's "~lines 154-170" is a soft estimate;
the actual mentions are 154 and 166.)

**Added.** 2026-10-09 · lane `DeferredArtifacts` (simplifier)