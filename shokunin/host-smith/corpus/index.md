# host-smith corpus — index

Narrow-specialist knowledge base for the OMP host-config surface
(`host/apply.mjs`, `host/omp-agent.config.yml`, `host/ufo-sighting-dispatch.json`).
Read the entries relevant to the assignment before starting; after finishing,
append one row plus one dated entry — never rewrite, reorder, or delete.

| entry | topic | added |
| ----- | ----- | ----- |
| [2026-10-09-host-apply-surface](2026-10-09-host-apply-surface.md) | apply.mjs entry contract: dry-run default, flags, exit codes, gate titles | 2026-10-09 |
| [2026-10-09-candidate-preflight](2026-10-09-candidate-preflight.md) | gate 1 file-level rules; resolver overlap | 2026-10-09 |
| [2026-10-09-resolver-gate](2026-10-09-resolver-gate.md) | gate 2: readGlobalSeatRouting shape, MIRROR_SEATS, bucket/variant print | 2026-10-09 |
| [2026-10-09-dispatch-delta-bounds](2026-10-09-dispatch-delta-bounds.md) | gate 3 numeric/l1Alias bounds; minLanes is unbounded (F2) | 2026-10-09 |
| [2026-10-09-dispatch-merge-edits](2026-10-09-dispatch-merge-edits.md) | surgical config/ufo.json merge; note-rewrite is dead (F1) | 2026-10-09 |
| [2026-10-09-mirror-gate](2026-10-09-mirror-gate.md) | gate 4: splitRoute/mirror + wholeTableAudit over all 164 routes | 2026-10-09 |
| [2026-10-09-compile-gate-rule](2026-10-09-compile-gate-rule.md) | gate 5: build.rs replication, over-rejection, tautological alias check | 2026-10-09 |
| [2026-10-09-wave-band-gate](2026-10-09-wave-band-gate.md) | gate 6 positive leg: buildWaveSpec, plannerEnv, 32-lane CLI probe | 2026-10-09 |
| [2026-10-09-wave-band-edges](2026-10-09-wave-band-edges.md) | gate 6 injected-policy edges, mutation-tested (ceiling/cap survive) | 2026-10-09 |
| [2026-10-09-mirror-drift-report](2026-10-09-mirror-drift-report.md) | gate 7: --check probe, drift/staleAlias regexes, reported never enforced | 2026-10-09 |
| [2026-10-09-plan-print-deferred](2026-10-09-plan-print-deferred.md) | gate 8: printPlan markers, printClosingNotice | 2026-10-09 |
| [2026-10-09-install-config-path](2026-10-09-install-config-path.md) | apply A: backup, atomic write, symlink refusal, read-back equality | 2026-10-09 |
| [2026-10-09-merge-dispatch-path](2026-10-09-merge-dispatch-path.md) | apply B: surgical-merge proof, expected-object equality, re-verify | 2026-10-09 |
| [2026-10-09-credential-screen](2026-10-09-credential-screen.md) | containsSensitiveShape load order, redact wiring, call sites | 2026-10-09 |
| [2026-10-09-dispatch-delta-file](2026-10-09-dispatch-delta-file.md) | the delta file keys, sighting.dispatch mapping, live-band match | 2026-10-09 |
| [2026-10-09-config-parser-dialect](2026-10-09-config-parser-dialect.md) | header rules vs what the resolver actually enforces; credential echo | 2026-10-09 |
| [2026-10-09-config-model-roles](2026-10-09-config-model-roles.md) | candidate modelRoles: selectors, buckets, variants, named lanes | 2026-10-09 |
| [2026-10-09-config-agent-overrides](2026-10-09-config-agent-overrides.md) | task.agentModelOverrides: 14 seats, main=@m_strong, concurrency | 2026-10-09 |
| [2026-10-09-config-fallback-chains](2026-10-09-config-fallback-chains.md) | 31 chains, key forms, bare-distinct + dead-weight rules, doc-defects | 2026-10-09 |
| [2026-10-09-substrate-resolver](2026-10-09-substrate-resolver.md) | omp-global-config.mjs: readBoundedFile, yamlBlock, resolveSeatRouting | 2026-10-09 |
| [2026-10-09-substrate-mirror-script](2026-10-09-substrate-mirror-script.md) | sync-global-routing.mjs: splitRoute rules, mirror shape, --check text | 2026-10-09 |
| [2026-10-09-substrate-compile-gate](2026-10-09-substrate-compile-gate.md) | build.rs: the real compile gate, mutation matrix, stale bundled mirror | 2026-10-09 |
| [2026-10-09-substrate-wave-planner](2026-10-09-substrate-wave-planner.md) | ufo-swarm-wave.mjs: policy resolution, band keys, refusal taxonomy | 2026-10-09 |
| [2026-10-09-live-config-drift](2026-10-09-live-config-drift.md) | live config vs candidate: one behavioral delta (modelRoles.default) | 2026-10-09 |
| [2026-10-09-deferred-artifacts](2026-10-09-deferred-artifacts.md) | the four deferred artifacts and the minimal-footprint directive | 2026-10-09 |
| [2026-10-09-verify-recipe](2026-10-09-verify-recipe.md) | safe dry-run recipe, per-gate signals, exit matrix, no-write proof | 2026-10-09 |
| [2026-10-09-sighting-dispatch-key-map](2026-10-09-sighting-dispatch-key-map.md) | the full sighting.dispatch key map (16 leaves) and one consumer per key | 2026-10-09 |
| [2026-10-09-apply-provenance](2026-10-09-apply-provenance.md) | the substrate config/ufo.json .bak trail and what it proves | 2026-10-09 |
| [2026-10-09-round2-falsification-corrections](2026-10-09-round2-falsification-corrections.md) | round-2 falsification ledger: load-bearing refutes, anchor fixes, caveats — **supersedes the anchors/wording flagged there** | 2026-10-09 |

**Seed method.** Round 1 of mission `host-smith` (fleet `shokunin`): 26 read-only
swarm lanes, one per item, over the three host files, the four imported substrate
scripts, the compile gate, and the live global config; every entry distills one
lane's report. Card: `.omp/agents/host-smith.md`.

**Round 2.** 16 read-only falsification lanes re-derived the 26 round-1 entries
from primary sources and added two coverage entries (the full
`sighting.dispatch` key map, and the substrate `.bak` provenance trail). The
card-contract audit was ALL_CONFIRM. The ledger entry above carries every
corrected anchor, caveat, and overstated claim; the original entries are left
in place because the corpus is append-only.