# drill-docs-drift — claims about drills and the fixture loop, checked

Asked: connect the drill/fixture statements across docs, skills, and prior corpora, and flag disagreements.
Anchor: `ufo-fsd-alpha@5ace2559` (read-only); `config/ufo.json` cited from the working copy (sha256 `0e416f0a…`, uncommitted swarm-band edit only). Lane: `DrillDocsDrift` (connector; 31 claims tabled: 12 true, 10 false/stale, 9 drift/gap).

| claim | where | at HEAD |
| --- | --- | --- |
| gates.sh drills stage runs after the mutation battery | `config/ufo.json:12`; Spec 09 `:33` | **false** (stripped `91cc18fe`; runner is charter Phase 0) |
| gates stamps a drill-matrix digest | `scripts/gates.sh:641-643` | **false** |
| full gates exit 0 / drills 51 pass (present tense) | `docs/EVIDENCE-INDEX.md:450-463` | stale; no later-state annotation |
| drills: 51 wired / 11 pending / 5 referenced = 67 | Spec 09 `:10`; substrate-keeper corpus | true |
| "completed 2" status | `shokunin/substrate-keeper/corpus/2026-10-09-conformance-evidence-trees.md:28` | **false** (nested transcript data) |
| drill fixture is a superset of the root fixture | `drills/fixtures/loop_specialist.py` header | **false** (forks) |
| absent budgets key is config-invalid | `config/ufo.json` budgets.note | true for config/ufo.json only; fixture side defaults to unlimited |
| membrane path list "single-sourced here" | `config/ufo.json` membrane.note | false for the fixture loop |
| fixtureRoundBudget is a portable fixture budget | `docs/BEHAVIOR-MATRIX.md:194`, `L2-L3-ROUTING.md:157,398` | true (TS `src/` only) |
| self-iter takes config `lanes[]` | `docs/L2-L3-ROUTING.md:394` | **false** (`default_lanes()`) |
| fixture-only default routes | `docs/REPO-LAYOUT.md:28`, `BEHAVIOR-MATRIX.md:212` | false for the distiller (`hvm/qwen-hvm`) |
| coverage bound "may only shrink" | `ufo-drills.mjs:28-30` | **false** (live 1:1 ratio) |
| drill header I10 = "no network" | `ufo-drills.mjs:4-5` | ID overload: run-logic I10 is "Local-first ship" (`run-logic.md:81-82`) |
| drills stage lives in run-logic §11 | the r1 lane brief | wrong section: it is §8 (`run-logic.md:1190-1215`) |
| AGENTS.md / REPO-LAYOUT.md describe drills | — | absent (gap) |

Rule: the source wins. The config notes and the advisory pack are prose and lag the code.
