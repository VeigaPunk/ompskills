# 2026-10-09 — the evidence-kinds taxonomy (do not collapse)

**Asked.** What are the evidence kinds, what does each not prove, and is the
“do not collapse” rule machine-checked? (lane `EvidenceKindsTaxonomy`, reviewer.)

**Observed.** Source of truth
`/home/vgpnk/Projects/ufo-fsd-alpha/docs/BEHAVIOR-MATRIX.md:208-216` (section
`## Evidence kinds (do not collapse)`; header `:208`, table `:210-214`, exit
paragraph `:216`). The binding clause is in the skill run-logic:
`skills/ufo/references/run-logic.md:669-672` — *“Task and Agent Hub records are
transport evidence only. They cannot accept a move. … Fixture reports and native
handoffs are different evidence kinds and never impersonate one another.”*
`skills/ufo/SKILL.md:497-501`: dispatch uses *“one of two explicitly labeled local
evidence paths”*; fixture is “never native host execution”; *“A host `doctor`
probe never upgrades either claim.”* Route admission is fail-closed and kind-bound
(`run-logic.md:1023-1027`): `omp/task` *“is admitted only through `ufo
judge-handoff`”*; an undeclared route fails closed.

| kind | command / path | what it is | what it is not |
| --- | --- | --- | --- |
| Fixture simulation | `ufo self-iter` → `run_dry_until_halt()`; `.ufo/rs-self-iter-report.json`; route `local/fixture-primary`; `spawn_kind=child_process` | deterministic local test / dry loop | native host-agent execution or production ship |
| Native evidence | `scripts/run-omp-native-trial.mjs` → collector → `ufo judge-handoff` | hashed OMP transcripts + Rust verdict | source apply / working-tree ship; Sekhmet is forbidden on this path |
| Transactional local ship | `ufo local-ship --request <PATH>` → `ufo_core_runtime::apply_local_ship` | same-directory apply + explicit absolute verifier argv; retain on exit 0 else exact preimage restore | git, publish, network, shell string, stdin replacement, PATH search |

**Local-ship receipt fields** (`:214`, verified against
`crates/ufo-core-runtime/src/local_ship.rs:56-66`): `before_sha256`,
`candidate_sha256`, `final_sha256`, `verifier_argv_sha256`,
`verifier_exit_code` (**`Option<i32>` — nullable**, `None` on timeout or a
signal-killed child), `timed_out`, `state ∈ {committed, rolled_back}`
(snake_case serialized; Rust variants `Committed`/`RolledBack`). CLI exits
0 committed / 1 rolled_back / 2 refusal / 3 restore failure. Hard bounds:
`HARD_MAX_REPLACEMENT_BYTES = 8 MiB`, `HARD_MAX_OUTPUT_BYTES = 1 MiB`,
`HARD_MAX_TIMEOUT_SECS = 30`.

**What each kind does not prove.** Fixture: native host-agent execution; production
ship; live LLM rounds/model routing (*“This is fixture evidence, never live LLM
rounds”*, `docs/LOCAL-VERIFICATION.md:238`); runtime behaviour beyond shape parity
(*“Contract sync proves shape parity. It does not prove an authenticated host CLI
ran.”*); and a budget halt is never saturation. Native: repository improvement
(*“Native transport evidence alone is not proof of repository improvement.”*,
`BEHAVIOR-MATRIX.md:166`); source apply; and route evidence is layered — the
launch manifest is *requested*-route evidence while the transcript’s
`model_change`/`session_init`/effort events are *resolved*-route evidence
(`run-logic.md:681-685`). Local ship: anything outside the same-directory
transaction; it binds digests and argv identity, **not verdict truth** — exit 0
only means the declared absolute binary exited 0 within the bounds. Its
confinement gate’s own docstring lists “Platform limits (not claimed as
confinement)”: hardlinked/renamed denied binaries pass, an unresolvable verifier
path defers to spawn, only the two-byte `#!` prefix is sniffed, the denylist is
enumerable not exhaustive, and there is a TOCTOU between check-time resolution and
spawn-time inode.

**Machine-checked?** No. No test pins the table; the “machine-checked splits”
claim at `docs/PORT-NOTES.md:68` points at `crates/ufo-core/src/splits.rs`, which
does **not exist** here (under that document’s own historical-snapshot banner).
The taxonomy is enforced only by prose plus the fail-closed route-admission rule.
Do **not** describe it as machine-checked.

**Sibling “do not collapse” rules** (distinct splits; never merge them): two
evidence trees (`docs/LOCAL-INSTALL.md:249`); the doctrine-IX name splits
(`PORT-NOTES.md:68`, `charter-digest.md:48`); the three-layer L3 split
(`docs/adr/008-l3-concurrency-three-layer.md:40`).

**Working-tree annotations.** Every named symbol/constant/path from the `*WT
2026-09-13 …*` table annotations was verified present in the current tree, but the
“uncommitted” status was not verified (the shallow clone gives one commit of file
history). Treat a `WT …` annotation as a working-tree-era claim whose code targets
exist, never as a landed/committed status.

**Changed.** Nothing — read-only research.

**Unknown.** No `ufo self-iter` / `local-ship` / native-trial / `judge-handoff`
was run; the runtime behaviour of the bounds was not exercised. Lane report:
`.tower/fleets/shokunin2/reports/evidence-auditor/EvidenceKindsTaxonomy.md`.