# registry-schema — the `ufo-swarm-registry-v1` document and every load arm

Asked: the registry document, its member rows, and `loadRegistry`'s validation.
Source: `scripts/ufo-swarm-wave.mjs:518-621, 640-653, 1123-1151`. Lane: `RegistrySchema`.

Doc fields: `schema` (required, the constant), `wave` / `createdAt` / `updatedAt`
(optional strings; `updatedAt` is **validated then dropped** at `:593`), `reportDir`
(never validated, typeof-coerced), `priorRegistries` (shape-checked when present; the
16-entry cap applies only to the *spec* input), `members` (required plain object).

Member rows — spawn `{kind:"spawn", agentId:null, role, item, axes?, milestone?}`
(`:1145-1151`; the mint is a single `null` — a string handle appears only after
`record` writes one, `:1782`); resume `{kind:"resume", agentId:null, member, item,
axes?, milestone?}` (`:1123-1126`). A **bare `{}` row loads** — no row field is
required at load.

`invalid_registry` arms (all fail closed; a corrupt registry never widens the
ownership set):

| arm | line |
| --- | --- |
| bounded read (1 MiB / not regular / changed) | `:521` |
| read fault (required read) | `:525` |
| not JSON | `:531` |
| wrong shape / schema / non-object `members` | `:534` |
| non-string `wave`/`createdAt`/`updatedAt` | `:537` |
| member key fails `TASK_NAME_PATTERN` | `:546` |
| member not an object | `:551` |
| `agentId` fails `RESUME_ID_PATTERN` | `:555` |
| non-string `item`/`role`/`member`/`kind`/`milestone` | `:558` |
| `axes` not a string list | `:562` |
| two members share one `agentId` | `:577` |
| malformed `priorRegistries` | `:589` |

`{required:false}` ENOENT → `null` (the wave's own registry may not exist yet) — not
an error. Adjacent same-code arms that are **not** `loadRegistry`: contradictory
cross-prior claims (`:495`), inherited-binding validation on a resume owner row
(`:609`/`:616`).

`buildRegistryDoc` (`:640-653`) is the single rebuild both writers call: `wave`
always emits, `createdAt` falls back to the write time, `reportDir` emits only when a
string, `priorRegistries` only when present.

Correction to a common premise (round-2): the fleet registries on disk carry **zero**
`kind:"resume"` rows — but "all `agentId: null`" is **false** for the fleet. A walk of
35 registry files (1115 rows) found 0 resume rows, 11 all-null files and 24 files with
recorded handles (`tower1/reports/tf-audit-routing` 51 rows / 48 handles;
`tf-audit-prompt` 34/34; `tower1/reports/tf-wavetest` 48 rows all null). Quote a
specific file, never "the fleet", for a null-handle claim. Real evidence for a
*resume row* comes from plan output and probes, so quote the source line (`:1123`)
plus a probe, never a fleet file.

## Not carried by the source

- A resume row's `agentId` is null **by design** (I6: one handle, one member) — the
  spawn row keeps sole ownership; `member`/`item` carry the provenance chain.
- No per-row wave provenance and no pruning: a cross-wave run with disjoint names
  silently unions members.

## Unknowns

- The lock-owner reader arm and the not-a-regular-file sub-arm are source-anchored.
- The prior-registry variant of `inheritedJudgment` shares the code path but was not
  exercised directly against a prior file.
