# lane-binding-axes-milestone — the per-lane judgment binding and its inheritance

Asked: `laneBindingSuffix`, `validateLaneMeta`, and how `axes`/`milestone` bind and survive.
Source: `scripts/ufo-swarm-wave.mjs:296-303, 714-755, 851, 940-944, 596-621, 1073-1079, 1123-1150`. Lane: `LaneBinding`.

- Bounds: `MAX_LANE_AXES = 8` names, each `≤256` bytes (`MAX_LANE_META_BYTES`), distinct
  and nonempty; `milestone` a nonempty string within the same byte bound.
- Two levels: `spec.axes`/`spec.milestone` are the wave defaults (`label "spec"`);
  `items[N].axes`/`items[N].milestone` are the per-lane binding. Resolution is
  `items[N].x ?? spec.x` — **item wins outright, no merge**. Spec defaults apply to spawn
  lanes only; a resume lane refuses the keys (`resume_meta_forbidden`).
- Emitted text (`:740-755`): first the leaf-bound line — `"Lane bounds: leaf member — no
  subagent dispatch except your single labrat."` for `executor`, `"… no subagent
  dispatch."` for every other role — then `Judged on: <axes>` (when set) and
  `Milestone: <m>` (when set). Absent binding stays absent: no `Judged on` line at all.
- Inheritance: `inheritedJudgment` copies the owner row's `axes`/`milestone` onto a resume
  row; a present-but-invalid binding fails `invalid_registry`. Chained resumes read the
  previous resume row, which itself copied the spawn binding, so nothing decays per wave.
- Persistence: the binding rides the registry member row (spawn `:1146-1150`, resume
  `:1124-1125`), so `collect` can attribute a verdict; `record` never rewrites it.

Observed: an item-level `axes: ["item-axis"]` with a spec default `["spec-axis"]` emitted
`Judged on: item-axis` on that lane and `Judged on: spec-axis` on the next; the registry
member carried the item value. Refusals observed: 9 axes / empty axes / duplicate axis /
257-byte milestone / empty milestone / spec-level 9 axes → `invalid_spec`; resume +
axes → `resume_meta_forbidden`.

## Not carried by the source

- No merge of item and spec bindings, and no validation that an axis name means anything
  outside this wave — it is a label the L1 scores against.
- No default binding is minted when neither level declares one.

## Unknowns

- The mission framing uses the spec-level `axes` as the round's measuring stick; the
  validator carries the binding to the registry and to `collect`, but it never scores
  anything itself.
