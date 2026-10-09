# 2026-10-09 — the honesty clauses carried by the repo's skills

**Asked.** What honesty/provenance clauses do `tower`, `swarm`, and `shokunin`
carry, and how do they compose? (lane `SkillHonestyClauses`, connector.)

**Observed.** Read in full: `.omp/skills/tower/SKILL.md` (174 lines),
`.omp/skills/swarm/SKILL.md` (211), `.omp/skills/shokunin/SKILL.md` (115), plus
``sighting/l1-prompt.md` (181) as the composition artifact. Clause counts:
tower 22, swarm 23, shokunin 12.

**Keystone clauses.** tower `:95-96` “never claim unobserved results or checks as
fact”; swarm `:59-61` “Integrate and report only observed results … honest
evidence”; shokunin `:92` “Never invent a contract the source does not carry”;
shokunin `:98-99` “the round receipt records what was verified and what was not”;
swarm `:75-77` “a duplicate expansion is a refusal, never a silent dedupe.
Refusals are typed, and **this list is not their full set**”.

**The composed rule** is stated verbatim at `sighting/l1-prompt.md:171-173`
(**Honest evidence**): report route and evidence provenance exactly; **never claim
an unrun check passed**; never fabricate a lane’s output; **count what you
observed** (`13/16 lanes reported, 3 timed out`); **name refusals by their typed
code**. The three skills compose it as a pipeline:

- **swarm produces** evidence (spec → plan → run → record; typed refusals gate
  before dispatch; ids recorded only after the task call returns them);
- **tower verifies** it (collect the actual handoff, inspect changes in the
  worktree, never claim unobserved results; **live sources win over prose** at
  `tower:122-125`, `swarm:207-211`);
- **shokunin persists** it (append-only entries of paths/symbols/commands/refusal
  codes plus remaining unknowns).

“Count what you observed” anchors to swarm `:34-38` (padding forbidden),
swarm `:101-106` (registry ownership), tower `:168` (`status` reads round
receipts), shokunin `:73-74,98-99` (row-per-entry; verified/unverified split),
`l1-prompt.md:120-122` (count reports against `counts.total`; exhaustion or a
missing report is telemetry, never saturation).

**Tensions observed.**

1. **Resolvable conflict** — shokunin `:88` prescribes creation research as
   “waves of 16–32 read-only lanes”; swarm `:34-38` forbids exactly that literalism
   (“padding to the floor is forbidden”) and `:68-73` demotes the 16-floor to
   “policy, not a planner gate”. Resolution on the evidence: swarm `:63` “the
   validator is normative” and `l1-prompt.md:67-75` (N < waveMin is executed
   directly) — shokunin’s “16–32” **describes the configured band**, not a quota.
2. **Wording tension** — shokunin `:78-79` “never creates a corpus outside the
   repository” vs `:113-115` copying a corpus to `~/.omp/agent/shokunin/<name>/`.
   Coherent only under a creation-vs-use reading; the scopes are implied, never
   stated.
3. **Not a conflict** — tower `:49` “Every freshly spawned worker runs under
   Godspeed” plus its immediate qualifications (project-scoped, `task`-only,
   resumes never re-carry it) and swarm `:129-138` agree exactly: the pattern is
   **assertion + honest limit**, and the flat assertion alone would overstate
   coverage.
4. **Not a conflict** — two refusal-code namespaces: lowercase wave-validator
   codes vs UPPER fleet-launcher codes; `l1-prompt.md:85-86` shows a lowercase
   code absent from swarm’s list, directly corroborating swarm’s incompleteness
   disclaimer.

**Changed.** Nothing — read-only research.

**Unknown.** Static text extraction only — nothing run; the clauses were not
cross-checked against `scripts/ufo-swarm-wave.mjs`, `sighting/tower-fleet.mjs`,
`config/ufo.json`, `omp worktree --help`, or `.omp/hooks/pre/ufo-godspeed-inject.js`
(the skills’ own precedence clauses rank those live sources above their prose). Lane
report: `.tower/fleets/shokunin2/reports/evidence-auditor/SkillHonestyClauses.md`.