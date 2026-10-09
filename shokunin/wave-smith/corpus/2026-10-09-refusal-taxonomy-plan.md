# refusal-taxonomy-plan — every typed code `plan` can raise, and in what order

Asked: the complete plan-time typed refusal taxonomy.
Source: `scripts/ufo-swarm-wave.mjs:768-1296` (`planSwarmWave`; 1297-1306 is the next
function's doc comment) + the sibling mappings at `:1371`, `:1392`. Lane: `RefusalsPlan`.

31 distinct codes are reachable from `plan` — 27 raised in this file, 4 mapped from siblings
(`route_unreachable`, `prior_refinement_refused`, `prior_refinement_overflow`, `usage`) —
all confirmed by grep and 12 of them by probe; every refusal is a `throw` from a pure
function, none after a lane spawns. (Round-2 correction: an earlier "26 codes" count had no
source-derivable basis; the table below is the authority.)

| class | codes |
| --- | --- |
| spec shape | `invalid_spec` (`:769,771,814,823,824,829,840,857,867,882,885,958,1141,1171,1183`) |
| path/policy | `invalid_policy`, `invalid_report_dir`, `invalid_registry_path`, `EXEC_PATH_OUTSIDE_ROOT` (thrown, not `fail()`) |
| roles/keys | `role_required`, `unknown_role`, `spawn_message_forbidden`, `prompt_with_template`, `item_required`, `prompt_required`, `resume_role_forbidden`, `resume_item_forbidden`, `resume_meta_forbidden`, `message_with_prompt` |
| names/ids | `invalid_name`, `invalid_resume_id`, `duplicate_name`, `duplicate_resume_id`, `duplicate_expansion` |
| band | `empty_wave`, `impossible_band`, `too_many_lanes`, `too_few_lanes`, `wave_too_wide` |
| registry/ownership | `invalid_registry`, `resume_unknown_member` |
| opt-in (mapped from siblings) | `route_unreachable` (`ufo-route-preflight.mjs:173`), `prior_refinement_refused`, `prior_refinement_overflow`, `usage` |

Evaluation order (observed by head-to-head probes):

1. `invalid_spec` spec-not-object → unknown spec key.
2. policy load → `EXEC_PATH_OUTSIDE_ROOT` | `invalid_policy`; injected-policy
   `invalid_policy` (band inversion typed as *policy*, never `impossible_band`).
3. `invalid_spec` `wave` → `context` → `template` size → placeholder → `hoist`.
4. `invalid_report_dir` / `invalid_registry_path` / `invalid_spec(wave segment)`.
5. `invalid_spec(spec axes/milestone)` → `spec.maxLanes` → `items` array.
6. per item in spec order: object → unknown key → `invalid_name` → resume arm
   (`invalid_resume_id`, `resume_role_forbidden`, `resume_item_forbidden`,
   `resume_meta_forbidden`×2, `message_with_prompt`) | spawn arm
   (`spawn_message_forbidden`, `role_required`, `unknown_role`, item `axes`,
   `prompt_with_template`, `item_required`, expansion bound, `prompt_required`).
7. `empty_wave` → `impossible_band` → `too_many_lanes` → `too_few_lanes` → `wave_too_wide`.
8. `duplicate_expansion` (spawns) → `duplicate_resume_id` (resumes).
9. priors load `invalid_registry` → cross-prior consistency `invalid_registry` →
   own registry `invalid_registry` → `resume_unknown_member` / inherited-binding
   `invalid_registry`.
10. `duplicate_name` → per-lane composition `invalid_spec`.

Observed head-to-heads: `unknown spec key` beats `maxLanes:0`; `invalid_policy` beats
`too_many_lanes`; `impossible_band` beats `too_few_lanes`; `too_many_lanes` beats
`wave_too_wide`; `duplicate_expansion` beats `resume_unknown_member`;
`resume_unknown_member` beats `duplicate_name`.

## Not carried by the source

- `invalid_member_name` appears only in a comment (`:544`) — it is raised by
  `ufo-swarm-collect.mjs:283`, not here.
- `route_unreachable` / `prior_refinement_refused` are propagated codes whose `fail()`
  sites live in the sibling modules, not in this file (0 grep hits).
- The swarm SKILL.md omits seven plan-only codes (`spawn_message_forbidden`,
  `prompt_with_template`, `item_required`, `prompt_required`, `invalid_report_dir`,
  `invalid_name`, `invalid_resume_id`) and double-lists `invalid_registry_path` /
  `invalid_registry` as record-only when the source also raises them at plan.

## Unknowns

- `prior_refinement_overflow` and the refinement module's `usage` arm were read from
  source, not probed (need a valid parent ledger).
- The inherited-binding `invalid_registry` arm (`:609/:616`) needs a resume whose owner
  row carries a bad `axes`/`milestone`; source-anchored.
