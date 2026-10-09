# resume-admission — who owns a handle at plan time, and where it lives

Asked: resume-ownership admission — registry path, `priorRegistry`, precedence, provenance.
Source: `scripts/ufo-swarm-wave.mjs:419-476, 1029-1080, 1123-1127, 1290-1294`. Lane: `ResumeAdmission`.

- Registry path (`:420-426`): `reportDir/swarm-registry.json` when declared, else
  `.ufo/scopes/<wave ?? "wave">/swarm-registry.json`. `wave` becomes a path segment, so
  `"/"`, `"\\"`, `"."`, `".."` → `invalid_spec` ("wave must be a single path segment…").
- `spec.priorRegistry` (singular key) accepts a **string or an array** of relative paths;
  `MAX_PRIOR_REGISTRIES = 16` over-limit → `invalid_spec`; entries pass
  `validateRelativePath(..., "invalid_registry_path")` and are deduped first-wins by
  exact relative spelling.
- Load order and precedence (`:1043-1057`): priors loaded first in declared order
  (`{required:true}`; a missing prior → `invalid_registry`), own registry loaded
  `{required:false}`; ids are inserted first-wins, so **own beats every prior**, then the
  earlier-declared prior. Only rows with a **string** `agentId` attest — admission never
  reads `kind`. Round-2 correction: "a resume row can never be the owner handle" is
  **false as written**: the planner mints resume rows with `agentId: null`, but `record`
  sets `agentId` on any member selected **by name** with no `kind` guard, so a resume row
  can hold a handle and a later wave can resolve it as the owner.
- `assertConsistentPriorClaims` runs whenever a prior is **declared**, even on a
  spawn-only wave: one `agentId` carrying contradictory `(member ?? rowKey, item ?? null)`
  across priors → `invalid_registry`; identical claims are lineage redundancy.
- Unknown handle → `resume_unknown_member` (`:1063-1066`), before any lane spawns.
- Provenance carry (`:1072-1079`): `lane.member = owner.member ?? owner.name`,
  `lane.memberItem = owner.item ?? null`, plus inherited `axes`/`milestone` via
  `inheritedJudgment`. A chained resume reads the previous resume row, which itself
  copied the spawn binding, so the contract does not decay per wave.
- Resume registry row (`:1123-1126`): `{kind:"resume", agentId:null, member, item[,
  axes][, milestone]}` keyed by the dispatch name; the task entry (`:1127`) carries the
  handle as `resume`.
- Carried forward: `plan.priorRegistries` (normalized array) and `plan.registry.members`;
  the registry doc persists `priorRegistries` so `record` can re-validate under its lock.
  The **dispatch payload does not** carry `priorRegistries`.

Observed (scratch root, prior = a real copy of the fleet's 101-row priors registry):

| case | outcome |
| --- | --- |
| known handle + `priorRegistry` | accepted; `member` = row key (`PriorLane01`), `item` null |
| unknown handle + `priorRegistry` | `resume_unknown_member`, exit 1 |
| known handle, no prior, own registry absent | `resume_unknown_member`, exit 1 |
| own registry row on the same id + prior | accepted, **own wins** (`member` = own row) |
| `items[0]` resume + 16 spawns | accepted, `counts {16,1,17}`, `tasks[0]` is the resume |
| resume-only 40 lanes | accepted (above the 32 ceiling — resume-only is exempt) |

## Not carried by the source

- No idle/liveness check on a resumed agent (kimi's `requireIdleSubagent` is named as
  parity intent only); admission proves registry membership, nothing more.
- Provenance bytes are fixed at admission; `record` re-validates ownership, not
  provenance.

## Unknowns

- `record`-time provenance drift is unprobed; the prior-registry variant of the
  inheritance path shares the code but was not exercised directly.
