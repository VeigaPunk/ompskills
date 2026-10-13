# build.rs fail-closed gate inventory

Asked: every compile-time check in `crates/ufo-core-runtime/build.rs`
(706 lines, read fully by lane BuildRsRules). Substrate `5ace2559`.

## Inputs / outputs

- Reads ONLY `bundled/config.json` and `bundled/omp-seat-routing.json`
  (build.rs:155-156), via `CARGO_MANIFEST_DIR` — never `../../config/ufo.json`,
  never `~/.omp/agent/config.yml`. Rationale (header :14-25): `cargo package`
  cannot carry out-of-tree files; the crate must self-contain its producer.
- `cargo:rerun-if-changed` emitted for the two mirrors only (:157-159).
  `src/build_json.rs` is `#[path]`-compiled in (:704-706) but NOT listed —
  edits to it alone may not rerun the script [INFERENCE, unrun].
- Emits `$OUT_DIR/omp_role_chains.rs` (:170-172, `write_if_changed` skips
  unchanged writes): `generated_omp_steps(role) -> &[(provider, model)]` and
  `generated_omp_family(role) -> &str`, arms merged by `A | B =>`.
  Sole consumer: `src/execution_profile.rs:548` `include!`.

## Envelope checks (`validate_routing_mirror` :279-312)

- `schema == "ufo-seat-routing-v1"` (:280-285); `resolverVersion == 1`,
  string or number (:292-297).
- `digest` must match `sha256:<64 lowercase hex>` — **shape only; build.rs
  recomputes nothing** (no hashing crate in `use` :39-44). Digest
  recomputation lives in `scripts/sync-global-routing.mjs`.
- `source.path` non-empty only (:298-304) — the shipped mirror carries an
  absolute machine-local path; `source.sha256` 64-hex shape (:305-310).
- `MAX_MIRROR_BYTES = 1 MiB` (:120); stat/read/oversize failures verbatim
  at :125/:134/:129.

## Local-omp substrate (`validate_local_omp` :191-226)

`automaticSubstrate == "omp"`, `substrates` contains id omp with
`protocol == "local"`, optional `runnerUpSubstrate` must be a string, differ
from automatic, and be declared (observed: devin).

## ROLE_TAXONOMY (:46-103) — exactly 14

`main→Judge, planner→Planner, scout→Scout, reviewer→Reviewer, critic→Critic,
connector→Connector, sentinel→Sentinel, executor→Executor, distiller→Distiller,
labrat→Labrat, mutation-tester→MutationTester, simplifier→Simplifier,
scribe→Scribe, revenger→Revenger`. `assert_exact_role_keys` (:395-410) fails on
unknown AND missing seat keys. Constants: `EFFORT_SUFFIXES =
low|medium|high|xhigh|max` (:105), `GEMINI_MARKERS =
gemini|google-ai|google_ai|google-gemini|bard` (:106).

## Per-seat rules

- `parse_route` (:412-466): Gemini ban FIRST, then `provider/model` split,
  charset `[A-Za-z0-9_.-]` per segment, `:suffix` must be whitelisted
  (`rsplit_once(':')`).
- `reject_gemini` (:468-486): `google-antigravity/` prefix admitted
  unconditionally (nc4 operator deviation); otherwise substring match of any
  marker on the lowercased route — `bard` can false-positive [unsearched].
- `validate_mirror_step` (:321-369): `resolved == bare(provider, model)`,
  `effort` matches typed suffix or null, `family` non-empty charset —
  **NOT** checked against the seat's `family`.
- `validate_chain` (:493-509): non-empty; no duplicate or wrapped bare
  route across primary+fallbacks; case-sensitive (a case-variant duplicate
  passes — observed in mirror test).

## Non-routing invariants (`validate_generated_graph` :519-583)

`nativeProfiles.omp-native-v1` exists; `extendedContext == true`;
`l1Context.minimumTokens == 1000000`; `retry.usageAwareFallback == false`;
`retry.fallbackRevertPolicy == "never"` (ONLY these two retry fields are
read); `l1Alias` non-empty without leading `@`; `seats.main.alias == l1Alias`
(:574-581).

## Failure reporting

`eprintln!("error: {error}")` + `ExitCode::FAILURE` (:141-149). Zero
`panic!`/`unwrap`/`expect` in build.rs; 34 `Err(String)` sites.
`src/build_json.rs` (305 lines, std parser, `MAX_JSON_DEPTH=128`) supplies
parse failures with verbatim messages (:69 trailing JSON, :128 duplicate
key, :167 unterminated string, …).

## What it does NOT do

No digest recompute; no live-config read; no per-hop family↔seat equality;
no Judge↔AgentRole enum introspection; only 2 retry fields; only mirror
internals — drift between bundled bytes and canonical config is invisible
to it (see bundled-mirror-provenance entry).
