# host/omp-agent.config.yml — task.agentModelOverrides

**Asked.** The 14-seat table and its bindings.

**Observed.** `host/omp-agent.config.yml:222-236`, 14 seats:
`@m_strong`=3 (critic 224, main 228, planner 230), `@m_mid`=5 (connector 223,
executor 226, revenger 231, reviewer 232, sentinel 235), `@m_fast`=6 (distiller
225, labrat 227, mutation-tester 229, scout 233, scribe 234, simplifier 236).
Bucket primaries: `m_strong` :129, `m_mid` :139, `m_fast` :141.

Canonical seat list: `apply.mjs:77-81 MIRROR_SEATS` (same 14);
`apply.mjs:243-245` and `omp-global-config.mjs:518` fail on a missing seat.

- **`main` must be `@m_strong`:** the config comment L219–221, the delta's
  `missionFormat.l1Alias=m_strong`, `build.rs validate_generated_graph`
  (reads l1Alias ~559, rejects empty/leading-`@` ~566, requires
  `seats.main.alias === l1Alias` ~574–581), and `sync-global-routing.mjs:228/
  249/269`. Dry run: `seats.main.alias === l1Alias === "m_strong"`.
- **Concurrency:** `maxConcurrency: 32` L203 (omp's own subagent cap, *not* the
  delta's `maxConcurrentL1` 16); `maxRecursionDepth: 2` L206 (main → executor →
  probe).
- **Bundled-agent overlap:** only `reviewer` and `scout` share a ufo seat name;
  `omp agents unpack` lists 5 bundled agents (reviewer, scout, security-reviewer,
  sonic, task).

**Drift noted.** The comment at L195–202 claims `sighting.dispatch.swarm`'s
`waveMinLanes` was "raised from 16 to 32"; the delta
(`host/ufo-sighting-dispatch.json:8`) and `config/ufo.json:93` say 16
(`waveMaxLanes` 32 :94). `concurrencyCeiling` 32 matches; the `waveMinLanes`
claim does not — a stale comment contradicting the data it sits beside.

**Unknowns.** "every other key inert for omp" is a source comment with no
harness-visible enumeration path.

**Added.** 2026-10-09 · lane `ConfigAgentOverrides` (scout)