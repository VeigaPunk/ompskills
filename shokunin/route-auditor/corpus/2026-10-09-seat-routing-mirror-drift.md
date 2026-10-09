# The seat-routing mirror and its drift

**Asked.** What is the derived seat table, who consumes it, and is it drifted?

**Observed.** `ufo-fsd-alpha/scripts/sync-global-routing.mjs`.

- `MIRROR_PATH` = `crates/ufo-core-runtime/bundled/omp-seat-routing.json` (:64);
  `MIRROR_SCHEMA` = `ufo-seat-routing-v1` (:65); `RESOLVER_VERSION` = 1 (:71).
- `MIRROR_SEATS` = 14 = `CORE_SEATS` (main, planner, distiller, labrat) +
  `PROPOSAL_SEATS` (scout, reviewer, critic, connector, sentinel, executor,
  mutation-tester, revenger, simplifier, scribe).
- `configuredL1Alias` reads `<repo>/config/ufo.json`
  `sighting.dispatch.missionFormat.l1Alias`; must be bare, nonempty, not starting
  with `@` (:220-233). The mirror's `main` seat resolves through it.
- Body = `{schema, resolverVersion, source:{path, sha256 of the live config}, seats}`
  plus `digest = sha256(canonicalJson(body))`; the mirror is **derived, never
  hand-edited** (canonical serializer :195-197/:299).
- `--check` recomputes from the live config and byte-compares; any difference
  fails exit 1 and never writes (:338-365). `--help` exit 0; usage error exit 64.
- Consumer: `crates/ufo-core-runtime/build.rs` — envelope gate, exact 14-seat
  taxonomy both ways, `validate_chain` (non-empty + pairwise-distinct bare
  models), `validate_generated_graph` (pins `extendedContext`/`minimumTokens`/
  retry policy and `seats.main.alias === bundled l1Alias`). The compiled runtime
  reads the mirror, **never** the operator config at runtime; the launcher
  (`fleet-dispatcher.mjs:31,3667`) reads the global config live at dispatch.

**Observed drift (deferred, operator-accepted).** `node scripts/sync-global-routing.mjs --check`
-> exit 1, `error: … drifts from the live global OMP config`. Mirror
`source.sha256` = `dc31bdb2…` vs live `ed164f81…`; mirror `seats.main.alias` =
`m_daybreak` vs live `l1Alias` = `m_strong`; `bundled/config.json`
`maxConcurrentL1` = 32 vs live 16. The mirror + bundled config form a
self-consistent **old** generation (its Rust invariants still hold), so the
compiler would consume it unchanged — the loud `--check` failure is the designed
seam, and regenerating is an operator decision.

**Changed.** None (the mirror is under `ufo-fsd-alpha`, read-only here).

**Unknown.** The prior global-config bytes (cannot date the edit); whether a
cargo build currently refuses on the stale mirror (not run).

Evidence: lanes MirrorReviewer16, MirrorConsumerRevenger23, DeltaScout11;
L1 overfit `sync-global-routing.mjs --check`.