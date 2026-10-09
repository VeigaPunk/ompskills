# the norm set that keeps a skill consistent with the code it describes

**Asked:** derive the repeated normative moves across the six skill files in both trees and the code
they cite.
**Sources:** `WT` = this mission worktree; `SUB` = `/home/vgpnk/Projects/ufo-fsd-alpha`.

## The norm set

- **N1 — the live configuration wins over the prose; every OMP-tree skill closes with a named-authority
  precedence tail.** `WT/.omp/skills/tower/SKILL.md:122-125` "The live configuration and those sources
  win over this prose; re-read them before dispatch."; `WT/.omp/skills/swarm/SKILL.md:210-211` "rather
  than to any number or verb restated here". Absent from `shokunin` (ends at :115) and
  `SUB/skills/ufo/SKILL.md`.
- **N2 — a restated number names its config key, and the emitting code reads that key live.**
  `swarm/SKILL.md:63-64` -> `config/ufo.json:88-89,93-94`; `tower/SKILL.md:160-161` "never hardcoded";
  `WT/sighting/tower-fleet.mjs:149-156`; `WT/test/tower-fleet.test.mjs:1260-1289` ("prompt carries no
  stock number").
- **N3 — typed refusal codes are quoted verbatim from the raise site and the list declares itself
  non-exhaustive.** `swarm/SKILL.md:76` + 24 codes; `route_unreachable` actually lives in
  `SUB/scripts/ufo-route-preflight.mjs:173`. Counter-case: `wwkd/SKILL.md:182-194` uses untyped prose
  refusals (correct — no validator emits codes).
- **N4 — model routing is always deferred to the operator's global alias table**; no skill or card
  names a provider/model or a per-lane knob (`swarm:148-153`, `tower:39-45`, `shokunin:49-51`).
- **N5 — every claim carries an exact path/key/flag/symbol, and commands are quoted as the tool's own
  usage prints them.**
- **N6 — load-order dependencies are declared and each is labeled gate or never-a-gate**
  (`SUB/skills/ufo/SKILL.md:24-70`).
- **N7 — generated copies are mirrors, never authorities; the canonical site is named and byte drift
  fails closed** (`SUB/skills/ufo/SKILL.md:37-40`; `sync-ufo-contracts.mjs:89-107`).
- **N8 — one normative constant, one canonical statement site.**
- **N9 — closed sets are enumerated exactly as the code enumerates them** (the ten roles ==
  `SWARM_ROLES`, same order; `MIN_SWARM_LANES` 2 / `MAX_SWARM_LANES` 100 match the prose).
- **N10 — state the negative in a form a check can confirm** ("never `dispatch.globalRunnerCeiling`";
  "Never use `omp worktree clear --all`"; "never judges, integrates, widens scope, or spawns" — mirrored
  by the gate's `NEVER_JUDGE` regex `check-hand-authored-sets.mjs:39`, violation `card_never_judge` :176).
- **N11 — frontmatter `description:` carries the invariant that must hold before the body is read**
  (5 of 6 skills).
- **N12 — OMP-tree skills carry the `metadata:` triple; vendored posture skills do not.** No gate
  asserts it (no grep hit for `axis_family` in `SUB/scripts`).
- **N13 — a load mechanism is distinguished from an envelope marker, and bypass surfaces are named.**
- **N14 — name the authoring source but disclaim it as a runtime dependency.**

## Contradictions (stated, not averaged)

- **C1:** key-attribution without a precedence tail does not prevent staleness —
  `SUB/.omp/skills/swarm/SKILL.md:51-53` and `SUB/skills/ufo/SKILL.md:385-386` still print
  "16-100" / `minLanes: 64` against live 16/16/32.
- **C2:** `SUB/skills/ufo/SKILL.md:341` states `l1Alias` = `m_daybreak` while live
  `config/ufo.json:85` = `m_strong` (and the launcher passes the live value).
- **C3:** `sync-ufo-contracts.mjs:933-942`'s `constants:unique` gate pins *sites*, not *values* — it
  still labels the constant `runner-ceiling-1024` with three "1024 …" allow entries while both docs
  now say 1056, so the check passes vacuously.

## Recorded, not executed

The lane's one bounded proposal is to add the N1 precedence tail to
`.omp/skills/shokunin/SKILL.md` and key-attribute its bare band number. That path is outside this
mission's scope (`.omp/agents/skill-scribe.md`, `shokunin/skill-scribe`), so it is recorded here as a
finding for the owning mission, never applied.
