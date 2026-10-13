# spec09-doctrine — Spec 09 / A-09 specified vs landed

Asked: the original intent of `docs/advisory/2026-09-17-ufo-improvement-pack/09-invariant-drill-matrix.md` and A-09 (`16-amendments-to-specs-00-09.md:247-290`), and a landed-vs-specified table.
Anchor: `ufo-fsd-alpha@5ace2559` (read-only); `config/ufo.json` cited from the working copy (sha256 `0e416f0a…`, uncommitted swarm-band edit only). Lane: `Spec09Doctrine`. The pack self-labels as host-era historical material (`09…md:2-6`).

## Specified
- "prove the invariants, don't assert them": one named, repeatable drill per invariant (I1–I10) and per new mechanism, on deterministic fixture routes, never live providers.
- Harness: `drills/<id>.drill.json`; fixture transport `local/fixture-primary` / `local/fixture-recovery` + scripted fault lanes (sleep, crash, capacity, garbage, override-pattern); `ufo gates` runs the mutation battery THEN a `drills:` stage; `config/ufo.json` `drills.enabled`; evidence under `.ufo/drills/<id>/` + a per-drill, per-invariant summary.
- A-09: two tiers — Tier 1 drills (incl. `d-swarm-mix`, `d-directive-data`, `d-alias-bypass`) and a Tier 2 T01–T36 NOT_RUN ledger.

## Landed vs not
| specified | state |
| --- | --- |
| `drills/` tree, `ufo-drill-v1` | landed: 67 files (51 wired / 5 referenced / 11 pending) |
| `.ufo/drills/<id>/` evidence + summary | landed (per-drill + suite summary; no per-invariant rollup) |
| `ufo gates` `drills:` stage | **never** — `ufo gates` runs only the ParetoGate mutation smoke (`main.rs:407-416`) |
| `gates.sh drills:` stage | landed, then stripped in `91cc18fe` |
| `drills.enabled` as gate control | dead (validated only) |
| runner | `ufo charter sign` Phase 0 (`main.rs:965-973`), not in the spec |
| override-pattern fault lane | not landed (`theater`/`quiet` exist instead — see `loop-specialist-fixture`) |
| Tier 2 T01–T36 ledger, CHANGELOG "drills: NN/NN green", run-logic §11 clause | absent |

## Drift
- `d-i8-degraded` pendingReason stale (`d-sat-degraded` is wired, `loop_driver_tests.rs:4479`).
- `d-tier-resolve` summary claims a 6–16 wave-size sweep; `expect` asserts only `seats:14`.
