# band-ladder-probes — the live wave band, observed

Asked: the live wave-band boundaries, observed rather than read.
Command (by the L1): pure `plan` against a scratch root holding a real copy of the working-tree `config/ufo.json`
(`UFO_PROJECT_ROOT=$SC UFO_CONFIG_PATH=$SC/config/ufo.json UFO_FLEET_ALLOW_EXTERNAL_TOOLS=1 node scripts/ufo-swarm-wave.mjs plan --spec -`),
with N distinct spawn lanes of role `scout`.

| spawn lanes | result | message (verbatim prefix) |
| --- | --- | --- |
| 15 | `too_few_lanes` | a wave with spawn lanes needs at least 16 lanes (got 15); split the round's scope into waves of 16-32 same-sha… |
| 16 | ok | — |
| 32 | ok | — |
| 33 | `wave_too_wide` | a wave carries at most 32 lanes (got 33); split it into sequential waves of 16-32 |
| 100 | `wave_too_wide` | a wave carries at most 32 lanes (got 100) … |
| 101 | `too_many_lanes` | wave has 101 lanes; the cap is 100 (hard ceiling 100) |

Fallback probe: in the scratch copy, delete `waveMinLanes` and set `minLanes` 8. Then 7 lanes → `too_few_lanes` "needs at least 8 lanes (got 7); … waves of 8-32", and 8 lanes → ok.
So `minLanes` **is** the planner floor whenever `waveMinLanes` is absent.

- `too_many_lanes` fires before `wave_too_wide`: 101 reports the cap, not the width.
- Both band edges admit at equality: `<` for the floor, `>` for the ceiling.
- Corroborated by lanes `SwarmBandGates` (the same ladder) and `ApplyNumericGates` (16-32, 16-100, and 32-100 ladders in memory),
  and `MinLanesSemantics` (probes A–H).

Exit: a `SwarmWaveError` exits 1 (`ufo-swarm-wave.mjs:1432-1455`, lane `DispatcherPolicy`). Usage errors exit 64 (wave-smith's domain).
