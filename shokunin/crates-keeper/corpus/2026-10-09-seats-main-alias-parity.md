# seats.main.alias parity check

Asked: the headline compile-time contract — `seats.main.alias` must resolve
`sighting.dispatch.missionFormat.l1Alias`. Substrate `5ace2559` (lanes
AliasParity, SeatCompileCheck, ErrorTaxonomy).

## The check (build.rs:549-583)

- `l1Alias` read from `bundled/config.json` →
  `sighting.dispatch.missionFormat.l1Alias` (:555-563); must be non-empty,
  no leading `@` (:564-568).
- `main_alias` read from `bundled/omp-seat-routing.json` → `seats.main.alias`
  (:574-575); compared with exact `!=` (:576-581).
- Verbatim failure (:579):
  `seats.main.alias must resolve the global missionFormat.l1Alias
  {l1_alias:?}, got {main_alias:?}; re-run scripts/sync-global-routing.mjs`
- No empty-fallback clause in the parity check itself; empty terminal
  fallback arrays are legitimate per header :38 (the seat object itself is
  a hop, so the chain is never empty).

## Full chain (each link verified path:line)

operator `~/.omp/agent/config.yml` (`task.agentModelOverrides`, 14 seat
keys; read via `scripts/omp-global-config.mjs:546-596` fd-bound snapshot)
→ `scripts/sync-global-routing.mjs` (MIRROR_SEATS 14 at :64-89;
`configuredL1Alias` reads REPO `config/ufo.json` :220-233;
`buildSeatRoutingMirror` :239-300; `splitRoute` effort whitelist :91,146-153;
Gemini ban :129-133; `--check` byte compare :338-366)
→ `bundled/omp-seat-routing.json`
→ build.rs `ROLE_TAXONOMY` + `validate_generated_graph` (:519-583)
→ `$OUT_DIR/omp_role_chains.rs` (:170-172)
→ `include!` at `execution_profile.rs:548` → `AgentRole` mapping
(`execution_role` native_route.rs:15-31: `Main→Judge`;
`role_route` :201-238; `validate_all_native_role_routes` :253-270 called
lib.rs:1035)
→ `ufo route-plan --role` (main.rs:1119-1151) prints family=route.provider()
→ judge admission: `native_continuity.rs:81-97` requires
`route_family == family` and `requested_model == requested`.

## Critical property

The parity check compares **bundled to bundled**. It passes when both
mirrors are coherently stale — it cannot see the canonical `config/ufo.json`
or the operator's live config. Canonical-vs-mirror drift is caught only by
the sync `--check` gates (see bundled-mirror-provenance).

## Runtime counterpart

`lib.rs:1014-1027` checks only presence + leading-`@` of the alias at
runtime — the equality is build-time only.

## Remediation pattern when drift is found

Re-run BOTH producers: `node scripts/sync-ufo-contracts.mjs` (refreshes
`bundled/config.json`) and `node scripts/sync-global-routing.mjs` (refreshes
the routing mirror, reading `config/ufo.json` for l1Alias). Running only
the latter splits the two bundled files apart.
