# verify-contract-sync-gate — observed `sync-ufo-contracts.mjs --check` on a scratch copy

Asked: does `node scripts/sync-ufo-contracts.mjs --check` report `ok:false` right now, and which `drifted`/`missing` entries cause it? Settles the [INFERENCE] risk in `2026-10-09-shadow-executors.md` § Risk.
Anchor: `ufo-fsd-alpha@5ace2559` working copy (read-only). `scripts/sync-ufo-contracts.mjs` sha256 `fb9d3137…` (2273 lines), `config/ufo.json` `0e416f0a…`, `bundled/config.json` `1f6b2115…`, `bundled/omp-seat-routing.json` `d4364b67…`. Lane: `DrillKeeperSmoke`.

## Method
- Scratch: `/home/vgpnk/Projects/ompskills/.tower/fleets/shokunin3/scratch/drill-keeper/DrillKeeperSmoke/tree/`, filled with `cp -r` of every `SHADOW_PATHS` entry (`scripts/ufo-drills.mjs:68-84`). `find -type l` in the copy returned 0. `.devin` and `.ufo/pending-work.json` do not exist in the substrate, so they were skipped, the same way `buildShadow` skips missing entries. Nothing else was needed: the script ran to a full report.
- Command (cwd = scratch tree): `NODE_COMPILE_CACHE= node scripts/sync-ufo-contracts.mjs --check`. **exit 1**, stderr empty, stdout 51 822 bytes of JSON (kept at `…/DrillKeeperSmoke/check.stdout.json`).
- `git -C /home/vgpnk/Projects/ufo-fsd-alpha status --short | wc -l`: **14 before, 14 after.**

## Observed report
- `ok: false`, `mode: "check"`, `validationErrors: []`, `extras: []`, `changed: []`.
- `drifted` (2): `crates/ufo-core-runtime/bundled/omp-seat-routing.json`, `crates/ufo-core-runtime/bundled/config.json`.
- `missing` (18), all Devin targets:
  - `.devin/skills/ufo/{SKILL.md, references/CHANGELOG.md, references/run-logic.md, references/godspeed-core/{filter,velocity,directive}.md}` (6), and the same 6 under `packages/devin/.devin/skills/ufo/`.
  - Dependency mirrors: `.devin/ssot/godspeed-core/directive.md`, `.devin/skills/wwkd/{SHA256SUMS,SKILL.md}`, and the same 3 under `packages/devin/.devin/`. These are also listed in `depsClosure.unsatisfied` as `packaged dependency mirror is missing` (deps `godspeed-directive`, `wwkd-skill`).
- Other failing blocks that feed `ok` on their own (`:2149-2150`: check mode needs `missing`, `drifted`, and `extras` empty **and** `surface.ok` **and** `routesEquivalence.ok` **and** no `validationErrors`):
  - `routesEquivalence.ok: false`, 14 seats, 91 mismatches. The first is seat `main` alias: expected `m_strong` (rendered from the machine-global `~/.omp/agent/config.yml` via `renderSeatRoutingMirror`, `scripts/sync-global-routing.mjs:305`), actual `m_daybreak` in the bundled mirror. This is the main-mode check. `UFO_PROJECTION_ROOT` was unset (`:51`), so the verdict depends on the host's global OMP config.
  - `surface.ok: false`, `outcome: "drift"`: declared `sha256:666cd0a1…`, computed `sha256:8884924f…` from `scripts/ufo-sighting surface --json`.
  - Passing: `projection.ok`, `packageScopes.ok`, `skillsSums.ok`, `docsDates.ok`.
- Causes of the drift:
  - `config/ufo.json` vs `bundled/config.json` differ in the working copy (4 hunks: `maxConcurrentL1` 16/32, `l1Alias` m_strong/m_daybreak, `minLanes` 16/64, `waveMaxLanes` 32/100). They **also differ at HEAD** (3 hunks): `5ace2559` edited `config/ufo.json`, and the bundled copy was last touched at `72ab84a8`. So the drift is committed, not only the uncommitted swarm-band edit.
  - `.devin/` and `packages/devin/.devin/` have zero tracked files (`git ls-files` returns 0), so every Devin target is missing on any clean checkout.

## Verdict on the shadow-executors risk: **confirmed** for the gate. Drill outcomes are not observed.
- The gate is real. `self_iter` (`crates/ufo-cli/src/main.rs:444-459`) calls `write_contract_sync_record`, and `mirrors_ready = status.success() && report.ok` (`:678-679`). `allContractsReady` is false, so `block_self_iter(..., 2)` runs **before** `phase0_report` and before any orchestration.json load.
- The 9 self-iter drills and their `expect.exit`:
  - exit 1: `d-herd`, `d-i1-second-l1`, `d-i3b-all-down`
  - exit 0: `d-i5-cache`, `d-i8-saturate`, `d-i8-theater`
  - exit 2 plus report/artifact keys: `d-i3-lane-dies`, `d-i4-telemetry`, `d-timeout`
- [INFERENCE, no drill run] All 9 go red on this host and tree. The exit-0 and exit-1 rows fail on `exit`. The exit-2 rows match on exit but should fail on `outcome`/`report*`/`loop-state.json`, because the loop never runs.
- Sharper than the seed: three independent failures (`drifted`/`missing`, `routesEquivalence`, `surface`) each force `ok:false` alone. Fixing the bundled-config mirror by itself would not turn the gate green.
- The charter Phase 0 `contracts` stage uses the same `contract_sync_check_command` (`:956`, `:971`), so `ufo charter sign` fails stage 1 on this tree too [INFERENCE from the shared command].

## Side effect worth knowing
- In the scratch tree the run created `.ufo/cache/node-compile/…`. `NODE_COMPILE_CACHE=` set to empty does not suppress it: `scripts/ufo-sighting:24` uses `${NODE_COMPILE_CACHE:-$ROOT/.ufo/cache/node-compile}`, and `:-` treats empty as unset.
- So a real `--check` on the substrate, which every self-iter run and charter sign does, writes into the substrate's gitignored `.ufo/cache/` [INFERENCE from the script line; observed only in scratch].

## Unknowns
- Whether the expected `m_strong` reflects a stable operator global config or a transient host state. A different host would compute a different `routesEquivalence`.
- Whether Devin projection targets are meant to be generated by a write-mode sync before `--check`. A write-mode run was not done, because it would also rewrite mirrors.
- No drill was run, so the per-drill red verdicts stay [INFERENCE].
