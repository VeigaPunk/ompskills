# host apply: what it installs and what a skill doc must cite

**Asked:** what `host/apply.mjs` installs, with what idempotency, and which artifacts a skill doc cites.
**Sources:** `host/apply.mjs` (1041 lines, full), `host/omp-agent.config.yml` (491 lines, full),
`host/ufo-sighting-dispatch.json` (12 lines); read-only cross-checks in the substrate.

## Observed

- `apply --apply` writes **exactly two files** (`apply.mjs:9`): the GLOBAL omp authority
  `~/.omp/agent/config.yml` (`--install-target` overridable, `:163/:174`, from candidate
  `host/omp-agent.config.yml`, `:59`, `installConfig` :865-892) and the PROJECT dispatch authority
  `<ufoRoot>/config/ufo.json` (`dispatchGate` :361, `--ufo-json` :173, `mergeDispatch` :894-941 —
  a surgical per-line rewrite of `sighting.dispatch` only). It installs **no** skills, agent cards,
  or hooks, and never touches the project `.omp/` tree; `DEFERRED_ARTIFACTS` (:91-96) names four
  derived artifacts deliberately left stale.
- Dry run is the default (:4-7, :158); `--apply` required to write (:167); the verdict path exits 0
  without writing (:1003-1012). The only dry-run filesystem write is the generated wave probe spec
  in `mkdtempSync(tmpdir(), "hostcfg-wave-")` (:604,:613), removed in `finally` (:693-695) — and
  `ufo-swarm-wave.mjs plan` is write-free (registry persistence is gated on `command === "run"`).
  Children are pinned to the candidate (`UFO_OMP_GLOBAL_CONFIG_PATH`, :231/:617/:714) and the
  checkout (`plannerEnv`, :588-595).
- Idempotency: unchanged edits are skipped (:296-300, :325); `mergeDispatch` refuses to write
  anything outside `sighting.dispatch` (:913-931); key-line uniqueness is enforced (:301-306);
  timestamped backups refuse to clobber (:842-849); writes are atomic `wx`+`renameSync` (:853-863).
  A repeat `--apply` is content-neutral but leaves two fresh `.bak` files.
- Eight gates (:185-696): preflightCandidate, resolverGate (all 14 `MIRROR_SEATS` present),
  dispatchGate (`positiveInt`, inverted band, `MAX_SWARM_LANES`, bare `l1Alias`), mirrorGate
  (`renderSeatRoutingMirror` = the `sync-global-routing --check` half) + `wholeTableAudit`,
  compileGateRule (`build.rs` `validate_chain` + `seats.main.alias === l1Alias`), waveGate (a real
  32-lane CLI probe plus injected-policy probes: 16 admit, 15 `too_few_lanes`, 32 admit, 33
  `wave_too_wide`, 101 `too_many_lanes`), mirrorStatusReport (reported, never enforced), post-apply
  re-verify. Exit codes: 0 ok / 1 fail / 64 usage.
- Config mapping: `modelRoles` declares 19 aliases, each a concrete `provider/model:effort`
  (the resolver refuses alias->alias, `omp-global-config.mjs:481-484`);
  `task.agentModelOverrides` = the 14 ufo seats (3 strong `critic`/`main`/`planner`, 5 mid, 6 fast),
  `main` MUST stay `@m_strong` (enforced :974-980); `WAVE_ROLES` is 10 of those 14; 31 chain keys =
  19 alias + 12 concrete-selector (the 3 effort-variant values have no concrete key by design).
  `@m_strong` and `@m_fast` share one primary route; buckets differ only by cascade depth.

## Findings

- **F1 MEDIUM:** the merged destination has no symlink guard and no disk read-back — a symlinked
  `config/ufo.json` would be replaced by a regular file while its target never receives the delta,
  silently turning "EXACTLY TWO files" into two wrong files (:362-363, :855-860, :929-934 vs the
  config path's :885-890 check). Code-level, not exercised.
- **F2 MEDIUM:** the config header's arithmetic is wrong twice — ":33-34 twenty-nine chains" vs the
  31 enumerated; ":197 `waveMinLanes` raised from 16 to 32" contradicts
  `host/ufo-sighting-dispatch.json:9` and `apply.mjs:678-683` (16 IS the floor; the floor moved
  32->16, the ceiling 100->32). Nothing gates prose counts; `wholeTableAudit` prints the live number.
- F3/F4/F5 LOW: preflightCandidate is stricter than the resolver it mirrors (BOM refused);
  `mirrorGate` imports `sync-global-routing.mjs` unguarded; `planNoteRewrite` is currently inert.
- **F7 host state:** the candidate is unapplied and the delta is already applied —
  the live `config/ufo.json` already carries `maxConcurrentL1: 16`, `l1Alias: "m_strong"`,
  `swarm 16/16/32/100`, so today's dry run reports every dispatch edit `unchanged`.

## Source-of-truth set for a skill doc

- seat->bucket->route and cascade -> `~/.omp/agent/config.yml` (live), with
  `host/omp-agent.config.yml` as the staged candidate; name the keys, do not restate routes.
- wave band / L1 count / `l1Alias` -> `<ufoRoot>/config/ufo.json` `sighting.dispatch.*`;
  `host/ufo-sighting-dispatch.json` is the delta, not the live band.
- hard lane constants and refusal codes -> `scripts/ufo-swarm-wave.mjs` +
  `ufo-mission-result.mjs:2415` (`MAX_SWARM_LANES = 100`), never `apply.mjs:65`'s copy.
- install footprint -> `host/apply.mjs:9-17`, `:91-96`, `:808-812`, `:814-839`.

## Remaining unknown

No `apply` run was performed (code-read only); the identity of the two excluded providers and the
`nativeProfiles` bounds are outside these sources.
