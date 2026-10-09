# cross-surface-ownership — who owns what, and how drift is detected

Asked: the ownership invariants across the whole tree — the source-of-truth table, the mirror pairs,
the generated-file convention, and the three-way distinction. Source: lane CrossSurfaceOwnership
report. Anchor: ufo-fsd-alpha@5ace2559 + the ompskills mission worktree.

## Observed — ownership table

| surface | authority | mirror(s) | drift check | anchor |
| --- | --- | --- | --- | --- |
| Guidance prose | `skills/ufo/SKILL.md`, `skills/ufo/references/run-logic.md`, `agents/*.md` | 13 skill targets + 5 agent targets incl. `.omp/skills/ufo`, `.omp/agents`, `.cursor/skills/ufo`, `packages/*/…` | `sync --check` byte-equality per declared target (missing/drifted/extra fail) | `AGENTS.md:3-5`; `sync:89-103,169-175,1900-1995` |
| Judge | `crates/ufo-core-runtime` — the only runtime and only judge | card language; devin profiles (dispatch-shape only) | `check-hand-authored-sets` never-judge lint over every card; devin `--check` | `AGENTS.md:4-5`; `chas.mjs:18-28,39-40` |
| Godspeed posture (directive) | `ssot/godspeed-core/directive.md` | 10+ named mirrors incl. `godspeed-core/`, `skills/godspeed-core/`, `skills/godspeed/`, crate bundle, `.omp/ssot/`, every package root | byte-channel sync + `ufo-deps.lock` pin + adjacent-SHA256SUMS re-verify in the runtime | `SKILL.md:24-40`; `sync:76,104-114`; `godspeed.rs:66,147-216` |
| Band/ceiling | `config/ufo.json sighting.dispatch.swarm` (read live) | crate-bundled copy; prose (non-authoritative); host delta on the write side | sync bundled-config byte channel; consumers refuse typed (`too_few_lanes`, `wave_too_wide`, `impossible_band`) | `AGENTS.md:150-167`; `config:88-94`; `ufo-swarm-wave.mjs:778-807` |
| Routing / seat models | global `~/.omp/agent/config.yml` — the ONLY routing authority; the project declares none | `bundled/omp-seat-routing.json` (derived), `build.rs` role chains, the generated tables in `AGENTS.md`/`L2-L3-ROUTING.md` | `sync-global-routing --check`; `render-seat-tables --check`; `check-routing-free-config` key scan | `AGENTS.md:100-141`; `sync-global-routing.mjs:1-27`; `build.rs:108-110` |
| Host launch config | `config/ufo.json nativeProfiles.omp-native-v1` | `.omp/config.yml` (whole file, incl. `extensions:`) | `syncOmpProjection` rewrites on any byte diff — hand-added entries silently reverted | `AGENTS.md:35-37`; `sync:1629-1668` |
| Sighting wall surface | `scripts/ufo-sighting` code | `config/ufo.json sighting.surfaceDigest` | `--check` spawns `surface --json`, recomputes the digest | `sync:52-63,504-508` |
| Hand-authored sets | `config/ufo.json targets`/`missionFormat.configPath`, AGENTS.md hook enumeration | `config/mission-*.yml`, `.omp/hooks/**`, `substrates/*`, `packages/*` | `check-hand-authored-sets.mjs` planted-or-missing file fails closed | `chas.mjs:1-29,35` |
| State ledger | run processes under `.ufo/**` | none — by design | none; ephemeral + gitignored; liveness judged by transcript mtime | `AGENTS.md:325-327,343-345` |
| Fleet artifacts | dispatcher/wave planner output under `.tower/fleets/**` (ompskills) | `evidence/**` dumps (substrate) are retained provenance | none — data, never instruction | `AGENTS.md:72-76`; `README.md:132-135` |
| Membrane | `config/ufo.json membrane.paths` | — (11 patterns) | accepted touch emits `authority_boundary`; operator charter re-pass | `config:25-36`; `AGENTS.md:66-71` |

