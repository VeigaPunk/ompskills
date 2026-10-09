# r2-corrections — the round-2 falsification ledger

Asked: round 2 falsified the round-1 deliverable — 29 entry verifiers (one per corpus entry) plus
`CardContractCheck`, `CorpusIntegrityCheck`, and `NoInventionSweep` (32 lanes, one wave). This entry
records every corrected claim with the verifier that decided it. Source: the 32 reports under
`/home/vgpnk/Projects/ompskills/.tower/fleets/shokunin2/reports/substrate-keeper-r2/`.
Anchor: ufo-fsd-alpha@5ace2559, `config/ufo.json` sha256 `0e416f0abc559e9a…`.

## Verdict mix

| verdict | lanes |
| --- | --- |
| PASS (no correction) | 12 — `VerifySwarmWaveSurface`, `VerifyOmpHostScripts`, `VerifySsotGodspeedCore`, `VerifySkillsTreeMirrors` (amended to PARTIAL), `VerifyDocsSelfDeclaredGaps`, `VerifyWatchdogSurface`, `VerifyTopLevelLayout`, `VerifyConfigUfoJson`, `VerifyAgentsTaxonomyConvention`, `CorpusIntegrityCheck`, `VerifyScriptsInventory` (PARTIAL), `VerifyGatesBattery` (PARTIAL) |
| PARTIAL / FAIL (corrections applied) | 20 |

`CorpusIntegrityCheck` verdict PASS: index ↔ entries bijection 30↔30, naming, section shape,
append-only history (single seed commit `e5432e4`, post-seed delta pure addition), anchor
consistency, card path. `NoInventionSweep` verdict PARTIAL: five load-bearing values re-derived
clean (band 16/32, 100/16 lane limits, 1056/16/16 ceilings, 379-line config + `0e416f0a` hash,
15/68/535 tracked counts); four findings, all applied below.

## Corrections applied (claim | correction | verifier)

