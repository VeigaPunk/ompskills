# l1Alias edit → which gates catch the drift, in repair order

Asked: "If I change `l1Alias` in `config/ufo.json`, which gates catch a
resulting mismatch with the compiled `ufo` binary's seat table, and in what
order should I re-run them?" Substrate `5ace2559`, VERIFY dispatch; every
anchor below re-read on 2026-10-09 (all hold; substrate working tree dirty —
`config/ufo.json` modified + `.bak` residue, as prior entries recorded).

## What the edit actually breaks

`config/ufo.json` `sighting.dispatch.missionFormat.l1Alias` is canonical.
Two bundled mirrors under `crates/ufo-core-runtime/bundled/` are what the
compiled binary sees, and build.rs (`generate` :151-173) reads **only** them
(`CARGO_MANIFEST_DIR` + `:155-156`; `rerun-if-changed` for exactly those two
files :157-159). After the edit:

1. `bundled/config.json` is byte-stale (whole-file mirror copied by
   `sync-ufo-contracts.mjs` — copy entry `:1921-1925`, byte compare `:1983-1985`).
2. `bundled/omp-seat-routing.json` is stale: `renderSeatRoutingMirror` bakes
   `l1Alias` into `seats.main.alias`, reading the canonical value via
   `configuredL1Alias()` (`sync-global-routing.mjs:220-233`, wired into
   `buildSeatRoutingMirror` at `:239`).
3. A previously compiled `ufo` binary still serves the OLD seat table —
   build.rs runs at compile time only; nothing at runtime re-checks alias
   equality (`lib.rs:1014-1027` checks presence/leading-`@` only, per
   seats-main-alias-parity entry).

## The gates, in the order they observe the drift

1. **`node scripts/sync-global-routing.mjs --check`** — re-renders the
   mirror from live `~/.omp/agent/config.yml` at the NEW l1Alias
   (`main` :309-336; byte compare + fail :357-363, exit 1). Observed now:
   exit 1, `drifts from the live global OMP config`.
2. **`npm run contracts:check`** (package.json:26) — first leg is
   `node scripts/sync-ufo-contracts.mjs --check`, which flags BOTH files:
   `bundled/config.json` in the copy-diff loop (`:1984-1985`) and the routing
   mirror via `checkRoutesEquivalence` (`:591-701`: re-renders with
   `renderSeatRoutingMirror` `:648-652`, byte-compares `:680-685`, reports
   seat-by-seat mismatches `:688-693`). The other `contracts:check` legs
   (`project-devin-subagents`, `check-routing-free-config`,
   `render-seat-tables`, `check-hand-authored-sets`) do NOT read l1Alias —
   `check-hand-authored-sets.mjs:89` reads only `missionFormat.configPath`;
   `render-seat-tables.mjs` has zero `l1Alias|missionFormat` matches.
   `npm run doctor` (package.json:22) = `contracts:check` then `cargo check`.
3. **`cargo check`** — build.rs `validate_generated_graph` (:519-583):
   `l1Alias` from bundled config (:555-563, non-empty no-`@` :564-568) vs
   `seats.main.alias` from bundled routing (:574-576), `!=` at :577-581,
   verbatim message at :579. **Catches the mismatch ONLY while the two
   mirrors are in DIFFERENT generations** (e.g. config synced, routing not).
   If both are coherently stale, `cargo check` self-passes — the blind spot.
4. **`ufo self-iter`** (mutating verb — do not run for verification) spawns
   the contract-sync check as Phase 0 (main.rs `write_contract_sync_record`
   :643-657 → `contract_sync_check_command`; corpus pins the spawn at
   :651-657, confirmed site reads the mirror command + runs it under
   `run_fixture_with_stdin` with a timeout).
5. `scripts/collect-omp-native-handoff-lib/policy.mjs:155-205` recomputes the
   mirror digest (`:179-193`) — a third checker, hit only on that pipeline.

## Repair order (shortest correct sequence)

1. **Ensure the new alias exists in `~/.omp/agent/config.yml`
   `modelRoles`** — `renderSeatRoutingMirror` fails if the seat's resolved
   alias is unknown to the global table.
2. `node scripts/sync-ufo-contracts.mjs` (write mode) — refreshes
   `bundled/config.json` (copy loop :1991) AND rewrites the routing mirror
   (`repair` :660-667, drift branch :700). Running only
   `sync-global-routing.mjs` leaves `bundled/config.json` stale; running only
   the copy side would split the pair. This single command repairs both.
3. Verify: `node scripts/sync-ufo-contracts.mjs --check` AND
   `node scripts/sync-global-routing.mjs --check` — both exit 0.
4. `cargo check -p ufo-core-runtime -p ufo-cli` (or `npm run doctor`, which
   orders contracts:check before cargo) — build.rs re-runs on the changed
   mirrors (:157-159), parity :577 passes, new chains land in
   `$OUT_DIR/omp_role_chains.rs` (:170-172) → `include!`
   `execution_profile.rs:548`. Rebuild before trusting any pre-existing
   binary; `ufo route-plan` then serves the new table (main.rs:1119-1151).

## What the corpus had wrong / missed (checked, none found on this question)

- Prior entries said repair = "re-run BOTH producers". Verified: one
  `sync-ufo-contracts.mjs` write run covers both mirrors via
  `checkRoutesEquivalence` — the `sync-global-routing.mjs` run is redundant
  as a repair step, still useful as an independent `--check`.
- No prebuilt `ufo` binary exists under `target/` in the substrate, so
  `ufo route-plan` staleness was not probed live [unrun].

## Remaining unknowns

- Whether `self-iter`'s Phase-0 record write (`write_contract_sync_record`)
  blocks iteration on a parity failure or only logs it [untraced past
  main.rs:663].