Generated-file convention: marker-borne (`AGENTS.md:115-128` and `docs/L2-L3-ROUTING.md:227` sit
between `BEGIN/END GENERATED: seat-routing` markers; `render-seat-tables.mjs` regenerates; `--check`
exits 1 on diff); whole-file generated (`.omp/config.yml`, `skills/SHA256SUMS`,
`ufo-deps.lock.contractRevision`, `crates/ufo-core-runtime/bundled/**`, every skill/agent/dep mirror
target, `.devin/` + `packages/devin/.devin/` profiles); `npm run contracts:sync` = the three
generators, `contracts:check` = the five verifiers. Fresh-clone rule: `missing` on gitignored
generated roots is absent-generator state, not drift (`AGENTS.md:88-96`). Validated-but-hand-authored
exception: `docs/ufo-fsd-charterlist.json`.

Three-way distinction, one chain per example:
1. **Source** (authored authority, in git, hand-edited as a deliberate diff): `ssot/godspeed-core/directive.md`
   — pinned by `ufo-deps.lock` (`sha256:db8896…`), loaded as candidate #1 by the judge runtime (`godspeed.rs:66`).
2. **Generated projection** (derived, byte-checked, never hand-edited):
   `crates/ufo-core-runtime/bundled/config.json` from `config/ufo.json` (`sync:1921-1925`) and
   `.omp/config.yml` from `nativeProfiles` (`sync:1629-1668`).
3. **State artifact** (run output, gitignored, ephemeral, never mirrored): the queue at
   `.ufo/pending-work.json` (`config/ufo.json:77`), transcripts at `.ufo/sessions/<runId>/`
   (`AGENTS.md:326`), and the ompskills fleet records under `.tower/fleets/shokunin2/`.

## Contract — contradictions stated, not smoothed

- Live band drift: `config/ufo.json` says wave 16-32 / `minLanes 16` / `maxConcurrentL1 16` /
  `l1Alias m_strong` (post operator "ompskills tower apply"), while `AGENTS.md:151-154,205`,
  `skills/ufo/SKILL.md:348,385-386`, and `crates/ufo-core-runtime/bundled/config.json` still carry
  the pre-cutover 16-100 / 64 / 32. The bundled-mirror staleness is declared intentional by
  `host/apply.mjs:9-17`; the prose staleness has no owner and its repair sits behind the membrane.
- The "generated host mirror the tower launcher reads (`host/ufo-sighting-dispatch.json`)" is **not**
  a substrate surface: the file exists only in ompskills `host/`, is a write-side delta merged into
  `config/ufo.json` by `apply.mjs`, and the tower launcher reads the substrate config live.
- Two posture lineages: `ssot/godspeed-core/{filter,velocity}.md` (bridge-note version) vs the
  skills-side copies — both digest-self-consistent, reconciled by no gate.
- Named unmanaged drift still live: `.cursor/skills/godspeed/SKILL.md` (`c17af8…`) ≠ canonical
  `skills/godspeed/SKILL.md` (`c0d223…`) per `run-logic.md:2455-2471`; `.omp/skills/{swarm,tower}`
  untracked in the substrate with stale `minLanes` prose.

## Not carried by the source

- No substrate file or script named `host/ufo-sighting-dispatch.json`, and no substrate-side drift
  check for a `config/ufo.json ↔ host/ufo-sighting-dispatch.json` pair (cross-repo; `apply.mjs`
  write-time validation only).
- No digest pin binds the `.cursor/skills/godspeed/` copies; no gate reconciles the two
  filter/velocity lineages; nothing tracks `.omp/skills/{swarm,tower}` in the substrate; the
  per-entrypoint delegation to `ufo-cli` is doctrinal, not mechanically synced (`run-logic:2436-2437`).
- No gate enforces the 64-lane round floor (`AGENTS.md:152-153` "declared policy, not gate-enforced").
- No script claims drift detection between prose numbers and `config/ufo.json` values — the band
  conflict is detectable only by reading.

## Unknowns

- Whether `m_strong` resolves in the live global config; whether `sync --check` currently exits
  non-zero (expected combined `missing`+`drifted`; exact report shape UNOBSERVED).
- Which surface owns repairing the stale band prose (the M3 inbox says "no mission owner" and flags
  it as membrane/operator territory).