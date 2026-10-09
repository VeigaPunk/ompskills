# The wwkd skill — planner stance, and where the four rules come from

**Asked:** the WWKD planning posture and the "name the axes" attribution.
**Source:** `/home/vgpnk/Projects/ufo-fsd-alpha/.omp/skills/wwkd/SKILL.md` (232 lines, 9978 B; byte-identical
twins at `.cursor/skills/wwkd/SKILL.md` and `crates/ufo-core-runtime/bundled/skills/wwkd/SKILL.md`).

## Observed

- Framing (:19): "Planning is a disciplined response to silent failure. The cheapest bugs to fix are the
  ones you catch before the next layer lands on top."
- 10 core principles (:30-75): become one with the data; build a trusted skeleton; overfit one case;
  regularize in least-disruption order; tune only after correctness; code ephemeral / knowledge permanent;
  follow established patterns; fit in one file/one screen; structural verification at every step; the
  anti-pattern is "fast and furious".
- Phases 0–4 (:85,98,114,123,134) — the four the L1 prompt names are 0–3; **Phase 4 Polish** is the omitted
  fifth. Phase 0 = Data Walk (inputs/APIs/existing code/constraints; produce the artifact before the plan);
  Phase 1 = skeleton sequencing (end-to-end day one, one capability per milestone, least disruption,
  verification gate baked in); Phase 2 = overfit one minimal real instance, bit-for-bit; Phase 3 = widen one
  axis at a time, each widening gated.
- Refusals (:182-193): skip Phase 0; write-everything-then-test; invent novel architecture where a pattern
  exists; plans without verification gates; a first milestone that scaffolds a framework.
- "When To Use" (:198-210): approved spec needs a plan; `/wwkd` / "what would karpathy do"; non-trivial
  feature sequencing; silent-failure refactors. Not for one-line changes, in-flux specs, or throwaway glue.
- Source Excerpts (:222-232): two Karpathy quotes, then the third, attributed verbatim (:231) to
  **"VeigaPunk directive, the Pareto-walk compression of the same posture"** — line-for-line the godspeed
  directive's four rules (`ssot/godspeed-core/directive.md:3-6`).
- Framework binding: run-logic:10 "Posture: godspeed. Planner stance: wwkd."; §5 at run-logic:946
  (`fn wwkd_plan`); the ssot README labels the four rules and traces lineage to Karpathy ("overfit one
  batch first").

## Unknown

None within scope.