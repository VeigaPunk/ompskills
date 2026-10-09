# config-ufo-json — config/ufo.json: sections, authority vs annotation

Asked: the top-level sections of `config/ufo.json` and which are authority vs annotation.
Source: lane ConfigUfoJson report. Anchor: ufo-fsd-alpha@5ace2559; file 379 lines / 11,999 bytes,
worktree sha256 `0e416f0abc559e9a…`, HEAD blob sha256 `7efc813b…` (**worktree is ` M`**).

## Observed

- 14 top-level keys: `orchestrator, automaticSubstrate, runnerUpSubstrate, fixtureRoundBudget,
  proposalsPerLane, drills, budgets, membrane, sighting, nativeProfiles, fixtureAxes, lanes,
  substrates, targets`.
- Dispatch authority read at this revision: band `waveMinLanes 16` / `waveMaxLanes 32` (`:93,94`;
  `loadSwarmPolicy` `ufo-mission-result.mjs:2503-2519`, enforced by `planSwarmWave`
  `ufo-swarm-wave.mjs:773`), `maxLanes 100` (`:88`; clamps only against the hard 100,
  `ufo-mission-result.mjs:2415,2469`), `minLanes 16` (`:89`), `maxConcurrentL1 16` (`:79`;
  required-never-defaulted, `fleet-dispatcher.mjs:3749-3751`, `ufo-sighting-lib/base.mjs:166-168`),
  `windowPaneCeiling 16` (`:71`), `globalRunnerCeiling 1056` (`:78`), `l1Alias m_strong` (`:85`).
- Uncommitted worktree diff vs newest backup: `minLanes 64→16`, `waveMinLanes 32→16`,
  `waveMaxLanes 100→32`; `git show HEAD:config/ufo.json` is `7efc813b…` (band 64/32-100).
- `orchestrator.route = local/fixture-primary` with role "portable contract fixture; not the
  canonical judge" (`:3-4`); refused otherwise (`src/orchestrator.ts:279-280`,
  `sync-ufo-contracts.mjs:1284-1291`).
- `note` fields are contract prose inside data: typed-checked (`drills.note must be string`
  `sync:1387-1389`; profile `.note` nonempty `run-omp-native-trial:599-600`) and closed-vocabulary
  checked (`sync:1392-1395`), but carry no runtime branch.
- Mirror keys must not drift silently: `tmuxSession`/`tmuxWindow`/`twinMaxDepth` are "projected but
  never consumed", so boot **fails** on disagreement (`base.mjs:180-191`).
- Config bytes are digest-bound at three points: judge contract hash (`native_contract.rs:33,67,428-431`),
  drills suite (`ufo-drills.mjs:432`), launch metadata `contractHash`
  (`collect-omp-native-handoff.mjs:351-352`).
- Dual surface: the live daemon/launcher layer reads `config/ufo.json`; the portable fixture loop
  reads same-named `budgets`/`membrane`/`recovery` fields from `config/orchestration.json`
  ("same names, separate surface", `config.rs:146-148`) — that file is **absent** in this tree.

## Contract

| rule | carrier |
| --- | --- |
| All 14 top-level keys are code-read except `runnerUpSubstrate` (validation-only) | report table |
| `*.note` fields are contract prose, shape-checked, never branched on | `sync:1387-1395` |
| Project owns topology, never model authority: seat routes, fallback chains, model catalogs, L3 chain are **forbidden** keys in `nativeProfiles` | `assertNoProjectModelAuthority` `sync:450-462`; `build.rs:5-7` |
| Hard ceilings live in code; config only tightens (`maxLanes` ≤ 100; `windowPaneCeiling` defaults 16; `maxConcurrentL1` required) | `ufo-mission-result.mjs:2422-2427,2469`; `fleet-dispatcher.mjs:3739-3751` |
| `drills.enabled` is no longer a live gate (stripped `91cc18fe`); only shape validation remains | `sync:1372-1374`; `grep drills scripts/gates.sh` → 0 |
| `lanes[]` carries only `{id, role, substrate}` — no spawns, no per-lane model | report |

## Not carried by the source

- `loadBandAuthority` — **no such symbol anywhere in the tree**; band authority is `loadSwarmPolicy`
  (hub) + dispatcher validation. (The mission brief's phrase is not carried by the source.)
- `rateCard` inside `budgets` is referenced by `budgets.note` and allowed by `validate_native_budgets`
  (`lib.rs:415`) but is **absent** from this config's budgets block (`:14-22`).
- No model/route knobs anywhere (`modelRoutes`, `modelFallbacks`, `eligibleRoutes`, `tokenPlan`,
  `kimiOAuth`, `l3Evidence.chain`) — prohibited, not optional (`sync:450-462`).

## Unknowns

- Which band the live fleet actually dispatched with (the uncommitted edit post-dates HEAD; daemons
  that loaded config at boot keep their snapshot unless they re-read per tick — the stale watchdog
  re-reads per mission-id, `ufo-stale-watchdog.mjs:799`). Live process state UNOBSERVED.
- Why the worktree carries an uncommitted band edit against a commit message announcing
  "wave band 32-100" — intent UNOBSERVED.