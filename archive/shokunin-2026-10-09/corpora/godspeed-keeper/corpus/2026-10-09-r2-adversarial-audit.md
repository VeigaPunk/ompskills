# Round-2 adversarial audit — corrections applied

**Asked:** falsify the card and corpus against the substrate after the round-1
commit. 18 read-only audit lanes ran in `godspeed-keeper-r2-w1` under the live
16–32 band; 18/18 reports settled.

## Observed

Most claims passed: directive identity/hash, resolved host skill, hook bytes and
scope, composition and resume probes, marker refusal probes, consumer carve-out,
Pareto gate, run-logic, WWKD source set, sync counts, L1 prohibition, paraphrase
D1–D5, and lineage hashes.

Five source-backed corrections were accepted:

1. `corpus/2026-10-09-directive-drift.md`: the scoped census is **30/31** under
the substrate plus `~/.agents`; the wider whole-home sweep is 33/34 because it
also finds unrelated `/home/vgpnk/Projects/godspeed-core` and `myskills` copies.
2. `corpus/2026-10-09-contract-sync-mirrors.md`: root `godspeed-core/**`,
`skills/godspeed-core/**`, and `skills/godspeed/**` are not wholly unmanaged;
`directive.md` files are explicitly declared mirrors while sibling files may not
be. The entry now distinguishes declared files from unmanaged siblings.
3. `corpus/2026-10-09-runtime-directive-load.md`: no compile-time/Rust digest
literal exists, but the bundled `godspeed-core/SHA256SUMS:1` contains the hash as
manifest data. The prior "full-hash grep empty" wording was too broad.
4. Card + `corpus/2026-10-09-l1-pane-invocation.md`: the exact prohibition anchor
is `sighting/l1-prompt.md:89-91`, not `:88-91`.
5. Card + `corpus/2026-10-09-wwkd-planner-stance.md`: WWKD reproduces the four
rules in order as a comma-joined clause, not byte-identically; framing begins at
`:18-19`, not only `:19`.
6. Card + `corpus/2026-10-09-axes-admission.md`: UNKNOWN's 0.0 clamp may yield
`RejectNoImprovement`, but caller precedence can instead yield
`RejectInsufficientEvidence` or `RejectRegression`; blocking includes evidence
axes and non-finite deltas, not only material UNKNOWN.
7. Card: spawn `reportInstruction` is conditional on `reportDir !== null`; the
consumer sentence now distinguishes the trial/collector exact-one rule, the
wave's zero-or-one-terminal rule, and the dispatcher's prose carve-out. The
band claim now says the prompt has band rows but no ceiling row.

One simplifier audit found no dead-weight deletion candidate worth accepting;
historical append-only entries remain preserved.

## Changed

The L1 re-applied all corrections inside the mission scope. No substrate,
repo-tracked skill, or state artifact was edited. The corrections improve
`posture-fidelity` and `divergence-honesty`; no axis regressed.

## Unknown

No remaining actionable FAIL from the 18-lane audit. The carve-out's historical
incident rationale and any out-of-tree producer of a two-marker assignment remain
unknown by design. The round's evidence is report-backed, not a replacement for
future source re-verification after substrate changes.