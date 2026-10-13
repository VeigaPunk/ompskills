# reverify-launchers-layering-band — native trial, overlay order, swarm band

Asked (re-verification dispatch `NightcallReverify`): (1) does the native-trial
Main load `config/mission-nightcall.yml`, and which L1 launchers pass it;
(2) which value wins when a later fleet `--config` overlay and nightcall both set
`retry.modelFallback`, compared with `PI_CONFIG_FILES`; (3) the swarm wave band
in HEAD versus the working tree. Hashes are unchanged from the index header
(`mission-nightcall.yml` `64ae2a83…`, `ufo.json` `0e416f0a…`); substrate HEAD is
`5ace2559` and `config/ufo.json` is ` M`.

## 1. Launchers
- Native trial (`scripts/run-omp-native-trial.mjs`): **no**. grep for
  `--config|PI_CONFIG_FILES|mission-` → 0 hits. The Main argv is `:3918-3926`
  (`--cwd`, `--session-dir`, `--no-title`, `--max-time 2h`, `--model
  ompModelFlag(policy)`, `--print-thoughts`, `--auto-approve`). It reads
  `missionFormat.l1Alias` from the live `config/ufo.json` snapshot (`:702`,
  resolved `:716`). It does not load the overlay, but it requires
  `.omp/config.yml` to project the same retry/extendedContext/maxConcurrency
  values (`:495-557`). Stale comment: `:699` still says `(m_daybreak)`.
- Dispatcher (`scripts/fleet-dispatcher.mjs`): `ompChildArgv` puts
  `"--config", task.configPath` at `:8497`. `:8717` writes the body to
  `dispatch-snapshot-<n>/config.json` (`:8640`), and `:8719-8720` swaps the argv
  value to that path. The child loads a byte copy, not the canonical path.
  There is exactly one `--config`, and the dispatcher has no overlay mechanism
  (grep `overlays|PI_CONFIG_FILES` → 0).
- Tower (`sighting/tower-fleet.mjs`, ompskills): committed `ada7a90` `:476`
  has one hardcoded `--config <ufoRoot>/config/mission-nightcall.yml`. The
  working tree (` M`, uncommitted) has it at `:489`, followed by
  `...mission.overlays` as further `--config` (`:490`), with spec parse at
  `:377-381`.

## 2. Layering (observed this run)
- Probe overlay `retry: {modelFallback: false}` in scratch:
  `PI_CONFIG_FILES=nightcall:probe` → `false`; `probe:nightcall` → `true`;
  `nightcall:probe` `retry.fallbackRevertPolicy` → `never`. The later file wins
  the scalar. The `retry` object deep-merges, so nightcall's sibling keys survive.
- The `--config` equivalence is from `config-flag-equivalence` (an RPC probe,
  not re-run here). The order is: env entries first, then argv `--config` in
  order (`omp://config-usage.md:175,182`; `omp://settings.md:158,306`). So
  tower `--config nightcall --config overlay.yml` gives the overlay's value,
  the same as `PI_CONFIG_FILES=nightcall:overlay`. Any `PI_CONFIG_FILES` entry
  loses to every `--config`.
- Only the tower working tree can express "add an overlay after nightcall". The
  dispatcher cannot do it.

## 3. Swarm band (`sighting.dispatch.swarm`, `config/ufo.json:88-94`)
- HEAD: `maxLanes 100`, `minLanes 64`, `waveMinLanes 32`, `waveMaxLanes 100`.
- Working tree: `100`, `16`, `16`, `32`. `git diff --stat` shows 3+/3-.
- `missionFormat` is identical in both (`nightcall`,
  `config/mission-nightcall.yml`, `1024`, `m_strong`).

## Unknowns
- The `--config` vs `--config` scalar case was not re-probed via RPC this run.
  It relies on the earlier observed equivalence plus the docs.
- Who made the uncommitted band and tower edits is unknown.
