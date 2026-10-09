# ceiling-keeper corpus — index

Append-only. One row per entry, `| entry | topic | added |`. Read this first, then the entries relevant to the assignment.
Start with `live-value-ledger` (what every knob reads now) and `relational-model` (units, and which equal numbers are actually linked).

Domain anchor: `ufo-fsd-alpha@5ace2559`, working-tree `config/ufo.json` sha256 `0e416f0abc559e9a…` (uncommitted; the band is 16–32/100 with minLanes 16, while HEAD says 32–100 with minLanes 64);
`ufo-swarm-wave.mjs` `cd8247af…`; repo `sighting/tower-fleet.mjs` `80f0814e…`; `host/omp-agent.config.yml` `15b40185…`.
Seeded from the mission's round-1 research wave `ceiling-keeper-r1-w1` (27 read-only lanes, reports under `.tower/fleets/shokunin3/reports/ceiling-keeper/`) plus the L1's own `plan` probes.

| entry | topic | added |
| --- | --- | --- |
| 2026-10-09-live-value-ledger.md | the live numeric ledger: every knob, working tree vs HEAD vs bundled mirror | 2026-10-09 |
| 2026-10-09-relational-model.md | unit/scope of every knob; code-linked pairs vs coincident values (16s, 32s, 64s, 100s, 1024s) | 2026-10-09 |
| 2026-10-09-band-ladder-probes.md | observed wave-band boundaries 15/16/32/33/100/101 and the minLanes fallback probe | 2026-10-09 |
| 2026-10-09-swarm-band-gates.md | where the wave band is enforced: gate order, operators, spawn vs resume applicability | 2026-10-09 |
| 2026-10-09-policy-load-defaults.md | loadSwarmPolicy: per-key default, clamp, validation, error text | 2026-10-09 |
| 2026-10-09-minlanes-semantics.md | swarm.minLanes: fallback floor, not dead policy; swarm skill wording falsified | 2026-10-09 |
| 2026-10-09-fleet-launcher-ceilings.md | tower-fleet.mjs numeric authority: L1/PANE gates, order, raw-echo defect, launcher-owned literals | 2026-10-09 |
| 2026-10-09-wall-l1-ceiling.md | wall-side maxConcurrentL1: live-row count, >= before add, L1_CEILING_EXCEEDED callers | 2026-10-09 |
| 2026-10-09-window-pane-and-wall-cap.md | windowPaneCeiling vs default-wall layout cap: CAP_EXCEEDED, >= vs >, fleet-only | 2026-10-09 |
| 2026-10-09-runner-reservations.md | globalRunnerCeiling: reservation arithmetic, defaults, RUNNER_CEILING_EXCEEDED, 1024 per-task clamp | 2026-10-09 |
| 2026-10-09-runner-accounting-display.md | displayed runner totals vs enforced reservations; displayed-but-unenforced fields | 2026-10-09 |
| 2026-10-09-ramp-pacing.md | rampBatchSize/rampIntervalMs: validated and echoed, never paced | 2026-10-09 |
| 2026-10-09-host-task-concurrency.md | task.maxConcurrency: 32 host/global, 0 in UFO projections, 0 = unlimited, layer precedence | 2026-10-09 |
| 2026-10-09-recursion-depth.md | task.maxRecursionDepth 2: copies, the probe.depth projection, omp depth predicate, unchecked agreement | 2026-10-09 |
| 2026-10-09-native-concurrency-ceiling.md | nativeProfiles concurrencyCeiling 32/16/64, NATIVE_CONCURRENCY_MAX, PROPOSAL_WAVE_CEILING, unreachable refusal | 2026-10-09 |
| 2026-10-09-three-thirty-twos.md | audit of host/omp-agent.config.yml's 'three coinciding 32s' comment: true / stale per claim | 2026-10-09 |
| 2026-10-09-config-band-history.md | timeline of the band in config/ufo.json: commits, apply backups, the clobber, working-tree restore | 2026-10-09 |
| 2026-10-09-apply-numeric-gates.md | host/apply.mjs: which numbers it writes, its gates, the ungated minLanes, the mirror it names | 2026-10-09 |
| 2026-10-09-contract-sync-validators.md | sync-ufo-contracts.mjs numeric gates, mirror drift, wrong citations, --check exit 1 | 2026-10-09 |
| 2026-10-09-dispatcher-policy.md | fleet-dispatcher.mjs numeric policy: claim defers, latch, 1024 clamp, stale 16-100 help, exit codes | 2026-10-09 |
| 2026-10-09-sighting-rates-and-deadlines.md | heartbeatIntervalMs, twinMaxDepth, defaultIterateRounds, native deadlines, OMP_RUN_TIMEOUT_MS | 2026-10-09 |
| 2026-10-09-watchdog-and-host-64s.md | stale-watchdog constants, its stale band header, and the unlinked 64s (hostCeiling, self-iter, L3) | 2026-10-09 |
| 2026-10-09-rust-numeric-surface.md | Rust reads no sighting.dispatch number; its own constants; bundled mirror drift passes cargo build | 2026-10-09 |
| 2026-10-09-test-pins.md | which tests pin which numbers: literal tripwires red vs live, hermetic fixtures, unpinned knobs | 2026-10-09 |
| 2026-10-09-prose-numeric-claims.md | numeric claims in skills, prompt, docs vs live: stale 16-100/64/32/1024, per-round vs per-wave | 2026-10-09 |
| 2026-10-09-neighbour-ownership.md | ownership line vs wave-smith, fleet-warden, host-smith, route-auditor; neighbour numeric claims checked | 2026-10-09 |
| 2026-10-09-raise-l1-to-24-impact.md | maxConcurrentL1 16→24 alone: 20-mission plan hits PANE_CEILING_EXCEEDED (observed); wall 15th refusal at 10+14>=24; blast radius (pins, digest, delta revert, prose) | 2026-10-09 |
