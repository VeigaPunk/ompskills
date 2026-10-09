# hoist-compaction — schema-v2 template hoist and its bypass reasons

Asked: the template hoist / context compaction.
Source: `scripts/ufo-swarm-wave.mjs:219-234, 291-295, 833-840, 1085-1228, 1255-1259`. Lane: `HoistCompaction`.

A template wave with spawn lanes composes the legacy per-lane text for every lane, and —
**only when `hoistEligibleTemplate` holds** — also builds a compact text (head
`## Your item` + item + binding + report + invocation); the decision whether the compact
tasks and the hoisted context ship is **all-or-nothing**. The bypass arms
`disabled`/`template_invocation`/`template_marker` never build the compact text at all.

Applied only when all hold: `hoist` is true (default), the template neither opens with the
invocation nor `trimEnd()`-ends with the marker, the hoisted context
(`base + "# Shared lane template" + an instruction sentence ("Every lane of this wave
expands the template below, substituting its own item for each `{{item}}` occurrence…")
+ a blank block + the template verbatim with the placeholder intact`) stays within 64 KiB,
and the total payload (context once + every task) shrinks by ≥ `MIN_HOIST_SAVINGS = 512`.

| bypass reason | condition |
| --- | --- |
| `disabled` | `spec.hoist: false` |
| `template_invocation` | template opens with the invocation (outranks marker) |
| `template_marker` | template ends with the terminal marker |
| `context_bound` | hoisted context > 64 KiB |
| `no_savings` | `before − after < 512` |
| (inert) | no template OR zero spawns — all-zero block, `reason: null` |

Every bypass keeps the legacy emission **byte-identical** and records the reason in
`plan.compaction`. Compaction itself is never a *new kind* of refusal, but it is not
refusal-free: the compact text is independently bound- and envelope-checked at
composition (`:1183`, cause "after template hoist compaction"), so an item whose text ends
with the envelope marker strands it nonterminal **in the compact text** and refuses
`invalid_spec` on the hoist path where the same spec with `hoist: false` ships (round-2
correction, probe-verified). Resume lanes never compact.

`savedBytes` is the **NET** wave payload delta (shared context counted once), and the
source explicitly warns it is **not** `omp-wave-context`'s `hoistedBytes` (a per-seat
shrink sum). Reconciling the two "misreads both".

Observed: a large template → `applied: true`, `savedBytes 11095`
(`16918 − 5823`), hoisted context 1 283 B with the placeholder intact, all 16 tasks
starting `/skill:godspeed\n\n## Your item`; a tiny template → `no_savings`; `hoist:false`
→ `disabled`; a marker template → `template_marker`; 65 400-byte template →
`context_bound`. `plan --emit-tasks` emits `{context, tasks}` when applied and the
historical bare array otherwise. `run` mirrors `compaction` into the payload; the registry
persists the raw item, not the compact text (hoist rewrites **emission only**).

## Not carried by the source

- Hoist does not change validation identity: the expansion, the bound checks, and the
  distinctness requirement all run exactly as in the legacy path, first, at old
  precedence.
- The compact text is independently bound-checked (`invalid_spec` "after template hoist
  compaction"), not bypassed.

## Unknowns

- `omp-wave-context`'s actual `hoistedBytes` definition (only the validator's
  characterization was read).
- No live fleet wave with an **applied** hoist exists in the artifacts — only the inert
  block (see `real-wave-evidence`).
