# 2026-10-09 — the wave evidence-artifact chain

**Asked.** Which file is which in a wave’s artifact set, and what does each prove?
(lane `WaveArtifactChain`, scout.)

**Observed.** From `.tower/fleets/shokunin/waves/` (46 files, 15 wave ids) plus
substrate source.

| artifact | identity | proves |
| --- | --- | --- |
| `<wave>.spec.json` | hand-written input; **no `schema` key** (`wave, context, reportDir, axes, milestone, items[]`) | declared intent only |
| `<wave>.plan.json` | `ufo-swarm-wave-v1` (`ufo-swarm-wave.mjs:143`) | the spec passed admission; live `policy`/`counts`, `dispatch.calls:1`, every member `agentId: null`; **no spawn** |
| `<wave>.payload.json` / `.dispatch.json` | `ufo-swarm-wave-dispatch-v1` (`:145`) | `taskCall{context, tasks[]}`, one task per lane with keys `{name, agent, task}`; `run` also **persists the registry** first |
| `<wave>.ids.json` / `.dispatch-result.json` | no schema; `{text, details:{progress[]}}` (index, id, agent, modelRole, status) | dispatch actually happened and N lanes minted with those ids; `status: "pending"` is receipt of dispatch, **not** completion |
| `<wave>.assignments.json` | plain `{Name: agentId}` map | only the input to `record`; the **command**, not the file, fills handles |

**Naming is not validator-emitted**: `grep` of the substrate scripts for
`.plan.json`/`.dispatch.json`/`.ids.json`/`dispatch-result` → no matches. The
filenames are L1-authored shell redirections; the template fixes only the spec
path and `<payload.json>`. No single wave carries all six names
(test-smith-r1 = spec+payload+dispatch-result+assignments; wall-watcher-r1 =
spec+plan+dispatch+ids). Observed mtime order for wall-watcher-r1: spec
02:19:33 → plan 02:19:51 → dispatch 02:19:57 → ids 02:20:59.

**Registry**: `<stateDir>/reports/<mission>/swarm-registry.json` (sibling dir to
`waves/`; resolved under `UFO_PROJECT_ROOT` via `gatedRegistryPath`,
`ufo-swarm-wave.mjs:431-443`), schema `ufo-swarm-registry-v1`. It is the
cross-wave ownership ledger: `run` persists `agentId: null`, `record` fills ids,
and the merge accumulates across rounds (test-smith = 50 members = 26 r1 + 24 r2,
r1 handles retained; `persistWaveRegistry` merge `:1464-1550`; cross-wave
displacement refused `wave_registry_collision`).

Observed: test-smith-r1 payload `counts.spawn 26`, `taskCall.tasks 26`, registry
26 members all `agentId: null`; dispatch-result `details.progress` length 26.

**Changed.** Nothing — read-only research.

**Unknown.** No exit codes are captured anywhere; the empty `.plan.err`/
`.dispatch.err` files are consistent-with but not proof of exit 0 ([INFERENCE]).
`.spec.json` is not self-describing (no schema/version key). Lane report:
`.tower/fleets/shokunin2/reports/evidence-auditor/WaveArtifactChain.md`.