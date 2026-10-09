# resume-only-band-gates — which band gates bind a resume-only wave, and its legal width

Asked (Main, 2026-10-09): under the live config, which band gates apply to resume-only
waves and which are exempt, and what is the widest legal resume-only wave.
Corpus first (`band-arithmetic`, `r3-reverification-band-resume-registry`), then source,
then `plan` probes at the exact boundary. Revision anchor re-confirmed in passing:
scratch copy of `config/ufo.json` sha256 `0e416f0abc559e9a…` matches the seeded anchor.

## The gate split (all in `planSwarmWave`, `scripts/ufo-swarm-wave.mjs`)

| gate | code | condition | line | spawn-guarded? |
| --- | --- | --- | --- | --- |
| zero-lane guard | `empty_wave` | `total === 0` | `:978` | no (but not a band gate) |
| feasibility | `impossible_band` | `spawns.length > 0 && laneCeiling < laneFloor` | `:989-994` | **yes — exempt** |
| cap | `too_many_lanes` | `total > cap` (bare) | `:995-996` | **no — binds resume-only** |
| floor | `too_few_lanes` | `spawns.length > 0 && total < laneFloor` | `:998-1002` | **yes — exempt** |
| ceiling | `wave_too_wide` | `spawns.length > 0 && total > laneCeiling` | `:1004-1008` | **yes — exempt** |

So for a resume-only wave the band reduces to ONE size rule: `total ≤ cap`.
Three independent source comments say the same thing: the header
(`:16-18`, "a resume-only wave may be a single lane (kimi hasMinimumAgentSwarmInputs)"),
the gate-block comment (`:987-988`, "Resume-only waves are exempt: they carry no spawn
band obligation"), and the hub (`ufo-mission-result.mjs:2414`, "minimum 2 unless
all-resume"). The `impossible_band` message itself prescribes the exemption
(`:992`: "…raise spec.maxLanes or **dispatch resumes only**").

Derivation anchors: `policyMaxLanes = min(policy.maxLanes, MAX_SWARM_LANES)` (`:794-795`;
`MAX_SWARM_LANES = 100` at `ufo-mission-result.mjs:2415`), `policyFloor`/`policyCeiling`
(`:796-805`), `cap = policyMaxLanes` tightened by per-spec `maxLanes`, clamped never
widened (`:853-863`). Live config (`config/ufo.json:87-94`): `maxLanes 100` (`:88`),
`minLanes 16` (`:89`), `waveMinLanes 16` (`:93`), `waveMaxLanes 32` (`:94`) →
policy `100/16/16/32`, cap `100` with no spec `maxLanes`. `globalRunnerCeiling` 1056
(`config/ufo.json:78`) is echoed in `plan.policy` but has **no** arithmetic coupling to
the band (probe A's policy block shows both side by side).

## Widest legal resume-only wave: 100 lanes

`too_many_lanes` fires only when `total > cap` (`:995`); with no per-spec `maxLanes`,
cap = 100 → 100 admitted, 101 refused. The ceiling 32 does NOT apply (probe A: 100 > 32
yet admitted). A per-spec `maxLanes` tightens only (probe D). Non-band gates still
apply on top: `empty_wave` (`:978`), `resume_unknown_member` admission against own
registry + declared priors (`:1047-1067`), `duplicate_resume_id` (`:1019-1025`), and the
1 MiB spec bound (`MAX_SPEC_BYTES`, `:153`).

## Probes (all `plan`, pure — scratch `/tmp/ws-resume-band`, byte-identical config,
`prior/swarm-registry.json` with 101 spawn rows `agent-001`…`agent-101`; env
`UFO_PROJECT_ROOT=/tmp/ws-resume-band UFO_CONFIG_PATH=…/config/ufo.json
UFO_FLEET_ALLOW_EXTERNAL_TOOLS=1`; post-run `find` shows no `reports/`, no `.ufo/`, no
registry — plan persisted nothing)

| probe | spec | exit | result |
| --- | --- | --- | --- |
| A | 100 resume lanes, declared prior | 0 | `counts {spawn:0,resume:100,total:100}`; policy echoes `100/16/16/32, source:"config"` |
| B | 101 resume lanes, same prior | 1 | `too_many_lanes` — "wave has 101 lanes; the cap is 100 (hard ceiling 100)" (verbatim `:996`) |
| C | 1 resume lane | 0 | floor exemption — a 1-lane spawn wave would die `too_few_lanes` |
| D | 4 resume lanes + `maxLanes: 4` | 0 | `impossible_band` exemption — cap 4 < floor 16 admitted for resume-only (`declaredMaxLanes:4` visible) |
| E | 4 spawn lanes + `maxLanes: 4` (control) | 1 | `impossible_band` — "spec.maxLanes 4 is below the wave floor 16…" (verbatim `:992`); same numbers, spawn-guard fires |

Probe E is the exemption proof: identical arithmetic to D, refused only because
`spawns.length > 0` unlocks `:989`.

## What changed / relationship to prior entries

- No contract change. This entry extends `band-arithmetic` and
  `r3-reverification-band-resume-registry` (which probed 40 admitted / 101 refused)
  with the **exact 100/101 boundary**, the **1-lane floor exemption** (probe C), and
  the **`maxLanes`-below-floor exemption** for resume-only waves (probe D vs E).
- Line citations here were re-derived from source by direct read/grep this run
  (`:978`, `:982-983`, `:989`, `:995-996`, `:998`, `:1004`), matching the r3 anchors.

## Unknowns

- `run`/`record` not exercised (forbidden in this environment): a 100-lane resume
  wave's on-disk registry and dispatch payload rest on `plan` output plus the
  documented persist path, not a post-`run` file.
- The 100-admitted probe proves band admission only; per-lane resume resolution at
  that scale is one `resume_unknown_member` per unresolvable id, exercised at the
  gate level by r3, not re-walked here for all 100 lanes individually.
