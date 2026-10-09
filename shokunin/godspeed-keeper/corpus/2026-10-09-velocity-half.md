# velocity.md — the five properties, build sequence, and its stale vendor lineage

**Asked:** the judge-only velocity half and its A-08 correction.
**Source:** `/home/vgpnk/Projects/ufo-fsd-alpha/ssot/godspeed-core/velocity.md` (2663 B, 42 lines,
sha256 `dbd37a12a3cb6910b071d52e2b2002dc5e471bf98e089428034512efbb980d96`).

## Observed

- Five godspeed properties: **Catalog bootstrap**, **Cheap stubs**, **Parallel-able**,
  **Auto-recording**, **Auto-frontier dominance check**.
- Build sequence (8 steps): cheapest stub of the expensive component → variant catalog (pre-built) →
  parallel runner → auto-recording wrapper → test one iteration manually → full catalog in parallel
  (Phase 1) → hand off to generative search (Phase 2) → stop when frontier saturates or external
  boundary. Trust: "Trust the process and the iterations" — 12 cheap variants beat deliberating over 1.
- **A-08 bridge note** (L42, ssot-only): the original "Stop conditions… never pre-specified" is
  contradicted by the contract — the configured round budget is a **pre-specified hard halt**
  (`budget_halt`), and saturation is declarable only for a **clean zero-accept round** (run-logic §8).
- **Meaning-changing drift (HIGH):** `skills/godspeed-core/velocity.md` (2243 B, 40 lines,
  `349243f6bcac35261e5ca40a72afa65eb3f1918ff951aaf4fa9f1ad8f8c5df27`) is byte-identical through L40
  but **lacks** the note, so it still asserts the falsified absolute. 14 of 17 located copies carry the
  stale bytes (skills, `.cursor`, `.omp`, 9 `packages/*`); only ssot and
  `crates/ufo-core-runtime/bundled/godspeed-core/velocity.md` match `dbd37a12`. Root cause seen in
  `sync-ufo-contracts.mjs`: `bundledAssetMirrors` (L123-125) targets only the crate bundle, and the
  byte-pinned mirror lists cover `directive.md` only; `skills/SHA256SUMS` is regenerated from the live
  tree, so it stamps the stale bytes self-consistently. Committed HEAD state, not local dirt.
- Host install `~/.agents/skills/godspeed/SKILL.md` (`1d616723…`) carries no stop-condition sentence at
  all — neither propagates nor corrects the divergence.

## Unknown

Whether A-08 intentionally scoped the skills copies out (git history is a squashed root; no propagation
record found). Decision for L1 on quoting corrected-vs-bare L40 when seeding corpus: flagged, not decided.