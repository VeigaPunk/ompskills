# reverify-cross-fleet-plan-echo-l3: cross-fleet L1 refusal, the plan's maxLanes echo, and whether l3Evidence is enforced

Asked (second verification dispatch, shokunin3): (1) fleet A has 16 live missions, fleet B has 0, and the default wall has 0. What refuses a launch into B, and would `CAP_EXCEEDED` fire? (2) Is the plan's `policy.maxLanes` the raw config value or the effective cap? Probe it with spec `maxLanes: 20`. (3) Is `nativeProfiles.omp-native-v1.l3Evidence.concurrencyCeiling` enforced in production?
Builds on wall-l1-ceiling, window-pane-and-wall-cap, swarm-band-gates, native-concurrency-ceiling, and r2-corrections. It confirms the r2 rows for neighbour-ownership, swarm-band-gates, and native-concurrency-ceiling.

Anchor: `ufo-fsd-alpha@5ace2559`. Working-tree `config/ufo.json` sha256 `0e416f0abc559e9a…` was the same before and after the probe. Other hashes: `ufo-swarm-wave.mjs` `cd8247af…`, `ufo-sighting.mjs` `5e8ea127…`, `ufo-sighting-lib/base.mjs` `64c843ee…`, `ufo-mission-result.mjs` `bf23cf3e…`.
Live values: `windowPaneCeiling` 16, `maxConcurrentL1` 16, `globalRunnerCeiling` 1056, swarm `maxLanes 100 / minLanes 16 / waveMinLanes 16 / waveMaxLanes 32`.

## (1) Launch into fleet B while fleet A holds 16 live missions

- The launcher (`tower-fleet.mjs:337`, `missions.length > maxConcurrentL1`, `:340` for panes) counts only one spec's missions. A spec with one mission gives 1 > 16, which is false, so the launcher admits it. The launcher cannot see fleet A.
- On the wall, `launchMissionLocked` (`ufo-sighting.mjs:2347`) runs its gates in this order: `assertL1Capacity` `:2351`, then `assertCapacity` `:2352`, then `parseRunnerReservation` `:2353`, then `assertRunnerCapacity` `:2354`.
- **Refuses first: `L1_CEILING_EXCEEDED`** (`:2167-2168`). The operator is `active >= ceiling`, so 16 >= 16 is true. `active` = `liveMissions(state).length` (`:2146`), which counts rows with status `starting|running` (`base.mjs:428-433`) across **every fleet and the default wall**. Here that is fleet A's 16. The message is "global L1 mission ceiling is 16". Details: `{ceiling:16, active:16, headroom:0, fleet:"B"}`. `fail` throws (`base.mjs:247-248`), so no later gate runs.
- **`CAP_EXCEEDED` would not fire for B.** It is not reached because the L1 gate throws first. Even if it were reached, it would admit: `liveMissionsForFleet(state,"B")` filters to `missionFleet === "B"` (`base.mjs:291-293`), giving 0, and `0 >= windowPaneCeiling 16` (`ufo-sighting.mjs:2140-2141,2179`) is false. The runner gate is not reached either.
- [INFERENCE] The wall reads `SIGHTING_CONFIG` once at boot (`base.mjs:239-241`). The 16 holds only if the running wall booted on the current file. "Live config unchanged" means it did.

## (2) The plan's `policy.maxLanes` is the effective cap

- Code: `cap = policyMaxLanes` (`ufo-swarm-wave.mjs:853`), and `policyMaxLanes = min(policy.maxLanes, MAX_SWARM_LANES)` (`:794-795`). Then `spec.maxLanes` can only lower it: `declaredMaxLanes = spec.maxLanes; cap = min(cap, spec.maxLanes)` (`:862-863`). The plan echoes `maxLanes: cap` (`:1240`) and the raw spec value as `declaredMaxLanes` (`:1244`). `minLanes`, `waveMinLanes`, and `waveMaxLanes` are echoed from the policy (`:1241-1243`). On the config path the loader has already clamped them.
- Probe: the scratch root `/tmp/tmp.5F4bXWpirQ` held a real `cp` of the working tree (same sha). The command was `UFO_PROJECT_ROOT=… UFO_CONFIG_PATH=…/config/ufo.json UFO_FLEET_ALLOW_EXTERNAL_TOOLS=1 node <ufoRoot>/scripts/ufo-swarm-wave.mjs plan --spec -`, with tool `cwd` set to the scratch root and no `cd`. The spec had 16 `scout` spawn lanes and `maxLanes: 20`.
  - The output was `"policy":{"source":"config","maxLanes":20,"minLanes":16,"waveMinLanes":16,"waveMaxLanes":32,"declaredMaxLanes":20,"hardCeiling":100,…}`, and the command exited 0. The config value is 100, but the echo is **20**, so the echo is the effective cap.
  - Companion probe: 21 lanes with the same spec gave `too_many_lanes` "wave has 21 lanes; the cap is 20 (hard ceiling 100)" and exit 1 (`:995-996`). This shows the echoed number is the number the gate enforces. The effective width ceiling here is `min(policyCeiling 32, cap 20)` = 20 (`:983`).
- Scratch was removed. The substrate sha was unchanged afterwards. `git status` showed only the user's pre-existing changes.

## (3) `l3Evidence.concurrencyCeiling` (64) is not enforced in production

- Declared at `config/ufo.json:161-165` (`:164` `64`). The bundled mirror has the same value (`bundled/config.json:161-164`).
- The only comparator is `L3EvidenceConfig::validate` (`l3_swarm.rs:345`). It checks `concurrency_ceiling != L3_CONCURRENCY_CEILING` (`:351-354`), where the constant is 64 (`:20`). The callers are `from_json` (`:331-338`) and `start_lane` (`:376-383`).
- A repo-wide grep for `L3EvidenceConfig|l3Evidence` found these outside tests: the definition, the re-export (`lib.rs:86`), and a sync list entry (`sync-ufo-contracts.mjs:447`, `l3Evidence.chain` model-authority, not the ceiling). The remaining hits are `.bak` copies, docs, and conformance vectors. Every `from_json`, `canonical()`, and `start_lane` call is in `l3_swarm_tests.rs` or `tests/conformance.rs` (`:1600`, `:2489`).
- No JS reader parses `l3Evidence.concurrencyCeiling`. Docs call it "retained inactive / shelved; declaration does not authorize workers" (`docs/BEHAVIOR-MATRIX.md:184`, `docs/L2-L3-ROUTING.md:154`).
- Verdict: a test-pinned declaration with no live enforcement (confirms the r2 row for native-concurrency-ceiling). Confidence: high for this tree.

## Changed
Nothing outside the corpus. One entry and one index row were appended.

## Unknown
- No live wall was exercised. (1) comes from reading the source in call order, not from an observed refusal.
- The grep for (3) covered `crates/` and `scripts/` plus a repo-wide name search. A reader that reaches the key through a generic JSON walk without naming it would not show up [INFERENCE: none seen].
