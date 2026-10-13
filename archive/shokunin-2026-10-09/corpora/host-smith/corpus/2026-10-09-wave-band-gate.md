# Gate 6 — wave-band gate (positive leg)

**Asked.** The real-CLI band probe, `buildWaveSpec`, `plannerEnv`, and the
constants.

**Observed.** `host/apply.mjs`.

- Constants: `WAVE_PROBE_LANES = 16` L71 (post-apply floor probe),
  `WAVE_CLI_PROBE_LANES = 32` L75 (real-CLI probe; inside both HEAD band 32–100
  and post-apply 16–32), `MAX_SWARM_LANES = 100` L65, `WAVE_ROLES` L85–88 (10
  roles, identical order to substrate `SWARM_ROLES`).
- `buildWaveSpec` L560–579: names `BandProbeLane001..032` via
  `padStart(3,'0')` — matches substrate `TASK_NAME_PATTERN`
  `/^[A-Z][A-Za-z0-9]{1,31}$/u` (`ufo-swarm-wave.mjs:271`, enforced
  `validateName` L706–712); roles rotate `WAVE_ROLES[i % length]` L566; all items
  are spawn lanes so `spawn = lanes`, `resume = 0`.
- `plannerEnv` L588–594: spreads `process.env` then binds
  `UFO_PROJECT_ROOT = opts.ufoRoot` and
  `UFO_CONFIG_PATH = <ufoRoot>/config/ufo.json`; consumed at
  `ufo-swarm-wave.mjs:122-124` (ROOT), `:135-137` (defaultConfigPath),
  `:381-384` (loadSwarmPolicy). Purpose (L580–587): the gate's ok line must read
  the exact file it reports, never an ambient pair.
- CLI leg L610–634: spec written to `mkdtempSync(tmpdir(),'hostcfg-wave-')` and
  removed in `finally` L695–697; runs
  `process.execPath scripts/ufo-swarm-wave.mjs plan --spec <spec>` with
  `cwd = opts.ufoRoot` and `env = plannerEnv({UFO_OMP_GLOBAL_CONFIG_PATH:
  CANDIDATE})`; asserts `counts.total === 32 && counts.spawn === 32` L630–632.
- Post-apply `postPolicy` L640–646 spreads `livePolicy` and overrides only
  `maxLanes`/`waveMinLanes`/`waveMaxLanes` from the delta; `minLanes` is
  inherited.

**Verified.** Dry run 6/8 ok: `real CLI: a 32-lane spawn wave plans clean (band
from config/ufo.json as it stands: 16-32)`.

**Divergence noted.** The source comment L72–75 calls the live band `32-100
pre-apply`, which matches HEAD, not the bytes the dry run reads (working-tree
`config/ufo.json:93-94` is already 16–32). 32 is an inclusive endpoint of both,
so the probe passes either way.

**Added.** 2026-10-09 · lane `WaveBandGate` (scout)