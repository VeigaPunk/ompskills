# run-logic.md — the contract that bounds the posture

**Asked:** the operative sections the posture answers to.
**Source:** `/home/vgpnk/Projects/ufo-fsd-alpha/skills/ufo/references/run-logic.md` (2549 lines).

## Observed

- **Pareto gate is §4** (Round loop, :251) — no section is titled "Pareto gate". `filter.md:62` cites
  "run-logic §4". Loop anchors: `canonical_rust_pareto_judge(state.baseline, distilled)` (:275),
  `advance_frontier_only(verdict.accepted)` (:277). Admission restatements: "rule =
  improves_one_axis_and_regresses_none" (:208); "Priority changes ordering, never Pareto admission"
  (:1086); "No weighted sum, confidence score, or target metric may admit a regression." (:1094-1095).
- **§4.3 Swarm wave dispatch** (:713) — the injection clause: "Every fresh subagent session MUST receive
  `GODSPEED_INVOCATION` as the leading line of its task text." (:727-728); the renderer injects into every
  spawned lane and the pre `tool_call` hook into every `task` dispatch, idempotently (:728-732);
  eval-kernel `agent()`/`workpool()` callers must prepend it themselves (:732-733); "A trailing
  `GODSPEED_MARKER` is envelope-only and loads nothing." (:734); resume `hub send` messages are
  continuity, never prefixed (:735). Note: run-logic never spells the word "godspeed-blind" — the label
  lives in referrers all citing §4.3 (`skills/godspeed/SKILL.md:22`, `AGENTS.md`, the hook header,
  `ufo-swarm-wave.mjs:1161-1167`).
- **§5 WWKD plan** (:946) — the planner stance is normative: "Posture: godspeed. Planner stance: wwkd."
  (:10); the L1 declares the round axis set in its WWKD plan per round (:253-254); six fixed steps (data
  walk, skeleton first, overfit one case, cheapest local check, verification gate, least disruption)
  (:949-957); "The plan is written by the one L1" (:958-961); axis measurement declarations — an
  unmeasured axis fails plan admission (:963-980).
- **§8 Stop conditions** (:1099) — a **clean zero-accept round** ⇒ SATURATED ("saturation precedes every
  budget stop"; `round_is_clean` = zero capacity/lane_timeout/quality_degraded/unavailable, :1123-1127); a
  dirty round ⇒ `saturation_inconclusive`; `configured_round_budget_exhausted` ⇒ **BUDGET_HALT**
  ("the cap survives saturation demotion", :1128-1130, :1139-1140); "SATURATED describes the search, not
  the task." (:1156-1157); "reaching the declared round count is a budget halt unless the final round
  itself saturates" (:1220-1222); "BUDGET_HALT and BLOCKED are not convergence." (:1180).
- A-08 bridge provenance: `filter.md:62` cites `gate.rs` + run-logic §4; `velocity.md:42` cites §8.

## Unknown

None within scope. Caveat: numeric anchors into `ufo-swarm-wave.mjs` in run-logic are stale (~22-23 lines);
cite script anchors, not run-logic's.