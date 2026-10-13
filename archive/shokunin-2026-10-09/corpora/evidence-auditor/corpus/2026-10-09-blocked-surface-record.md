# 2026-10-09 — how blocked and unverified surfaces are recorded

**Asked.** What shape does a blocked entry take, how does blocked differ from
failed, and what is the no-silent-flattening rule? (lane `BlockedSurfaceRecord`,
scout.)

**Observed.** Two documents, two jobs (both read-only substrate, both open with a
point-in-time banner): `docs/BLOCKED.md` — *“BLOCKED — user actions required for
remaining full-objective clauses”* — one row per still-unproven clause, each
naming the exact user action; carries a standing verdict *“Goal stays OPEN.
Completion is UNPROVEN.”* (`:57`). `docs/KNOWN-GAPS.md` — *“Known gaps and
disputed merges”* — the dispute ledger.

**Five recorded shapes, increasing distance from prose.**

1. **Clause row** (`BLOCKED.md:141-152`): `| Unproven full-objective clause |
   Exact user action | Install / secret / URL | status |`. Status vocabulary:
   `OPEN`, `Shelved`, `OPEN only as private-clone dependency`.
2. **Named section**: `## <name>` + a two-column `| Item | Status |` table + a
   trailing `Evidence:` line naming artifact paths; dated headers.
3. **Machine blocked record**: loop verdict `loop_stop = "blocked"` alongside
   `round_validity ∈ {sound, unsound}` and `mission_goal ∈ {satisfied, incomplete,
   unverified}` (`run-logic.md:1157-1162`); queue row `task.state = "blocked"` with
   `task.blocker = {code, retryable, failureClass?, resumeAt?}` (persisted exactly
   `{code, retryable}`, `fleet-dispatcher.mjs:6724-6726`); receipt
   `iteration.decision ∈ {continue, stop, blocked, budget_halt}`
   (`ufo-mission-result.mjs:63`) with optional `blockedAudit =
   {transportFailures, workFailures}` nonnegative ints + optional `detail` ≤1 KiB.
4. **Durable blocked artifact**: a blocked self-iter writes
   `.ufo/rs-self-iter-blocked.json` instead of the loop report
   (`crates/ufo-cli/src/main.rs:455-458,536-540`).
5. **Goal-audit counters**: `{"prove":8,"partial":0,"blocked":2,"incomplete":0}`
   (`docs/GOAL-AUDIT.md:56`); per-clause kinds `blocked-external`,
   `blocked-upstream`, `unproven`, `cannot close`, `incomplete`.

**Kind-code families** (each with a single owner): loop terminals
`saturated | budget_halt | blocked | interrupted | honesty_brake |
authority_boundary` (`ARCHITECTURE.md:170-172`); receipt decisions (above); the
queue blocker **closed allowlist** `ALLOWED_FAILURE_CODES`
(`fleet-dispatcher.mjs:250-286`, non-matching child strings → `child_error_redacted`),
grouped drift / acceptance / launch-identity / budget / capacity-transport /
halt-class / reporting-parse / redaction; health posture labels
(`healthy_auth_blocked`); document-status words.

**How blocked differs from failed.** **`failed` is not in the terminal set** — the
closed honest vocabulary has no `failed`/`error`; failures collapse into named
`blocker.code`s or a classified failure class. `run-logic.md:940-941`: *“`stop`,
`blocked`, and `budget_halt` end the chain honestly … never progress theater.”*
`BEHAVIOR-MATRIX.md:285`: only *“a sound, clean zero-accept round without pending
refinement saturates”*; unsound/all-unavailable → `blocked`. `blockedAudit`
splits `transportFailures` from `workFailures`, and escalates to `BLOCKED` only on
*“the same work-class blocker signature across three consecutive zero-accept
rounds”* — a transient failure is not a block. A blocked row that reconcile can
still re-pend is *“live evidence, not a dead tip”*. Blocked is **orthogonal to
unverified**: `mission_goal` is computed independently of `loop_stop` — *“Neither
field ever upgrades the other”*.

**The no-flattening rule.** `docs/PROVENANCE.md:192-193` (conflict resolution 5):
disputed claims *“are recorded in KNOWN-GAPS.md and not silently flattened.”*
`KNOWN-GAPS.md:25,87` state the same. `BLOCKED.md:15-16` refuses to over-claim:
*“Route declarations do not prove entitlement, capacity, or a model actually
served to a run.”*; `:59` *“Do not fake host live.”* Runtime sisters:
`run-logic.md:1330` *“never fabricate evidence to unblock a row”*;
`blockedAudit` *“absent means absent, never a fabricated zero”*;
`KNOWN-GAPS.md:219-221` *“None of it is silenced with a blanket `allow`. A
pedantic lint switched off to make a gate green is worse than a warning nobody has
fixed yet, because the warning at least still names the thing.”* Unprovable
freshness is named, not assumed (a future-dated transcript mtime surfaces STALLED
with `idleMinutes: null`, *“never as fresh”*).

**Same convention in the repo under study**: shokunin corpus entries carry an
explicit `Unknowns:` line; audit reports carry a **“not asserted: recorded as
lane-reported and unreproduced”** cell (`reports/tf-audit-docs.md:129`).

**Changed.** Nothing — read-only research.

**Unknown.** Whether the runtime emits any blocked kind beyond the five families
(the vocabularies are source-complete, not runtime-observed); whether
`failureClass` has its own closed enum. Lane report:
`.tower/fleets/shokunin2/reports/evidence-auditor/BlockedSurfaceRecord.md`.