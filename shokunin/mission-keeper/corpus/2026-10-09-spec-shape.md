# spec-shape — Wave spec shape and refusal codes

Item: step 3 spec fields (`sighting/l1-prompt.md:78-106`) cross-checked against the validator.

Observed:
- Spec path `{{stateDir}}/waves/{{missionId}}-r<N>-w<k>.spec.json`; a real instance `waves/test-smith-r1-w1.spec.json`.
- Pairwise-distinct prompts (`duplicate_expansion`); a template needs `{{item}}` else `invalid_spec`; lane names unique (`duplicate_name`).
- One explicit taxonomy role per spawn lane from the ten (SWARM_ROLES `:258-269`); frozen seats refused (`role_required`/`unknown_role`).
- Round axis set = spec-level `axes` default, item-level wins OUTRIGHT (not merged); shape 1-8 distinct ≤256 B; resumes inherit the spawn binding.
- Single-segment `wave` id (`invalid_spec` on `/`, `.`).
- `reportDir` MUST be relative (`validateRelativePath` → `invalid_report_dir` on absolute/backslash/empty-or-dot segments); resolves under `UFO_PROJECT_ROOT`.
- Resume item carries ONLY `resume` + `message`; three codes: `resume_role_forbidden`, `resume_item_forbidden`, `resume_meta_forbidden` (fires for both axes and milestone). (Validator is actually looser than "only": `name` and the `prompt` alias for `message` are legal.)
- Godspeed: the renderer leads every spawn lane idempotently; resume never carries it; hand-writing is discipline, not a typed gate.

Evidence: `SpecShapeContract.md`.
Unknowns: no refusal code exercised at runtime (all quoted from validator source).
