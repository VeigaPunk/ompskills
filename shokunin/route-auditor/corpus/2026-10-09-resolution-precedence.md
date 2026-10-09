# Resolution precedence and chain keying

**Asked.** Given a seat, how is its route chosen, and how is its fallback chain
looked up?

**Observed.** Canonical statement in
`ufo-fsd-alpha/scripts/omp-global-config.mjs:7-10`:

> seat override -> modelRoles alias (when "@alias") -> concrete route;
> fallbackChains entry keyed by alias if present, else by the concrete route
> selector, else []. Chains are never wrapped or recursed.

- `resolveFromMaps` (:460-470) / `resolveSeatFromMaps` (:516-541):
  a missing `task.agentModelOverrides[seat]` entry **fails** (:517-518); a value
  `@alias` dereferences one hop through `modelRoles` (alias-to-alias fails
  `malformed`, :483-485); the chain is `chains.has(alias)` first (:463-465), else
  the concrete route key (:466-468), else empty. **The seat name is never a
  chain key.**
- Chains are copied as flat `string[]`, never dereferenced: a step `@m_other`
  stays a verbatim string. The parser fails closed on map-form steps / nested
  keys / stray lines.
- Seat shape: `{ route, fallbackChain: string[], via: { alias, chainKey } }`.
- Sole file authority: `readGlobalSeatRouting`'s one fd-bound `O_NOFOLLOW`
  snapshot of the first `DEFAULT_CANDIDATES` hit; an orphan `fallbackChains` key
  fails the whole snapshot (:581-587). All callers (fleet-dispatcher,
  run-omp-native-trial, sync-global-routing, route-preflight) resolve against
  that single global text.
- The `main`/L1 seat resolves through `resolveAliasRouting(l1Alias)` — it
  deliberately **skips** the seat-override step (operator directive,
  `run-omp-native-trial.mjs:679-681,698-701`), so a change to
  `agentModelOverrides.main` would not move the trial's main.

**Changed.** None.

**Unknown.** omp's own runtime chain-key lookup order (only the UFO dialect is
readable); whether omp keys by alias or concrete route.

Evidence: lane ResolverReviewer14 (14 synthetic probes, 14/14), SeatRoutingScout15,
RouteGraphConnector24. Full route graph for one role has 6 decision points; only
the role->seat naming convention lives outside the global config.