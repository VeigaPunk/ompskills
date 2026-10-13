# 2026-10-09 — the honesty rules, and where (if anywhere) code checks them

**Asked.** What honesty rules do the coordination surfaces state, and is any
machine-enforced? (lane `ReceiptHonestyRules`, critic. Overlap note: the sibling
`SkillHonestyClauses` item extracted the clauses as text; this item’s delta is the
**enforcement classification**.)

**Observed — the four rules, verbatim.**

- `sighting/l1-prompt.md:171-174` (Tower duties → **Honest evidence**): *“Report
  route and evidence provenance exactly; never claim an unrun check passed, and
  never fabricate a lane's output. Count what you observed (`13/16 lanes reported,
  3 timed out`) and name refusals by their typed code.”*
- `.omp/skills/tower/SKILL.md:94-96`: *“the parent … owns verification; never
  claim unobserved results or checks as fact.”*
- `.omp/skills/swarm/SKILL.md:59-61` (item 3): *“Integrate and report only
  observed results. … Wave output is advisory: no lane becomes a judge verdict.”*
- `.omp/skills/shokunin/SKILL.md:94-99`: *“Record the observed result; fix the
  card until it behaves, or record exactly why dispatch was unavailable. … the
  round receipt records what was verified and what was not.”*

**Classification — all four are conventions only.**

- A (l1-prompt): no script parses `{{stateDir}}/rounds/*.md` for claims. The
  launcher’s only receipt access is `roundReceipts()`, which lists basenames and
  **never reads bytes** (`sighting/tower-fleet.mjs:951-958`).
- B (tower): nothing cross-checks a parent’s claims against lanes.
- C (swarm item 3): items 1–2 of the same list are validator-gated; item 3 has no
  reader.
- D (shokunin): no code reads `shokunin/<name>/corpus/` (`grep -rn corpus` over
  substrate `scripts/` + `crates/` → nothing).

**The one place a coordination honesty rule is checked by code.**
`/home/vgpnk/Projects/ufo-fsd-alpha/scripts/ufo-swarm-collect.mjs`:

- **Fail-closed lane↔result join — an outcome is never invented** (`:41-44`):
  `unexpected_member` (`:576`), `unmapped_member` (`:582`, “dispatch member …
  has no settled result”), `missing_agent_id` (`:594`), `conflicting_member`
  (`:556`); absent state “derives only from evidence of execution … never
  invented” (`:598-600`).
- **Report landing is measured, not assumed**: `lstat` each
  `<reportDir>/<Name>.md` (`:498-506,615-625`) → `reportSummary {expected,
  present, missing}` (`:741-753`) — the machine form of “count what you observed”.
- Exit 0 / typed `ufo-swarm-collect-error-v1` (exit 1) / usage 64.

In-repo pins of that check: `test/run-wave-test.mjs:1313-1317`;
`test/sighting-wave-smoke.md:516-529` (with the honest limit in bold: presence
only — it never reads or judges report contents); `.omp/agents/wave-smith.md:42`.

**The counterexample that keeps this honest.** The collector checks *artifacts*,
never a claim’s truth: (1) a round receipt claiming “16/16 lanes reported” with
zero lanes on disk passes every gate; (2) `sighting/tower-fleet.mjs:1195`
completes a mission with a fixed `--note "tower-fleet close"`, so rule A’s honest
count cannot ride the note on the `close --apply` path; (3) `reportPresent: true`
for any existing file — content is never read.

**Sharpest classification.** Rule A’s “count what you observed” has a machine
**source** (planner `counts`, collector `reportSummary`) but not a machine
**gate**; A/B/C/D as claims remain convention-only.

**Changed.** Nothing — read-only research.

**Unknown.** No command was run against the collector/validator/launcher; the
`reportSummary`/exit-code behavior is [INFERENCE] from source, corroborated by the
smoke doc. Nearest fail-closed siblings (not checks of A–D):
`scripts/collect-omp-native-handoff.mjs` (`missing_seats :861-864`, replaced
identity `:885-887`, telemetry must be empty `:1252-1253`) and
`scripts/ufo-l0-monitor.mjs` `validateTaskReceipt` (`:703`, schema/keys/digests,
not truth). Lane report:
`.tower/fleets/shokunin2/reports/evidence-auditor/ReceiptHonestyRules.md`.