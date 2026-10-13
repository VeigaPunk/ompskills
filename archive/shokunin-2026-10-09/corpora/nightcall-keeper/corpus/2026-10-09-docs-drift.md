# docs-drift — which prose still describes the old format

Lane `DocsDriftCensus` (critic).

All of these DIVERGE from live `config/ufo.json`, and all match the bundled
mirror / commit `48f2e17b` era:
- `l1Alias` default `m_daybreak`: `AGENTS.md:123,143-144`,
  `docs/BEHAVIOR-MATRIX.md:33,43-44,249-250,275`,
  `skills/ufo/references/run-logic.md:518-519,1038-1039,2300-2301`. Live is
  `m_strong`, and no `.md` mentions `m_strong`.
- `maxConcurrentL1` 32: `AGENTS.md:203-205`, `BEHAVIOR-MATRIX.md:12,27,180`,
  `run-logic.md:2286`. Live is 16.
- Swarm 16–100 / minLanes 64: `AGENTS.md:150-166`, `BEHAVIOR-MATRIX.md:35`,
  `run-logic.md:738,776,782`. Live is 16–32 / 16.
- `scripts/fleet-dispatcher.mjs:5387-5388` hardcodes "a WAVE carries 16-100 L2
  lanes" into minted L1 prompts.

MATCHES: `id` nightcall, `configPath`, `defaultIterateRounds` 1024,
`globalRunnerCeiling` 1056, `autoDispatchMissions`, `swarm.maxLanes` 100, and
ramp 5/700.

Rule for answers: cite `config/ufo.json` bytes for alias, L1 ceiling, and band.
Quoting these docs reproduces a contract two generations stale.
