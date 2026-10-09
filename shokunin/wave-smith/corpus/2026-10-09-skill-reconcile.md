# skill-reconcile — the swarm/shokunin SKILL.md claims against the validator

Asked: reconcile `.omp/skills/swarm/SKILL.md` and `.omp/skills/shokunin/SKILL.md` with the
validator. Source: `.omp/skills/swarm/SKILL.md`, `.omp/skills/shokunin/SKILL.md`,
`scripts/ufo-swarm-wave.mjs`, `ufo-mission-result.mjs`, `config/ufo.json`, and this fleet's
L1 prompt. Lane: `SkillReconcile`.

Every numeric/structural claim enumerated below **MATCHES** the validator — the 16–32
band counting spawns+resumes (config `:93-94`; the band is read live, so quote the config
and the loader, never a frozen constant); the 100 member ceiling (per-**wave** enforcement
only); `minLanes 16` as a policy floor that gates only when `waveMinLanes` is undeclared;
the built-in minimum 2 in a band-less policy; the spawn-gated floor/ceiling with the
resume-only exemption; the ten roles and the frozen seats; resume via
`hub send --to <entry.resume> --message <entry.message>`; no per-lane model; axes bounds
and item-wins precedence; the leading `/skill:godspeed` with no invocation on resumes.

The drift table below is where the skill's wording departs from the source.

Drifts and gaps worth stating instead of paraphrasing:

| claim area | what to write |
| --- | --- |
| round budget | the validator enforces 100 **per wave**; round-wide accumulation is L1 discipline, not a refusal |
| `--emit-tasks` | the skill never names it; the validator makes it `plan`-only (`:1830-1833`) |
| `minLanes` | teach the fallback chain `waveMinLanes → minLanes → 2`, not "16 is the round floor" |
| band source | always quote the live config read; a launcher snapshot is not authority |
| shokunin-as-role | the mechanism is a closed `SWARM_ROLES` Set → `unknown_role`, which is *why* a shokunin routes through direct `task` calls |
| card format | frontmatter/body/corpus rules are host/OMP territory; the validator carries only the lane-side mirrors (key whitelists, binding suffix). Never attribute card-format enforcement to the validator |
| `invalid_registry_path` / `invalid_registry` | the skill lists `invalid_registry` at **both** surfaces (plan group and record group) and `invalid_registry_path` record-only; the source raises both at **plan** (`:462-464`, `:1046`) |
| plan-only codes | the skill's list omits seven (`spawn_message_forbidden`, `prompt_with_template`, `item_required`, `prompt_required`, `invalid_report_dir`, `invalid_name`, `invalid_resume_id`) — it says the list is not the full set, so it is an omission, not a false claim |
| resume-only bound | "bounded only by the member cap" is accurate only because the cap includes a spec `maxLanes` tightening; `too_many_lanes` is unguarded |

**The fold tension (observed, no side taken).** The swarm skill sizes a round as
"sequential waves of at most the ceiling when N exceeds it (**fold a short tail into the
previous wave**)". This fleet's L1 prompt says the opposite: "never fold a short tail into
a full previous wave … split it into `ceil(N/32)` sequential waves sized as evenly as
possible". The validator mandates **neither** even sizing nor no-folding: it only refuses
`total > laneCeiling` (`wave_too_wide`) and `total < laneFloor` (`too_few_lanes`), and both
messages prescribe splitting into sequential waves of floor–ceiling (`wave_too_wide`:
"split it into sequential waves of 16-32"; `too_few_lanes`: "split the round's scope into
waves of 16-32 same-shape lanes"). So folding into a
**full** 32-lane wave is refused by the gate; folding into a non-full wave is admitted by
the gates yet forbidden by the prompt. The two prose guides disagree with each other more
than either disagrees with the validator.

## Not carried by the source

- Card frontmatter/body format, corpus layout, dispatch-by-name: no validator code parses
  agent cards.
- Round-wide lane accumulation and host concurrency knobs are host/L1 discipline.

## Unknowns

- Whether the suite pins the band-gate message wording (it does not — operator prose is
  intentionally unpinned).
- The intended resolution of the fold tension is an L1 judgment; this lane reports the
  disagreement.
