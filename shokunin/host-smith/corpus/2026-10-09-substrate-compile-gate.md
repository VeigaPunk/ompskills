# Substrate — crates/ufo-core-runtime/build.rs (the real compile gate)

**Asked.** What the real gate enforces and how it consumes the bundled mirror.

**Observed.** `crates/ufo-core-runtime/build.rs`.

- `extract_omp_chains` L234–272; `validate_chain` L493–508 (empty check L494–496,
  BTreeSet bare-route dedupe L497–506 via `bare_model:511`/`bare_route:515`);
  `validate_generated_graph` L519–581 (`extendedContext` L520–528,
  `l1Context.minimumTokens == 1_000_000` L533–540, retry L543–548, `l1Alias`
  read L555–563, bare check L564–568, `seats.main.alias == l1Alias` L574–581).
- Mirror envelope `validate_routing_mirror` L279–314 + step coherence
  `validate_mirror_step` L321–362; `parse_route`/`reject_gemini` L412–480.
- Consumption: `SEAT_ROUTING_MIRROR` L110, `read_mirror` L123 (1 MiB cap),
  `generate` L151–176 → `OUT_DIR/omp_role_chains.rs`, consumed by
  `src/execution_profile.rs:548`.

**Evidence method.** Isolated copy of the real `build.rs` + `src/build_json.rs`
+ both bundled mirrors in `/tmp/bsgate` with a stub `Cargo.toml`; `cargo build
--offline` (cargo 1.97.1); no repo/substrate/live write. 18 mutations: baseline
PASS; FAIL refusals for config-vs-mirror l1Alias mismatch, duplicate bare hop,
gemini, non-whitelisted suffix, invalid model segment, resolved/effort
incoherence, schema/digest/resolverVersion, missing/unknown seat key, malformed
family, extendedContext/minimumTokens/retry/`@alias`. PASS for both mirrors
repointed together, empty fallbackChain arrays, and whitespace-padded selectors.

**Key findings.**

- **C1.** `parse_route`'s comment (L420–422) claims padded selectors "must die";
  the code trims (L422–423) and admits them (proved PASS).
- **C2.** `apply.mjs:512-521`'s replicated `validate_chain` rejects
  `requested.length < 2` while `build.rs:494` (unreachable) allows an empty
  `fallbackChain` — the replication is stricter than the real gate.
- **C3.** `apply.mjs` never reads `bundled/config.json`, so
  `validate_generated_graph`'s config-side invariants have no JS twin.
- **C4.** The gate compares bundled mirror vs bundled mirror, so a green build
  does not bind the installed L1 alias; re-syncing only `sync-global-routing.mjs`
  fails the build until `contracts:sync` also repoints the config mirror.

**Drift.** Committed bundled stamps are `m_daybreak`-consistent while
`config/ufo.json` + the live config are `m_strong` — the state gate 7 reports and
the deferred-artifact list names.

**Added.** 2026-10-09 · lane `SubstrateCompileGate` (critic)