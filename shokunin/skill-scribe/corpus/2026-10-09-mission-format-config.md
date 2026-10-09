# live band / ceiling / membrane values and their citations

**Asked:** the live values of every sighting/membrane key the skill prose cites.
**Source:** `/home/vgpnk/Projects/ufo-fsd-alpha/config/ufo.json` (read 2026-10-09).

## Observed (live values)

| key | live value |
| --- | --- |
| `sighting.windowPaneCeiling` | 16 |
| `sighting.dispatch.globalRunnerCeiling` | 1056 |
| `sighting.dispatch.maxConcurrentL1` | 16 |
| `sighting.dispatch.missionFormat.id` | `nightcall` |
| `sighting.dispatch.missionFormat.configPath` | `config/mission-nightcall.yml` |
| `sighting.dispatch.missionFormat.defaultIterateRounds` | 1024 |
| `sighting.dispatch.missionFormat.l1Alias` | `m_strong` |
| `sighting.dispatch.swarm.maxLanes` | 100 |
| `sighting.dispatch.swarm.minLanes` | 16 |
| `sighting.dispatch.swarm.rampBatchSize` / `rampIntervalMs` | 5 / 700 |
| `sighting.dispatch.swarm.waveMinLanes` / `waveMaxLanes` | 16 / 32 |

`membrane.paths`: 11 globs (`crates/ufo-core-runtime/**`, `crates/ufo-cli/**`,
`scripts/collect-omp-native-handoff*`, `scripts/sync-ufo-contracts.mjs`,
`scripts/run-omp-native-trial.mjs`, `scripts/ufo-sighting*`, `config/ufo.json`,
`config/the-tick.machine.json`, `skills/ufo/SKILL.md`, `skills/ufo/references/**`,
`ssot/godspeed-core/directive.md`).

## Citation check

- In-repo skills `.omp/skills/tower/SKILL.md` and `.omp/skills/swarm/SKILL.md`: **consistent** —
  they cite the keys plus only band 16-32, `maxLanes` 100, `minLanes` 16, ramp 5/700, all
  matching live. `.omp/skills/shokunin/SKILL.md` cites none of these keys.
- `config/mission-nightcall.yml` is an overlay carrying **no** `sighting.*` key
  (`extendedContext: true`, `advisor.enabled`, `task.maxConcurrency`, `retry.*`); its comment
  "sequential 16-32 lane waves" matches the live band.
- Substrate `skills/ufo/SKILL.md` **stale** at L339/L341/L348/L385/L386: "16-100 lane waves",
  "at most 32 live L1s", `minLanes` 64, `l1Alias` `m_daybreak`.
  `skills/ufo/references/run-logic.md` stale at L20/L519/L738/L776/L1039/L2282/L2285/L2300/L2309/L2329.
- Both `config/ufo.json` and `skills/ufo/SKILL.md` are in `membrane.paths`, so fixing the
  stale substrate citations is operator-signature territory (`authority_boundary`).
- HEAD commit subject `5ace2559` says "wave band 32-100" but the file has 16/32 — the file is
  the authority.

## Remaining unknown

Whether the substrate checkout is the exact `<ufoRoot>` the OMP skills resolve against at
runtime (inferred: yes — it is the only ufo root present).
