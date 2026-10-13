# registry-persist-merge — merge, handle reset, and the cross-wave collision guard

Asked: `persistWaveRegistry` — how `run` merges this wave over an existing registry.
Source: `scripts/ufo-swarm-wave.mjs:1460-1562, 1877-1878, 1326`. Lane: `PersistMerge`.

- Merge (`:1527-1530`): `{...(existing === null ? {} : Object.fromEntries(existing.members)),
  ...plan.registry.members}` — `existing.members` is a **Map**, so it is rebuilt through
  `Object.fromEntries` before the spread (a raw Map spread would yield `{}`); the
  semantics are name-keyed, plan-rows-win. The plan's rows are always minted
  `agentId: null` (spawn `:1145`, resume `:1123`), so the "reset" **is** the overwrite,
  not an assignment.
- `handlesReset` (`:1518-1526`): every plan row whose prior held a **differing string**
  `agentId`; surfaced on the payload only when non-empty (`:1877-1878`, `:1326`). It
  names ownership dying, so a same-wave re-run is deliberate but never silent.
- `wave_registry_collision` (`:1484-1507`) — pre-checked inside the lock, before any
  write, and only when: `existing.wave` is a **string**, `effectiveWave = plan.wave ??
  existingWave` differs, and an overlapping member name would displace an assigned
  handle **not** claimed by a planned resume lane (`claimedHandles`). Remedies in the
  message: distinct `reportDir`, rename the members, or resume the existing handles.
  Verified with a zero-mutation byte proof.
- Cases distinguished: same-wave re-run (reset, `createdAt` preserved, `updatedAt`
  bumped, sha changed); unspecified-wave re-run (inherits the registry's wave identity);
  legacy registry with no `wave` field (guard skipped — the TOCTOU pin keeps its
  precedence); claimed-handle cross-wave resume (transfers instead of refusing);
  disjoint cross-wave names (silently unions members).
- Persist **fails** (zero mutation) on: `wave_registry_collision`; `resume_unknown_member`
  from locked revalidation; `invalid_registry` load failures; the two lock refusals;
  `EXEC_PATH_OUTSIDE_ROOT`.

Observed: first run → 27 handles null; same spec twice → `handlesReset` both displaced
rows; collision refusal with unchanged bytes; disjoint union to 32 rows.

## Not carried by the source

- The merge is **name-keyed, not wave-scoped**: a cross-wave run with disjoint names
  keeps the prior wave's rows forever — no per-row provenance, no pruning here.
- Doc drift: the `persistWaveRegistry` header says "resume lanes carry the handle they
  claim", but the mint at `:1116-1123` sets `agentId: null` on resume rows. Canonize
  the code (null row, provenance only), not the comment tail.

## Unknowns

- `handlesReset` ordering is observed (spec lane order) but pinned by no source comment.
- `record` performs no wave-identity check; the cross-wave guard is persist-only.
