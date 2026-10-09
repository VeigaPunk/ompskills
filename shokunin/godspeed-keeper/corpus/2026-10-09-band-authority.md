# config/ufo.json — the live band the posture runs inside

**Asked:** the live band/ceiling values and which surfaces read them.
**Source:** `/home/vgpnk/Projects/ufo-fsd-alpha/config/ufo.json`, sha256
`0e416f0abc559e9a91bc0c35ea8abd913ba11e1a926db9f72dade2f73d5fa8b3`.

## Observed

- `sighting.dispatch.swarm` (:87-95): `maxLanes` 100, `minLanes` 16, `rampBatchSize` 5,
  `rampIntervalMs` 700, `waveMinLanes` **16**, `waveMaxLanes` **32**; plus a `note` naming the validator.
- `sighting.dispatch.maxConcurrentL1` = 16; `missionFormat.l1Alias` = `m_strong`;
  **`globalRunnerCeiling` lives at `sighting.dispatch.globalRunnerCeiling` = 1056** (:78) — there is **no**
  top-level `globalRunnerCeiling` key (`jq 'has(...)'` = false).
- **Launcher reads live** (`ufo-swarm-wave.mjs:773 options.policy ?? loadSwarmPolicy()`; loader
  `ufo-mission-result.mjs:2455-2530`): `maxLanes`, `minLanes`, `waveMinLanes`, `waveMaxLanes`,
  `rampBatchSize`, `rampIntervalMs`, `globalRunnerCeiling`. Not read by it: `maxConcurrentL1`, `l1Alias`
  (those live in `fleet-dispatcher.mjs:3749/3754` and the sighting surface).
- Enforcement: `ufo-swarm-wave.mjs:975-1015` `too_few_lanes` / `wave_too_wide` / `impossible_band` /
  `too_many_lanes`; hard cap `MAX_SWARM_LANES = 100` (`ufo-mission-result.mjs:2415`).
- **Snapshot vs live:** the L1 prompt's band rows are frozen literals built by
  `fleet-dispatcher.mjs:5315 buildDispatchBindingBlock` — :5387-5396 still read "a WAVE carries 16-100 L2
  lanes" and "16 <= N <= 100", **stale** against the live `waveMaxLanes` 32; `maxLanes` 100 matches. No
  `globalRunnerCeiling`/`maxConcurrentL1`/`l1Alias` row exists in the prompt. The live band wins; re-read
  before every wave.
- `skills/ufo/SKILL.md:341` still words the `l1Alias` default as `m_daybreak` (pre-config default, not this
  config's `m_strong`).

## Unknown

No second L1-prompt surface repeating band/ceiling rows (grep for `16-100` / `1056` / `maxConcurrentL1` in
prompt builders → empty).