# 2026-10-09 — seat routing as the wave tooling reads it

**Asked.** What role → `@alias` table does the candidate config declare, how
does the suite resolve route families at runtime, and what is the
single-family concentration check? (Lane `SeatRouting`, connector.)

**Observed.** Sources: `host/omp-agent.config.yml`;
`test/run-wave-test.mjs:116-160,998-1096`;
`/home/vgpnk/Projects/ufo-fsd-alpha/scripts/ufo-route-preflight.mjs:64,161`;
`host/ufo-sighting-dispatch.json:3-5,10`; `host/apply.mjs:392-397,541-545,974-980`.

- `task.agentModelOverrides` (`host/omp-agent.config.yml:222-236`) pins 14
  seats: 3 `@m_strong` (main, critic, planner), 5 `@m_mid` (connector,
  executor, reviewer, sentinel, revenger), 6 `@m_fast` (scout, scribe,
  simplifier, mutation-tester, distiller, labrat).
- Bucket routes: `m_strong` and `m_fast` share the primary
  `alibaba-token-plan/deepseek-v4.1-flash:max` (`:129`, `:141`); `m_mid` is
  `alibaba-token-plan/qwen3.8-flash:high` (`:139`); variants `m_mid_med`,
  `m_mid_low`, `m_fast_high` carry per-wave effort granularity and no seat
  pins to them.
- Family resolution is never hardcoded: `loadAuthorities`
  (`test/run-wave-test.mjs:123-142`) imports
  `scripts/omp-global-config.mjs` `readGlobalSeatRouting` against
  `CANDIDATE_GLOBAL_CONFIG` (`host/omp-agent.config.yml`, `:89`) and builds
  seat → `via.alias`; `familyOf` (`:145-147`) is a pure lookup. The
  `authority.pinned` / `mixedSpansFamilies` / `singleFamilyIsOne` checks
  (`:133-141`) re-validate the role constants against the live table;
  `routeFamilies` (`:998-1094`) passes the same path as `routingOptions`,
  recomputes expected alias totals from the authority, compares against the
  report's own `families[].alias`, and binds `report.config.sha256` to the file
  on disk (`:1073-1074`).
- `singleFamily` is defined in the substrate
  (`ufo-route-preflight.mjs:161`) as `families.length === 1 && largest > 1`,
  over families keyed by primary + ordered chain (`:64`) — finer than the
  alias, hence the `>=` assertion at `run-wave-test.mjs:1062`. Probe waves are
  declared at `waveMaxLanes` 32 (`host/ufo-sighting-dispatch.json:10`); the
  all-`@m_fast` 32-lane death shape is the negative case
  (`negative.routeFamiliesSingle`, `:1064-1066`); `negative.routePinned`
  encodes the collapse rule; `negative.routeUnprobed` (`:1070-1072`) proves an
  absent probe never refuses.
- No per-lane model param: `run.noModelParam` (`run-wave-test.mjs:588-589`)
  asserts no task carries a `model` key; lanes carry only the agent role
  (`ufo-swarm-wave.mjs:1385-1387`), resolved seat override → alias → route
  (`omp-global-config.mjs:7-10`).
- `missionFormat.l1Alias` is the bare `m_strong`
  (`host/ufo-sighting-dispatch.json:3-5`), enforced equal to `seats.main.alias`
  by `apply.mjs` (`:392-397`, `:974-980`, `:541-545`, replicating the
  `build.rs` gate).

**Changed.** Nothing — read-only research.

**Unknown.** Suite and `apply.mjs` were not executed (runtime check-message
values unobserved); `build.rs` was not read (rule reported via `apply.mjs`'s
replicated gate); the live `~/.omp/agent/config.yml` was not read (candidate
only); the live `--route-families` path is documented but only the
fixture-HOME path was seen in code.
