# spawn-bearing band refusals — 15 / 33 / 101 lanes, and what each message prescribes

Asked: for a **spawn-bearing** wave, which typed refusal fires at (a) 15 total lanes,
(b) 33 total lanes, (c) 101 total lanes, and what each refusal message prescribes.
Source: `scripts/ufo-swarm-wave.mjs:982-1009` (`planSwarmWave` band gates);
`config/ufo.json` `sighting.dispatch.swarm` (live band 100/16/16/32). Lane: `WaveSmithSmoke`.

## Answer (live band: `maxLanes 100`, `waveMinLanes 16`, `waveMaxLanes 32`)

| lanes | code | exit | message (verbatim) |
| --- | --- | --- | --- |
| 15 | `too_few_lanes` | 1 | `a wave with spawn lanes needs at least 16 lanes (got 15); split the round's scope into waves of 16-32 same-shape lanes` |
| 33 | `wave_too_wide` | 1 | `a wave carries at most 32 lanes (got 33); split it into sequential waves of 16-32` |
| 101 | `too_many_lanes` | 1 | `wave has 101 lanes; the cap is 100 (hard ceiling 100)` |

All three are `ufo-swarm-wave-error-v1` envelopes on stderr, exit 1, raised **before any
lane spawns** (pure `plan`). Confirmed by probe (`plan --spec`, three specs of
`{item,prompt,role:"scout"}` lanes) — output matched the table byte-for-byte.

## Why each fires (gate order, `:989-1009`)

The gates run in this fixed order, first failure wins:

1. `:989` `impossible_band` — `spawns>0 && laneCeiling < laneFloor` (needs a per-spec
   `maxLanes` below the floor; not reachable at 15/33/101 with the live band).
2. `:995` `too_many_lanes` — `total > cap` (unguarded; binds resume-only waves too).
3. `:998` `too_few_lanes` — `spawns>0 && total < laneFloor`.
4. `:1004` `wave_too_wide` — `spawns>0 && total > laneCeiling`.

- 15 lanes: below the floor 16 → `too_few_lanes` (`:998-1003`).
- 33 lanes: above the ceiling 32 but below the cap 100 → `wave_too_wide` (`:1004-1009`).
- 101 lanes: `total > cap` fires **first** at `:995` → `too_many_lanes`; `wave_too_wide`
  is never reached. This is the precedence the taxonomy entry records as
  "`too_many_lanes` beats `wave_too_wide`".

Band derivation feeding the gates: `laneFloor = policyFloor` (`:982`, never clamped to
cap); `laneCeiling = min(policyCeiling, cap)` (`:983`); `cap = min(policyMaxLanes,
spec.maxLanes)` with `policyMaxLanes = min(policy.maxLanes ?? 100, 100)` (`:794-795`).
Live config reads `maxLanes 100 / minLanes 16 / waveMinLanes 16 / waveMaxLanes 32`, so
floor 16, ceiling 32, cap 100.

## What each message prescribes

- `too_few_lanes` prescribes **splitting the round's scope into waves of 16-32 same-shape
  lanes** — it names the floor–ceiling window, not a single size.
- `wave_too_wide` prescribes **splitting into sequential waves of 16-32**.
- `too_many_lanes` prescribes nothing about splitting; it only states the cap (100) and
  the hard ceiling. The actionable fix is to reduce the wave to ≤100 lanes (the band
  ceiling 32 then applies on the next evaluation).

## Fold tension (reconfirmed, no side taken)

Neither `too_few_lanes` nor `wave_too_wide` mandates even sizing or forbids folding; both
prescribe a 16–32 window. Folding a short tail into a **full** 32-lane wave is refused by
`wave_too_wide`; folding into a non-full wave is admitted by the gates. The fleet's L1
prompt (`ceil(N/32)` even sizing, never fold into a full wave) is stricter than the
validator. Matches `2026-10-09-skill-reconcile.md`.

## Not carried by the source

- No round-level accumulation: the cap is per **wave**; "100 per round" is L1 discipline.
- `globalRunnerCeiling` has no coupling to these gates.

## Unknowns

- None new. The three cases are probe-confirmed; the message wording is operator prose and
  intentionally unpinned by the suite.
