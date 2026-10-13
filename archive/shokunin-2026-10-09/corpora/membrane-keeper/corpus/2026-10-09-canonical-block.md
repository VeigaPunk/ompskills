# canonical-block — the config/ufo.json membrane block

Asked: enumerate the canonical membrane block verbatim; parse the note's claims;
hash the file; check the .bak siblings.

Observed (wave r1-w1 lane CanonicalBlock, read-only):

- `config/ufo.json` sha256 `0e416f0abc559e9a91bc0c35ea8abd913ba11e1a926db9f72dade2f73d5fa8b3`; membrane block at `:23-49`, unchanged vs HEAD.
- Fields: `note`, `paths` (11 entries), `action: "authority_boundary"`,
  `screening.version: "2026-09-17"`, `screening.classes`:
  `directive_bytes, terminal_marker, judge_imperative, assignment_header, directive_task_data`.
- Paths (verbatim order): `crates/ufo-core-runtime/**`, `crates/ufo-cli/**`,
  `scripts/collect-omp-native-handoff*`, `scripts/sync-ufo-contracts.mjs`,
  `scripts/run-omp-native-trial.mjs`, `scripts/ufo-sighting*`, `config/ufo.json`,
  `config/the-tick.machine.json`, `skills/ufo/SKILL.md`, `skills/ufo/references/**`,
  `ssot/godspeed-core/directive.md`.
- Note claims, with verdicts against code:
  - "Spec 06 (P5)" — the doc is
    `docs/advisory/2026-09-17-ufo-improvement-pack/06-membrane-signoff-and-artifact-trust.md`.
  - "touched_paths intersect membrane.paths emits authority_boundary" — code
    screens `touched_paths ∪ candidate_writes[].path` (native.rs:316-345,
    loop_driver_judge.rs:415-448). Note under-states the screened set.
  - Unseal = `ufo charter sign <runId>` TTY-only + full Phase 0 re-pass — lands
    as is_terminal gate (main.rs:990) + stages `contracts, build, drills`
    (main.rs:850).
  - "fixture loop reads membrane{paths,action} from config/orchestration.json" —
    the file does not exist on the substrate (see fixture-orchestration-surface).
  - "screening classes are evidence flags on artifacts — never auto-rejection" —
    holds: flags reach the verdict as provenance only (see flags-propagation).
- 9 `.bak` siblings; every one's membrane block is JSON-identical to live. The
  oldest `.bak` is byte-identical to `bundled/config.json` (sha256 `1f6b2115…`).

Divergences: note says `touched_paths` only (code unions candidate_writes);
spec 06's proposed paths[3] was the `.mjs` literal, landed is the `*` glob;
spec's "full Phase 0" listed boot/probe/mutation battery — code has 3 stages.

Confidence: high (direct reads + hashing). Unknowns: whether any consumer
validates `screening.version` semantically beyond shape (grep says no reader).