| claim | correction | verifier |
| --- | --- | --- |
| card: corpus-protocol parenthetical said "exit codes" | "refusal codes" (SKILL.md wording, 8/8 first-tranche cards) | `CardContractCheck` |
| card: `.devin` listed as a plain generated projection | qualified — declared target, uncreated and gitignored (`.gitignore:33`) at this checkout | `CardContractCheck` |
| card: `probe-ufo-route-health` | `probe-ufo-route-health.mjs` | `CardContractCheck` |
| card: skills clones "12/11/14" | 12/12/13 byte-identical copies (11/11/12 mirrors + canonical) | `CardContractCheck`, `VerifySkillsTreeMirrors` |
| `skills-tree-mirrors`: `.devin` targets "untracked-but-not-gitignored"; run-logic ×11, wwkd ×14 | untracked **and gitignored** (`.gitignore:33`); 12/12/13 copies incl. canonical (14 declared wwkd incl. 2 missing devin targets) | `VerifySkillsTreeMirrors`, `CardContractCheck` |
| `fleet-scripts`: `maybeEnqueueIterationSuccessor`/`auto-reap` "absent" | present internally (`:5513`; reaping logic `:6756-7128`, `autoReapFailLatch`/`autoReaped` `:7009,:9057-9058,:9113-9125,:9362`), **not exported** | `VerifyFleetScripts` |
| `config-rotation-residue`: "each stamp equals its own mtime to the millisecond" | false for #2/#4/#7 (differ by 1 ms; exact values recorded) | `VerifyConfigRotationResidue` |
| `config-rotation-residue`: rotation habit stated as contract | marked **INFERENCE** (direction not carried by any source) | `NoInventionSweep` |
| `contract-check-battery`: broad generated-map shorthand | narrowed to the source-declared `skillTargets`/`agentTargets`/directive/bundled/scope-tag paths; `ufo-deps.lock` = generated `contractRevision` field only | `VerifyContractCheckBattery` |
| `state-governor-surface`: retention mutates "only under `--apply`" | `cap`/`sweep` need `--apply`; **`watch` has no `--apply`**, takes a per-session lock, and runs `capSession` with `apply: true` | `VerifyStateGovernorSurface` |
| `state-governor-surface`: mission trio "no filesystem surface" | no `.ufo` state access; their CLIs read bounded caller files/stdin via fs helpers | `VerifyStateGovernorSurface` |
| `state-governor-surface`: `drills/summary.json` authority | `config/ufo.json:10-12` establishes `.ufo/drills/<id>/` only | `VerifyStateGovernorSurface` |
| `conformance-evidence-trees`: vector shape stated as universal | `dual-orch/r1-r4.json` is an explicit exception (top-level `membrane`/`exit`/`policy`) | `VerifyConformanceEvidenceTrees` |
| `mission-result-hub`: "70 exports" | **66 exported bindings** | `VerifyMissionResultHub` |
| `sighting-surface`: re-export block `:4706-4714` | `:4709-4714` (comment `:4709-4710`; file is 4714 lines) | `VerifySightingSurface` |
| `probe-and-drill-surface`: "previous file removed first" | temp file + fsync + rename on success; removal/overwrite only on durable-write failure | `VerifyProbeAndDrillSurface` |
| `handoff-and-trial`: base.mjs "~55 consts + ~31 funcs" | 47 exported constants + 31 exported functions (78 declarations) | `VerifyHandoffAndTrial` |
| `handoff-and-trial`: envelope key list | add `plan_digest, acceptance_criteria, plan_path, plan_wave_size, cost_ledger`; `attempt_ledger`/`dispatch_attempts` resilient-only; `effective_launch` conditional | `VerifyHandoffAndTrial` |
| `docs-tree`: fence/header anchors (`SOURCE-MAP:10`, `anti-patterns:2`, `CHARTER-CLI-MAP` as "other", artifacts/evidence/charter/advisory fence lines) | corrected to `SOURCE-MAP.md:11`, `anti-patterns.md:4`, CHARTER-CLI-MAP is one of the 32 snapshots, and the four fence line numbers | `VerifyDocsTree` |
| `docs-tree`: "the other 6 root JSONs carry `stale_note`/`_status`" | `stale_note` in 3, `_status_2026_09_20` in 2, `GOAL-AUDIT.json` declares it in `note` | `VerifyDocsTree` |
| `docs-tree`: AGENTS.md reference anchor | `docs/PRIMEAGENT-ASSIMILATION.md` at `AGENTS.md:53` (count 1 verified) | `VerifyDocsTree` |
| `packages-core-family`: ufo-core "7 `src/*.test.ts`" | **8** | `VerifyPackagesCoreFamily` |
| `packages-core-family`: workspaces "`package.json:6-11`" | `:7-12` | `VerifyPackagesCoreFamily` |
| `packages-core-family`: tsconfig.base applies to two packages "only" | the two packages with a tsconfig; the repo-root `tsconfig.json` also extends it | `VerifyPackagesCoreFamily` |
| `crates-runtime`: "bundled mirrors used by `build.rs`" | `build.rs` consumes only `bundled/config.json` + `bundled/omp-seat-routing.json`; godspeed-core is read by `godspeed.rs`; `bundled/skills/wwkd` is read by no crate code | `VerifyCratesRuntime` |
| `portable-src`: `run:portable` quote | `npm run build:portable && node dist/cli.js` | `VerifyPortableSrc` |
| `config-companions`: digest anchor `:5769` | `:5769-5770` (stored `:5854`); launch side `:8557,8573-8574` → `config_drift` | `VerifyConfigCompanions` |
| `seat-mirrors-and-ports`: capabilities anchor `:8-14` | array at lines 5-11; exit contract `:12-17` | `VerifySeatMirrorsAndPorts` |
| `agents-taxonomy-convention`: "`Return: … Stop after …` line" | terminal bound line; 10/13 exact (three variants quoted) | `VerifyAgentsTaxonomyConvention` |
| `agents-taxonomy-convention`: bare-filename anchors; 8-card worktree count presented as substrate | full paths (`crates/ufo-core-runtime/src/native_schema.rs`, `docs/BEHAVIOR-MATRIX.md`); worktree marked an ompskills surface | `VerifyAgentsTaxonomyConvention`, `NoInventionSweep` |
| `gates-battery`: `gates-plan.mjs` "201" | 200 lines | `VerifyGatesBattery` |
| `crate-cli`: path dep `:18`; impl end-lines; "55 + 1 release-only" | `:17`; corrected end-lines (status 358, gates 415, judge-handoff 270, self-iter 535, local-ship 1523, route-plan 1151, routing-health 1309); 55 `#[test]` total (54 debug / 52 release, 3 debug-only) | `VerifyCrateCli` |
| `scripts-inventory`: extension breakdown attached to the 101 total | root-only composition (83 root files) + the 18 subdir files' extensions | `VerifyScriptsInventory` |
| `cross-surface-ownership`: `chas.mjs` | `scripts/check-hand-authored-sets.mjs` | `NoInventionSweep` |
| `cross-surface-ownership`: `.tower/fleets/**` presented as a substrate surface | marked an ompskills surface | `NoInventionSweep` |
| `cross-surface-ownership`: `ufo-deps.lock` listed as whole-file generated | only `contractRevision` is a generated field; authored pins are deliberate | `VerifyCrossSurfaceOwnership` |

## Not verified (honest limits)

- No gate or test battery was run by any lane; every gate claim remains a source read.
- LSP was unavailable for `.mjs`/Rust in the read-only substrate — all anchors are literal
  line anchors from `read`/`grep`, not semantic references.
- `bundled/*` SHA256SUMS byte-match, the 45-file battery execution claim, and live daemon behavior
  remain unverified.
- The card's behavior under a **write**-capable assignment is unverified; the dispatch test was
  deliberately bounded (four questions + one corpus entry).
