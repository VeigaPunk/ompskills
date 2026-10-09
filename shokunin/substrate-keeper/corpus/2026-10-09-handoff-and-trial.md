# handoff-and-trial — the NativeRoundHandoff collector and the trial launcher

Asked: the handoff/trial surface — what each file owns, the envelope, and the timeout cross-check.
Source: lane HandoffAndTrialScripts report. Anchor: ufo-fsd-alpha@5ace2559.

## Observed

- `scripts/collect-omp-native-handoff.mjs` (1804 ln, sha256 `72528959…`): the NativeRoundHandoff
  emitter — reads a manifest + transcripts, screens artifacts, reconstructs evidence, writes the
  envelope the Rust judge adjudicates. CLI `--manifest --output --ufo --run-root --session-root`
  (usage `:118`); **no exports**. Output written `O_EXCL|O_NOFOLLOW` 0o600, bounded by
  `MAX_HANDOFF_BYTES` (16 MiB) `:1775-1782`; evidence tree beside the output
  (`evidence/l1-plan.json`, `evidence/assignments/<seat>.md`, `evidence/transcripts/<seat>.jsonl`,
  `<seat>-raw-transcript.jsonl`) `:371-377,1042-1047`.
- `collect-omp-native-handoff-lib/`: `base.mjs` 955 ln (~55 consts + ~31 funcs; import-free family
  root), `events.mjs` 383 (transcript intake, `readJsonl`, `effectiveTaskAssignment`, `taskCalls`,
  `taskDispatches`), `evidence.mjs` 1163 (attempt ledgers, seats, launch, cost, routing health,
  receipt digests), `policy.mjs` 924 (routes, mirror, deadlines, recovery, plan, axes, rate card;
  `loadCanonicalDirective` `:872-874` + mirror-drift check `:894`), `screening.mjs` 745
  (`DEFAULT_SCREENING_CLASSES`, `screenArtifactTexts`).
- `scripts/run-omp-native-trial.mjs` (4304 ln, sha256 `848502bf…`): the launcher — argv
  `--run-id ID [--interactive|--headless|--no-wall|--prepare-only] [--run-dir] [--session-dir]
  [--ufo] [--wave-size N] [--fleet NAME] [--profile NAME] [--round N] [--predecessor-run ID]`;
  exports `PROFILE=omp-native-v2`, `RESILIENT_PROFILE=omp-native-resilient-v1`,
  `ADMITTED_PROFILES=[v2,resilient]`, `parseArgs`, `planLaunchMode`, `resolveNativeDispatchPolicy`, …
- Envelope keys: `profile, run_id, round, substrate, concurrency, concurrency_semantics, axes,
  axes_hash, contract_hash, contract_root, config_digest, proposal_seats, probe_parent, agents,
  proposals, integrated_candidate, candidate_digest, candidate_receipt, baseline, provenance, telemetry`.
- Timeout cross-check (the assigned claim): `config/ufo.json:140` note says `orchestratorMs` is
  7200000 because the launcher's `OMP_RUN_TIMEOUT_MS` (2h5m, "scripts/run-omp-native-trial.mjs:85-91")
  would otherwise kill a longer-bounded orchestrator lane first. The constant is at **`:120`**:
  `const OMP_RUN_TIMEOUT_MS = 2 * 60 * 60 * 1000 + 300_000;` = 7 500 000 ms = 2h5m — **value matches,
  line anchor is stale** (lines 85-91 are `proposalBlueprints` roster entries). `orchestratorMs`
  7200000 matches `config/ufo.json:141` and sits below the backstop.

## Contract

| file | owns | exports / argv |
| --- | --- | --- |
| `collect-omp-native-handoff.mjs` | the handoff emitter | CLI only |
| `lib/base.mjs` | shared constants + primitives | ~55 consts + ~31 funcs |
| `lib/events.mjs` | transcript intake / normalization / task pairing | `readJsonl`, `effectiveTaskAssignment`, `taskCalls`, `taskDispatches` |
| `lib/evidence.mjs` | evidence reconstruction | `attemptLedgerEntry`, `modelEvidence`, `seatStatus`, `nativeReceiptDigests`, `verifyEffectiveLaunch`, `buildCostLedger`, `routeDomain`, `appendRoutingHealth`, … |
| `lib/policy.mjs` | profile/plan policy | `splitRoute`, `requireRoleRoutes`, `loadSeatRoutingMirror`, `resolveNativeProfile`, `readRoundPlan`, `normalizeAxes`, `loadCanonicalDirective`, `parseRateCard`, … |
| `lib/screening.mjs` | M5 artifact trust screening | `DEFAULT_SCREENING_CLASSES`, `screenArtifactTexts` |
| `run-omp-native-trial.mjs` | the launcher | CLI per `TRIAL_USAGE`; profile exports |
| `ufo-native-names.mjs` | seat/name derivations | 6 exports; `NATIVE_CONTRACT_FILES` member |

Rules: native admission authority is Rust-only (`AGENTS.md:4`, `README.md:10`) — the Node side
emits/admits-shape and never judges; `config/ufo.json` `nativeProfiles.omp-native-v1.judgeCommand` =
`ufo judge-handoff`, `transport` = `omp/task`; the launcher admits exactly `omp-native-v2` (default)
and `omp-native-resilient-v1`, with `omp-native-v1` the frozen base both `extends`.

## Not carried by the source

- No `export` in the collector (CLI-invoked; units exercised through the CLI in
  `tests/collect-omp-native-handoff.test.js`).
- `conformance/fixtures/native-handoff/` is **never read** by the collector or its Node test — it is
  the Rust judge's drivable envelope (`native_support/mod.rs`); the shared shape is enforced on the
  Rust side.
- No assertion of `OMP_RUN_TIMEOUT_MS` or its line number exists in
  `tests/run-omp-native-trial.test.js`.

## Unknowns

- Whether the note's `85-91` anchor was ever correct (no history probe run); the exact per-seat
  evidence filename pattern at fixture-generation time; whether `run-omp-native-trial.mjs` is wired
  into `package.json` or `gates.sh` (grep found no match).