# Route preflight

**Asked.** How does preflight guard a wave's routes before any lane spawns?

**Observed.** Flags on `ufo-swarm-wave.mjs` (opt-in, plan and run):

- `--route-families` records the wave's route families into `plan.routePreflight`;
- `--route-probe <exe>` also pings each distinct hop once. A family with no
  reachable hop fails `route_unreachable` **before the registry is persisted or
  any payload is emitted** (:92-100, :1331, :1861-1869). With `probe === null`
  the report is `unprobed` and never refuses.

`ufo-route-preflight.mjs`:

- `ROUTE_PREFLIGHT_SCHEMA = "ufo-route-preflight-v1"` (:32); `PROBE_TIMEOUT_MS = 60_000` (:33).
- `routeFamilies` family key = `[seat.route, ...seat.fallbackChain].join(" -> ")`
  (:63-64); `alias = via?.alias ?? null`. Roles with no seat override go to
  `unpinned` — **reported, never probed or refused** (:58-61).
- `commandProbe`: spawn the probe with no shell as
  `<probe> --route <provider/model[:effort]>`; exit 0 = reachable (:90-109).
  A family is reachable when **any** hop answers (the cascade falls through).
- Refusal: any probed family with no reachable hop throws typed
  `route_unreachable` (:169-174); an unreadable config fails closed as
  `route_config_unavailable` (:148).
- The in-repo probe is `scripts/probe-ufo-route-health.mjs` (OMP is its
  credential authority; exit 0 healthy, 3 unhealthy). It **spends one minimal
  completion per hop** rather than zero tokens, and it **refuses effort-less
  hops as a usage error** — the grammar divergence ONESHOT WO-2 names.

**Notable gap (MEDIUM).** Authority grammar makes effort **optional**
(`provider/model` is legal; `@m_swe` = `devin/swe-2` is effort-less), but the
probe requires `provider/model:effort`, so the live `@m_swe` family is 100%
unprobeable (observed: status `unreachable`, class "route must be
provider/model:effort got devin/swe-2", usage exit 2 before any spend).
Mitigated today: no live seat pins `@m_swe`.

Also observed: the outer 60 s SIGKILL vs the probe's own 240 s default
(`commandProbe` passes no `--timeout-ms`) — a LOW-MEDIUM mismatch; and probe
exit 2 (cleanup failure) classes a serving hop unreachable.

**`singleFamily`** (documented): a wave whose pinned lanes collapse into one
route family carrying more than one lane — an opt-in signal to split or record
the accepted risk, never a routing edit.

**Changed.** None.

**Unknown.** Live served-hop probe (spends a completion); `routeFamilies`
collapses distinct provenances sharing identical hops into one family.

Evidence: lanes PreflightFlagsScout20, PreflightModuleReviewer21.