# adapters-keeper corpus — index

Append-only. One row per entry `| entry | topic | added |`. Read this first, then the entries
relevant to the assignment.

Domain anchor: `/home/vgpnk/Projects/ufo-fsd-alpha` (`ufo-fsd-alpha@5ace2559`,
`config/ufo.json` sha256 `0e416f0abc559e9a…` — working tree ` M` vs HEAD, swarm block only).
Seeded from the mission's round-1 research wave (24 lanes, `reports/adapters-keeper/`,
wave `adapters-keeper-r1-w1`).

| entry | topic | added |
| --- | --- | --- |
| 2026-10-09-matrix-overview.md | the 11-package taxonomy: 7 adapter trees + 4 workspaces; package≠seat | 2026-10-09 |
| 2026-10-09-adapter-invariant.md | shared contract: skills/ufo+wwkd+directive mirrors; agents/scope/native-dir deltas | 2026-10-09 |
| 2026-10-09-selection-keys.md | automaticSubstrate/runnerUpSubstrate are validators, not selectors; no fallback path | 2026-10-09 |
| 2026-10-09-substrates-targets-lanes.md | substrates[]/targets{}/lanes[] cross-checks; TARGET_PACKAGE omp→substrate-omp | 2026-10-09 |
| 2026-10-09-native-profiles.md | 4 profiles; only omp-native-* judge-admitted; devin-native-v1 excluded | 2026-10-09 |
| 2026-10-09-sync-contract.md | sync-ufo-contracts.mjs write set, check mode, regenerate/verify commands | 2026-10-09 |
| 2026-10-09-skill-scope.md | ufo-skill-scope.json shape, 5 charterlist slots, no in-tree reader | 2026-10-09 |
| 2026-10-09-workspaces.md | the 4 npm workspaces vs content-only dirs; substrate-omp private non-member | 2026-10-09 |
| 2026-10-09-verification-surface.md | contracts:check is the only byte gate; package npm tests un-gated | 2026-10-09 |
| 2026-10-09-entrypoints.md | host-visible entrypoints are substrates/<seat>/bin/cli.mjs, not packages/ | 2026-10-09 |
| 2026-10-09-shape-deltas.md | why adapters differ: contract vs host-convention vs unexplained | 2026-10-09 |
| 2026-10-09-seats-vs-packages.md | substrates/<seat>/ executable shims vs packages/<seat>/ content | 2026-10-09 |
| 2026-10-09-pkg-codex.md | packages/codex: 10 generated mirror files, scope tag, no agents/ | 2026-10-09 |
| 2026-10-09-pkg-cursor.md | packages/cursor: mirrors + .cursor/ native target + parity agents/ | 2026-10-09 |
| 2026-10-09-pkg-devin.md | packages/devin: mirrors + gitignored .devin/; runnerUp documented never selected | 2026-10-09 |
| 2026-10-09-pkg-grok.md | packages/grok: 10 generated files; ~/.grok/skills/ufo install per docs | 2026-10-09 |
| 2026-10-09-pkg-kimi.md | packages/kimi: 23 generated files incl. agents/ + scope tag | 2026-10-09 |
| 2026-10-09-pkg-opencode.md | packages/opencode: 10 generated files; ephemeral launcher reads canonical, not package | 2026-10-09 |
| 2026-10-09-pkg-substrate-omp.md | packages/substrate-omp: @ufo/substrate-omp-content, authored package.json, mirrors | 2026-10-09 |
| 2026-10-09-pkg-substrate-lib.md | packages/substrate-lib: 2 schema data files; capabilities + titanium map consumers | 2026-10-09 |
| 2026-10-09-pkg-substrate-runtime.md | packages/substrate-runtime: shared lane-cli contract behind all 7 seat shims | 2026-10-09 |
| 2026-10-09-pkg-contract-support.md | packages/contract-support: sidecar validator+batteries, zero live importers | 2026-10-09 |
| 2026-10-09-pkg-ufo-core.md | packages/ufo-core: TS Pareto library, only importer is contract-support batteries | 2026-10-09 |
| 2026-10-09-codex-scope-tag-writer.md | packages/codex scope tag is generated: expectedScopeTag+write loop; unexpectedScopeTags refuses strays | 2026-10-09 |
