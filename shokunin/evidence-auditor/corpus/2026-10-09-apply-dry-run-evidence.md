# 2026-10-09 — `host/apply.mjs` as change evidence

**Asked.** What does `host/apply.mjs` prove before and during a write, and how
does a reviewer re-derive the band? (lane `ApplyDryRunEvidence`, reviewer.)

**Observed.** `host/apply.mjs` (read; not executed).

- **Dry run changes nothing** (`:4-7`, exit `:1003-1012`); the only side effect is
  a probe spec in the system temp dir, removed in `finally` (`:604,613,693-694`).
  The verdict is **bound to bytes**: a sha256 receipt of the resolver-accepted
  candidate (`:241`; the digest is computed over raw snapshot bytes in
  `scripts/omp-global-config.mjs:109`).
- **Exactly two files written**: `~/.omp/agent/config.yml` (default install
  target `:163`, installed from `host/omp-agent.config.yml`, atomic write +
  read-back verification `:865-892`) and `<ufo-root>/config/ufo.json`
  (`:361`, default `/home/vgpnk/Projects/ufo-fsd-alpha`, surgical per-line merge
  validated against a deep-equal expected before any write `:894-941`).
- **Backups** (`:842-849`): copy to `${target}.${stamp()}.bak` with the source
  mode, failing closed if the backup path already exists; the stamp is ISO-8601
  UTC dashified (`:141-143`); names are pre-printed in the apply plan
  (`:775,783`).
- **Eight gates**: (1) preflight resolver rules + credential-shape screen;
  (2) resolver gate via the real `omp-global-config.mjs` `readGlobalSeatRouting`
  (14 seats, sha256); (3) dispatch delta bounds; (4) route gate via the real
  `renderSeatRoutingMirror` + whole-table `auditRoute` (gemini ban, chain
  bare-distinctness); (5) the compile gate replicated (`build.rs validate_chain`,
  `seats.main.alias === l1Alias`); (6) the wave gate — the real CLI `plan` at 32
  lanes plus an injected post-apply policy proving 16 admit / 15 `too_few_lanes` /
  32 admit / 33 `wave_too_wide` / 101 `too_many_lanes`; (7) mirror status
  (`sync-global-routing.mjs --check`, reported never enforced); (8) the apply plan
  (predicted writes/backups/key-edits).
- **Band authority**: measured from the merged config, never prose.
  `plannerEnv` pins `UFO_PROJECT_ROOT`/`UFO_CONFIG_PATH` so each leg proves the
  file it reports; the `ok` line quotes `plan.policy` which carries
  `source:"config"`. `AGENTS.md`’s 16–100 prose is explicitly acknowledged stale
  (`apply.mjs:94,830-832`). Observed merged state: `waveMinLanes 16`,
  `waveMaxLanes 32`, `maxLanes 100`, `minLanes 16`, `maxConcurrentL1 16`,
  `l1Alias m_strong`.

**Reviewer re-derivation recipe**: (1) read `sighting.dispatch.swarm.*` +
`maxConcurrentL1` in `<ufoRoot>/config/ufo.json`; (2) run
`node scripts/ufo-swarm-wave.mjs plan --spec <spawn spec>` with
`UFO_PROJECT_ROOT`/`UFO_CONFIG_PATH` bound and read `policy` (`source` must be
`"config"`; values after the `Math.min` clamps to `maxLanes`/100); (3) run
`node host/apply.mjs` (dry) whose step 6 prints the live band from `plan.policy`
and proves the edges bite via `too_few_lanes`/`too_many_lanes`/`wave_too_wide`;
(4) **never** cite `AGENTS.md` or the `swarm.note` text as the band.

Receipts observed: sha256 `host/omp-agent.config.yml` =
`15b401854c3446874e7783c78ed5eeeedc86793fee31c2056799d5fddd04b5c9` (25425 B);
`host/ufo-sighting-dispatch.json` =
`3c0c4d67af146b147da70cc72b337bdbe949981893eaa235ffff5b247d5343b3` (186 B).

**Changed.** Nothing — read-only research.

**Unknown.** `host/apply.mjs` and the validator were not executed (no live stdout
observed); `build.rs validate_chain` was not read in full beyond the observed
function/call site; the current `~/.omp/agent/config.yml` was not inspected. Lane
report: `.tower/fleets/shokunin2/reports/evidence-auditor/ApplyDryRunEvidence.md`.