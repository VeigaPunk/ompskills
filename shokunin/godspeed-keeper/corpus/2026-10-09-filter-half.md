# filter.md — antimetabole, the symmetric Pareto filter, and the A-08 correction

**Asked:** the judge-only filter half and its internal contradiction.
**Source:** `/home/vgpnk/Projects/ufo-fsd-alpha/ssot/godspeed-core/filter.md` (3240 B, sha256
`ddfabdcb5ca44a8367fc997cd499f35b0f6f4d57ec96cfa8e686e3ad60f2e87d`), vendored copies, `gate.rs`.

## Observed

- **Antimetabole** (L13–15): chiasmus = two clauses where the second reverses the first's grammatical
  order (A-B / B-A); antimetabole = the same *words* repeated in reversed positions (L24–27 table: speed
  and quality swap target/constraint roles). Optimization name: **symmetric Pareto filter** (L29–33).
  Compact names (L60): "Chiastic Pareto constraint" / "antimetabolic dual mandate". Not recursion, not
  Hegelian dialectic, not weighted-sum, not lexicographic, not asymmetric constrained optimization.
- Pseudocode (L35–38, verbatim):
  `is_acceptable_edit(e): return improves_at_least_one_axis(e) and harms_no_axis(e)`.
- **A-08 bridge note** (ssot-only, L62): contradicts L48 (`the directive cannot be satisfied by
  single-axis improvement`), which conflicts with the file's own `is_acceptable_edit`. The operative rule
  is the contract's: a single-axis improvement with no regression **DOES** pass (`gate.rs:39`,
  `verdict()` L155–163, run-logic §4 L275). The file is annotated, not rewritten.
- Vendor lineage: `skills/godspeed-core/filter.md` = `skills/ufo/references/godspeed-core/filter.md` =
  `09957d08a7d4e0375a2f86571c025faaa5a148e8c46e377e6b477ac6bb48da72`; real diff vs ssot = exactly lines
  61–62 (the A-08 note + preceding blank). `crates/ufo-core-runtime/bundled/godspeed-core/filter.md` =
  `ddfabdcb…`. Two self-consistent lineages, documented at README:70-72.
- **Not loadable as instructions:** judge-only. `skills/godspeed/SKILL.md:7,16-18` ("never open them…
  never inject them into a spawn"); `ssot README:49-54,78`. Runtime agrees: the hook prepends only
  `GODSPEED_INVOCATION`; the marker loads nothing. Sole exception: the fleet L1 is the mission-internal
  judge and loads all three before its first verdict (README:40-43, run-logic:926-932).

## Unknown

Whether `fleet-dispatcher.mjs` mints `~/.agents/godspeed-core/` at dispatch time (this lane's sources do not).