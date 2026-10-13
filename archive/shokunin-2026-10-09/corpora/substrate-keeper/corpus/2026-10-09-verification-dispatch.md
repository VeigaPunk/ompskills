# verification-dispatch — four questions re-confirmed against the live tree

Asked (bounded verification dispatch, substrate-keeper card): four questions about
`/home/vgpnk/Projects/ufo-fsd-alpha` — (1) where the swarm wave band lives, its values, and the
symbol that reads it; (2) the authoritative surface for seat routing and the script that refuses
project-level routing keys, with its key list; (3) whether `config/ufo.json` is inside the membrane
and what an accepted touch does; (4) two things the repository admits it has not settled, with doc
anchors. Method: answer from the seeded corpus first, then confirm each against the real source.
Substrate read-only; no writes under it.

## Revision re-check (before trusting any line number)

- `git rev-parse --short HEAD` → `5ace2559` (exit 0).
- `git status --porcelain` → ` M README.md`, ` M config/ufo.json`, untracked `.omp/skills/{swarm,tower}/`,
  and 9 untracked `config/ufo.json.<stamp>.bak` (2026-10-08T19-15-32Z … 2026-10-09T01-30-57Z).
- `sha256sum config/ufo.json scripts/ufo-swarm-wave.mjs scripts/ufo-mission-result.mjs
  scripts/check-routing-free-config.mjs` (exit 0) →
  `0e416f0abc559e9a91bc0c35ea8abd913ba11e1a926db9f72dade2f73d5fa8b3` (config, matches the corpus anchor),
  `cd8247af7e7a9dc3e9dcff08d902e05ece72479f402ac754a89c5767cc304c00` (swarm-wave, matches),
  `bf23cf3ee51702a74bc492049a0f613d79d838a1cec55579508da1c214755551` (mission-result hub),
  `8558a6295396e9613de854f0a4f9c90c6eedae0d7f1e6df21a2c60a6c481f4c7` (routing-free-config).
  Corpus anchor holds; line numbers below are trustworthy at this revision.

## Q1 — swarm wave band: location, values, reader

- **Corpus used:** `2026-10-09-config-ufo-json.md` (band values + reader) and
  `2026-10-09-cross-surface-ownership.md` (band/ceiling authority row).
- **File / key path:** `config/ufo.json` → `sighting.dispatch.swarm` (nested under the `sighting`
  block opened at `config/ufo.json:59`; `dispatch` at `:75`, `swarm` at `:87`).
- **Values at this revision** (`grep -n` on the file, exit 0):
  `maxLanes 100` (`:88`), `minLanes 16` (`:89`), `waveMinLanes 16` (`:93`), `waveMaxLanes 32` (`:94`);
  sibling dispatch keys `globalRunnerCeiling 1056` (`:78`), `maxConcurrentL1 16` (`:79`),
  `l1Alias "m_strong"` (`:85`), `windowPaneCeiling 16` (`:71`).
- **Reader symbol:** `loadSwarmPolicy` — **exported from the hub** `scripts/ufo-mission-result.mjs:2431`
  (`export function loadSwarmPolicy(configPath)`); it walks `config.sighting.dispatch.swarm` at
  `:2459-2462` and resolves the wave band at `:2503` (`waveMinLanes`) / `:2510` (`waveMaxLanes`),
  refusing an inverted band at `:2518` (`"sighting.dispatch.swarm wave band is inverted"`).
  `scripts/ufo-swarm-wave.mjs:381` defines a **local wrapper** of the same name that delegates to the
  hub import (`loadSwarmPolicy as loadHubSwarmPolicy`, `:120`; delegation at `:383`), and
  `planSwarmWave` consumes it at `:768`/`:773` (`const policy = options.policy ?? loadSwarmPolicy()`),
  emitting typed refusals `impossible_band` `:991`, `too_few_lanes` `:1000`, `wave_too_wide` `:1006`.
