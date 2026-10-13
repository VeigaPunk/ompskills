# route-preflight — SUB-8 route families, `singleFamily`, and `route_unreachable`

Asked: the opt-in route preflight.
Source: `scripts/ufo-swarm-wave.mjs:1384-1395, 1857-1870, 1814, 1840-1844`;
`scripts/ufo-route-preflight.mjs:18-176`. Lane: `RoutePreflight`.

- `waveRoutePreflight` builds `laneCounts` **per role** from the plan's spawn entries
  only — resume lanes have no `agent` field and are never counted, grouped, or probed.
  A `RoutePreflightError` re-wraps into `SwarmWaveError` carrying `details`.
- `routePreflight({laneCounts, probe, routingOptions})` reads **one** fd-bound global
  config snapshot per preflight (`O_NOFOLLOW` + fstat + sha256, in
  `scripts/omp-global-config.mjs:71-114`) and records its identity as
  `config {path, sha256}`. A **family** is a distinct resolved primary + ordered chain;
  roles on the same cascade merge into one family.
- `singleFamily = families.length === 1 && largest > 1` — it **records, never refuses**.
  Only a probed dead family refuses.
- Unpinned roles (no seat override) are pushed to `report.unpinned` and skipped entirely:
  excluded from `families`/`largest`/`pinnedLanes` and never probed. So `singleFamily` is
  a statement about **pinned lanes only**. Round-2 correction: the illustrative "16 lanes
  with 14 unpinned roles" is lane/role confusion — unpinned rows are counted **per role**
  and `SWARM_ROLES` has exactly ten. A reproduced synthetic (2 reviewer + 8 scout + 6
  critic, two of them unpinned) reads `{families: 1, largestFamilyLanes: 2, pinnedLanes: 2,
  singleFamily: true}`; on the **live** config all ten swarm roles are pinned, so
  `unpinned` is empty there and the concentration math sees the whole wave.
- `route_unreachable` (`ufo-route-preflight.mjs:173`, message "no hop answered for N route
  famil(y|ies) …; no lane was spawned") fires at `:1861-1870` **strictly before**
  `persistWaveRegistry` and before `emitJson`. Empirical run-side proof: exit 1, 0 bytes
  of stdout, no registry file created.
- Probe contract (`ufo-route-preflight.mjs:18-28, 90-109`): `<probe> --route <hop>`,
  `shell:false`, stdin ignored, no credentials, 60 s SIGKILL, exit 0 = reachable; a
  failure class comes from `stdout results[0].failureClass`, else the first stderr line,
  else exit/signal; ≤120 printable chars.
- Flags: `--route-families` (boolean) and `--route-probe <exe>` (value, path-gated);
  duplicates are usage faults (exit 64). Observed `plan --route-families` on the live
  config: 3 families (`m_fast` scout 8, `m_mid` reviewer 4, `m_strong` critic 4),
  `concentration {families: 3, largestFamilyLanes: 8, pinnedLanes: 16, singleFamily: false}`;
  a 16-scout spec showed `singleFamily: true`; a dead probe showed 21 pings for 21
  distinct hops.
- Operator rule: never edit or override global routing from the wave, never hardcode a
  provider/model/credential, never use a per-lane model knob; on `singleFamily`, split the
  wave or record the accepted risk. Pins live in `ufo-route-preflight.test.mjs`; the wave
  suite carries **no** route pins.

## Not carried by the source

- `singleFamily` is not "all lanes on one cascade" — it never sees unpinned lanes.
- No project-local route fallback: routing comes only from the global config.

## Unknowns

- Live-provider probe answers (stubs used); the healthy-probe run side is suite-pinned,
  not re-run here.
