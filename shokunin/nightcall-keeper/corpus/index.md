# nightcall-keeper corpus — index

Append-only memory for the `nightcall-keeper` shokunin: the L1 mission-format
config layer of the UFO substrate. Read this index and the relevant entries
before starting; after finishing, write a dated entry and append one row. Never
rewrite, reorder, or delete an entry or a row.

Anchors (substrate `/home/vgpnk/Projects/ufo-fsd-alpha`, HEAD `5ace2559`, dirty
tree, 2026-10-09). The sha256 prefixes pin line numbers; re-hash before trusting one:
`config/mission-nightcall.yml` `64ae2a83…` (566 B) · `config/ufo.json`
`0e416f0a…` · `config/l1-max-context.yml` `244f140d…` ·
`config/ephemeral-fleet.machine.json` `97683b26…` ·
`config/ephemeral-l1.machine.json` `9d0184a4…` · `config/the-tick.machine.json`
`c0f35a29…` · `crates/ufo-core-runtime/bundled/config.json` `1f6b2115…` ·
`bundled/omp-seat-routing.json` `d4364b67…`.
Seeded from mission `nightcall-keeper` round 1 (fleet `shokunin3`, 31 read-only
lanes, reports under `.tower/fleets/shokunin3/reports/nightcall-keeper/`).

| entry | topic | added |
| --- | --- | --- |
| 2026-10-09-overlay-keys.md | mission-nightcall.yml: the 7 keys and their effective change | 2026-10-09 |
| 2026-10-09-overlay-history.md | Overlay lineage, header claims, advisor divergence | 2026-10-09 |
| 2026-10-09-overlay-layering.md | OMP --config layering and the fleet overlay stack | 2026-10-09 |
| 2026-10-09-l1-max-context.md | config/l1-max-context.yml: sibling overlay, gated, not on argv | 2026-10-09 |
| 2026-10-09-mission-format-validator.md | validateMissionFormat: every check and refusal string | 2026-10-09 |
| 2026-10-09-config-path-lifecycle.md | configPath from config to child argv; tower launcher ignores it | 2026-10-09 |
| 2026-10-09-default-iterate-rounds.md | defaultIterateRounds: one reader, a default not a cap | 2026-10-09 |
| 2026-10-09-l1-alias-consumers.md | l1Alias readers: dispatcher, native trial, tower launcher; grammar drift | 2026-10-09 |
| 2026-10-09-parity-rule.md | build.rs main-seat parity: what it compares, live state, --check results | 2026-10-09 |
| 2026-10-09-bundled-mirror-drift.md | Canonical vs bundled config.json diff and how each mirror regenerates | 2026-10-09 |
| 2026-10-09-contracts-and-lints.md | sync-ufo-contracts gates, hand-authored-sets and routing-free lints | 2026-10-09 |
| 2026-10-09-global-config-resolver.md | omp-global-config.mjs: discovery, fd-bound reader, alias resolution | 2026-10-09 |
| 2026-10-09-ephemeral-fleet-policy.md | ephemeral-fleet.machine.json: keys, reader, consumers, gaps | 2026-10-09 |
| 2026-10-09-ephemeral-l1-policy-consumers.md | ephemeral-l1.machine.json: three loaders and the the-tick binding | 2026-10-09 |
| 2026-10-09-the-tick-machine.md | the-tick.machine.json: validator, consumers, membrane listing | 2026-10-09 |
| 2026-10-09-dispatch-history.md | sighting.dispatch change history from git and ufo.json.*.bak | 2026-10-09 |
| 2026-10-09-docs-drift.md | Doc claims vs live bytes: MATCHES / DIVERGES census | 2026-10-09 |
| 2026-10-09-refusal-census.md | Refusal strings across the format layer, with triggers | 2026-10-09 |
| 2026-10-09-test-pins.md | Which dispatcher tests pin the format, and the gaps | 2026-10-09 |
| 2026-10-09-run-logic-normative.md | run-logic.md nightcall rules mapped to enforcing code | 2026-10-09 |
| 2026-10-09-l1alias-change-propagation.md | Canonical l1Alias edit: live readers vs mirror-bound build, timing, tower configPath | 2026-10-09 |