- **Confirmed: true.** Note the corpus entry's reader anchor `ufo-mission-result.mjs:2503-2519` names the
  wave-band resolution block; the export itself is at `:2431` — both correct, different granularity.
  No `loadBandAuthority` symbol exists (card's standing warning holds).

## Q2 — seat-routing authority and the refusing script

- **Corpus used:** `2026-10-09-cross-surface-ownership.md` (routing row) and
  `2026-10-09-contract-check-battery.md` (`ROUTING_KEYS`).
- **Authority:** the operator's **global** OMP config `~/.omp/agent/config.yml` is the ONLY routing
  authority; the project declares no seat routes. Anchor `AGENTS.md:98-100` ("## Routing authority
  (2026-09-20 cutover; 2026-09-21 redelegation)" / "The global OMP config (`~/.omp/agent/config.yml`)
  is the ONLY routing"). The generated `omp-seat-routing` mirror and the marked tables in `AGENTS.md`
  + `docs/L2-L3-ROUTING.md` are derived projections, never authority.
- **Refusing script:** `scripts/check-routing-free-config.mjs` (pure scanner, no mutating form).
  `export const ROUTING_KEYS = Object.freeze([...])` at `:20-22` =
  **`modelRoles`, `agentModelOverrides`, `fallbackChains`, `modelRoutes`, `modelFallbacks`**.
  Surfaces scanned (`configSurfaces` `:38-56`): `config/**/*.{yml,yaml,json}` recursive,
  `.omp/*.yml|*.yaml` non-recursive, `packages/*/.omp/*.yml|*.yaml`; YAML scanned line-wise at any
  depth, JSON parsed and walked; exit 0 clean / 1 violation / 2 usage-or-read fault.
- **Confirmed: true.** Distinct from `sync-ufo-contracts.mjs#assertNoProjectModelAuthority` (`:450-462`),
  which refuses a different key set inside `nativeProfiles` — do not conflate the two lists.

## Q3 — `config/ufo.json` in the membrane; the accepted-touch consequence

- **Corpus used:** `2026-10-09-membrane-and-screening.md` (paths/action/seal/unseal) and
  `2026-10-09-config-ufo-json.md`.
- **Inside?** Yes. `config/ufo.json` is the 7th of 11 entries in `membrane.paths`
  (`config/ufo.json:23-40`; the literal string `"config/ufo.json"` at `:31`). `membrane.action` =
  `"authority_boundary"` (`:39`), the only admitted spelling (`crates/ufo-core-runtime/src/config.rs:226`;
  `lib.rs:869-873` refuses anything else).
- **Matcher:** `crates/ufo-core-runtime/src/proposal.rs:354-359` (`membrane_path_matches`) — literal
  stem before the first `*`, exact equality when no glob, **string-only, never consults the filesystem**.
- **On an accepted touch:** the work lands locally, the round stays Sound, and `loop_stop` overrides to
  `AuthorityBoundary` (`crates/ufo-core-runtime/src/loop_driver_dry.rs:464`), writing an atomic seal
  **`.ufo/membrane-seal.json`** (`loop_driver_publish.rs:28`) of kind **`ufo-membrane-seal-v1`**
  (`MEMBRANE_SEAL_KIND`, `:45`). While the seal stands the driver refuses the next round and the
  launcher refuses fresh dispatch (`scripts/run-omp-native-trial.mjs:1788` `MEMBRANE_SEAL_PATH`, read
  fail-closed `:1790-1810`); a present-but-unreadable seal is still a seal.
- **Unseal:** operator-only `ufo charter sign <runId>` — `crates/ufo-cli/src/main.rs:989` (`charter_sign`),
  stdin AND stdout must both be TTYs (`:993`, refused before any state read), the seal must decode and
  name the run, and a full Phase 0 re-pass must succeed (`charter_phase0` `:910`, stage gate `:1067-1088`);
  any stage failure leaves the seal standing.
- **Confirmed: true.** Live state: `test -e .ufo/membrane-seal.json` → no standing seal (per the
  membrane entry; not re-probed here).

## Q4 — two things the repository admits it has not settled

- **Corpus used:** `2026-10-09-docs-self-declared-gaps.md`.
- **(a) The parent goal is open / completion unproven.** `docs/BLOCKED.md:58` —
  "**Goal stays OPEN.** Completion is UNPROVEN."; the two operator-owned open clauses are at
  `docs/BLOCKED.md:16-17` — "Still open: (1) authenticated native-OMP live LLM specialist evidence and
  (2) the private LKG byte-identical clone." Corroborated by `docs/GOAL-COMPLETION-AUDIT.md:385`
  ("## 6. What remains unproven (do not invent)").
- **(b) The F-C3 SIGSEGV is unreproduced and still open.** `docs/CONFORMANCE-FINDINGS.md:458` —
  "### F-C3 — a rare `SIGSEGV` in Node test processes under concurrent load"; `:465` — "Open. Observed
  once, not reproduced in 42 subsequent pair runs …"; `:490` — "**F-C3 stays OPEN** (sample≠close;
  SIGSEGV class …)".
- **Confirmed: true.** (A third candidate, also real: `ports/ufo-core-runtime/SRC-PARTIAL.json:4,6` —
  "tipByteReplacement remains OPEN for all 12 — do not claim tip bytes.")

## What changed

- Nothing in the substrate (read-only; only `read`/`grep`/`git rev-parse`/`git status`/`sha256sum`/`sed`
  reads were run — no mutating command, no gate, no dispatcher).
- This corpus entry added; one row appended to `index.md`.

## Remaining unknowns

- Whether a `authority_boundary` seal was ever raised/signed for the 01:30Z band edit (the worktree
  `config/ufo.json` is ` M` against HEAD blob `7efc813b…`); live seal state not re-probed here.
- Which band the live fleet actually dispatched with (uncommitted edit post-dates HEAD; daemon snapshot
  vs per-tick re-read unobserved).
- Writer identity of the 9 `config/ufo.json.*.bak` residue files (no in-tree writer).
- `docs/L2-L3-ROUTING.md` marker contents and `ufo-deps.lock` pin values were not opened.
