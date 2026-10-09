# toctou-revalidation — the lock-time resume recheck and the prior-claim replay

Asked: `revalidateResumeOwnership` and the lock-time replay of prior claims.
Source: `scripts/ufo-swarm-wave.mjs:1575-1618, 1546, 1566-1574, 1591-1593, 1035-1047`;
suite `ufo-swarm-wave.test.mjs:1278, 1317, 1461, 1505, 1570`. Lane: `ToctouRevalidation`.

Invariant: every planned resume id must still resolve, **inside the registry lock**, over
the merged member map plus **fresh** reads of every declared prior; else
`resume_unknown_member` with the remedy "re-run the wave against the published registry".
It runs between the merge (`:1527-1530`) and the publish (`:1561`), and every rejection
unwinds before the single `writeRegistry` call — so a refused wave leaves the **registry
bytes** unmutated and emits no payload. (Round-2 correction: "zero disk mutation" is too
strong — `withRegistryLock` calls `mkdirSync(dirname(registry), {recursive:true})` at
`:675` *before* the callback, so a refusal can still create the registry's parent
directory. The source claims only "BEFORE `writeRegistry` publishes the broken map".)

- Freshness rationale (source, `:1566-1574`): the atomic rename gives each load one
  consistent snapshot, and the lock fences the merge; freshness matters because
  "admission's reads happened before the lock, and `record` can have rewritten rows in
  between".
- `displacedBySelf` transfer exemption (`:1609-1612`): when the row under the lane's own
  name is the row that displaced the recorded handle, the resume lane is a deliberate
  alias — ownership continues instead of failing. Pinned by
  `resume_alias_reset_surfaced_on_run` (`handlesReset` names the death, the row lands
  null, exactly one resume send ships).
- Stranger displacement is refused: `resume_ownership_revalidated_under_registry_lock`
  (a same-name **spawn** lane passes lock-free admission, the merge resets the owner row,
  and the run dies typed before the write). The cross-wave collision guard keeps
  precedence for that pin by excluding resume-claimed handles.
- Cross-prior claim replay runs whenever priors are **declared** — at `:1591`, before the
  resume-lane early return at `:1592-1593`, and mirrored at admission (`:1046` outside
  `if (resumes.length > 0)`). Rationale: every wave persists `priorRegistries`, so a
  spawn-only persist that published past a contradictory prior set would plant a
  landmine `record` must refuse later. Registry-level, even for untargeted ids.

Three replay sites, one shared comparison shape (normalized claim `(member ?? rowKey,
item ?? null)`) so they cannot drift: plan admission, persist, record.

## Not carried by the source

- A hand-executed `plan` payload has no lock-time recheck; the fence closes only the
  `run` path.
- Prior-registry races are snapshot-only, never fenced.

## Unknowns

- The permanent TOCTOU window is bounded by millisecond-scale critical sections; no
  cross-process `plan` read is fenced.
- The aliased-reset behavior was verified from the suite pins and source, not re-probed
  by this lane.
