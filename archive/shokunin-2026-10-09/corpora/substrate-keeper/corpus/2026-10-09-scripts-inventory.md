# scripts-inventory — the complete scripts/ surface

Asked: every entry under `scripts/` with its one-line function, family, CLI-vs-lib class, and test
pairing. Source: lane ScriptsInventory report.
Anchor: ufo-fsd-alpha@5ace2559, `config/ufo.json` sha256 `0e416f0abc559e9a…`, `AGENTS.md` sha256
`60dde86a7f6513848fc218a26121c21415e71fd1a60d5dece2c3b3b252f6fdc1`.

## Observed

- `ls scripts | wc -l` → **87** root entries (83 files + 4 dirs); `find scripts -type f | wc -l` → **101**
  (83 root files: 73 `.mjs`, 8 `.sh`, 1 `.json`, 1 extensionless executable bash `ufo-sighting`;
  18 subdir files: 10 `.mjs`, 3 `.sh`, 1 `.json`, 1 `.txt`, 1 `.md`, 1 `.service`, 1 `.timer`).
  Subdir files: 18 (`charter-scribe/` 5, `collect-omp-native-handoff-lib/` 5, `lean-cargo/` 4,
  `ufo-sighting-lib/` 4).
- `scripts/ufo-sighting` is a **file** (bash shim), not a directory.
- Import targets by frequency: `ufo-mission-result.mjs` (20), `base.mjs` (10),
  `omp-global-config.mjs` (9), `ufo-native-names.mjs` (7), `ufo-credential-screen.mjs` (7),
  `primeagent-refinement-ledger.mjs` (7), `sync-global-routing.mjs` (6).
- 23 colocated `scripts/*.test.mjs`; three target `.omp` hooks (`ufo-godspeed-inject.test.mjs`,
  `ufo-l0-monitor-hook.test.mjs`, `ufo-statusline-hook.test.mjs`). No test anywhere for
  `dev-verify.sh`, `nc5-origin-sync.sh`, `nc5-seat-watch.sh`, `ufo-drills.mjs`, `lean-cargo/*`,
  `charter-scribe/systemd/*`.
- 11 files carry the shared `isMainModule` helper (defined `ufo-mission-result.mjs:2391`); others use
  an inline `process.argv[1]` guard or a top-level `main()` that runs on import.

## Contract

15 families (one-line function per family):

| family | members |
| --- | --- |
| wave/dispatch | `fleet-dispatcher, ufo-swarm-wave, ufo-swarm-collect, ufo-route-preflight, omp-wave-context, omp-role-work, fleet-ledger-read, fleet-ledger-rotate` |
| sighting | `ufo-sighting` (shim), `ufo-sighting.mjs`, `ufo-sighting-lib/*` |
| fleet-lineage | `prepare-ephemeral-l1, prepare-ephemeral-fleet, land-fleet-run, fleet-selfheal-verify` |
| l0-monitor | `ufo-l0-monitor, ufo-l0-watch` |
| watchdog | `ufo-stale-watchdog, ufo-night-watchdog.sh, ufo-night-watchdog-lib.sh, ufo-watchdog-repend` |
| state-governor | `ufo-state-census, ufo-state-retention` |
| contract-check / routing gate | `check-hand-authored-sets, check-routing-free-config, sync-ufo-contracts, sync-global-routing, render-seat-tables, omp-global-config, gates.sh, gates-plan, dev-verify.sh` |
| mission-envelope | `ufo-mission-result` (foundation), `-lifecycle, -activity, -observation` |
| host/omp-native | `run-omp-native-trial, collect-omp-native-handoff(.mjs + lib), omp-native-shutdown, ufo-native-names, ufo-credential-screen, project-devin-subagents, the-tick-config, the-tick-ping, ufo-ground-handler` |
| probe | `probe-ufo-route-health, probe-token-plan-{kimi,models,shared}, probe-redact, probe-token-plan-models.verdict.json` (data), `fake-omp` |
| primeagent | `primeagent-refinement-ledger, ufo-refinement-context, primeagent-recovery-assess` |
| drills | `ufo-drills, self-iter.sh, smoke.sh` |
| charter | `charter-scribe/sync.mjs` + config/prompts/systemd assets |
| helper/ops | `local-helper, lean-cargo/*, nc5-origin-sync.sh, nc5-seat-watch.sh` |
| test | the 23 colocated pins |

Rules: the shared spine is `ufo-mission-result.mjs` (bounded I/O, path gates, atomic write, dir
lock, argv, JSON envelope, `isMainModule`); `scripts/` is executable authority per README
§Authority boundary; a direct-entry CLI and an `export` surface are **independent signals** —
several files are CLI+LIB, so classification uses the guard/main idiom plus the import graph.

## Not carried by the source

- No CLI was executed (behavior beyond declared usage is UNOBSERVED); `drills/*.drill.json` not
  inventoried here; function lines derive from headers/usage/call-sites, not full reads.

## Unknowns

- The working tree was **dirty** at read time: ` M README.md`, ` M config/ufo.json`, untracked
  `.omp/skills/{swarm,tower}/`, several `config/ufo.json.*.bak` (none under `scripts/`).
  `probe-token-plan-models.verdict.json` (`checkedAt` 2026-09-24) names a `configPath` under
  `/home/vgpnk/Projects/ephemeral/nc4/repo/…` — a stale fixture-bound verdict, not this checkout's evidence.