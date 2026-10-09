# Chain resolution — two different walkers

Asked (lanes ResolverChainRules, OmpRetrySemantics): which chain a route
follows, under the ufo resolver and under omp's own runtime.

## Observed

**ufo resolver** (`ufo-fsd-alpha/scripts/omp-global-config.mjs`):
`resolveFromMaps` L460-471 — if the seat's override is `@alias` and
`chains.has(alias)`, the alias chain wins; else `chains.has(route)` for the
concrete key; else `[]`. All 14 seats are `@alias`-bound, so seats always
follow alias chains. `fallbackChain` = hops only; primary is prepended later
(`build.rs` L245-261; JS consumers `run-omp-native-trial.mjs:394,771`,
`fleet-dispatcher.mjs:3671`). `retry.modelFallback` is never read by the
resolver. Dead-weight rule L579-587: every chain key must be a modelRoles key,
modelRoles value, or resolved seat route — weaker than it reads: the 12
concrete-keyed chains pass while being unreachable by any seat.

Parser dialect (`parseFallbackChains` ~L362-454): keys 2-space indented under
`fallbackChains:`; `key: []` and bare `key:` both give `[]`; duplicate keys
(incl. bare-vs-quoted collision) → `ambiguous`; nested key → `malformed`;
`[]` BEFORE items throws, items-then-`[]` silently accepted (comment
contradiction at L381-384).

**omp runtime** (binary v18.8.7, `strings` extraction): `retryFallbackChainKeys`
returns `[pinnedRole?, resolvedKey]` where `resolvedKey` matches the ACTIVE
MODEL selector against chain keys — order: (1) exact concrete
`provider/model:effort` key, then normalized, then base (no-effort) match;
(2) `provider/*` wildcards, longest id-prefix; (3) hint role; (4) role keys
whose modelRoles primary matches (`default` returns immediately); (5)
`default` catch-all. Concrete key beats a role on the same model — OPPOSITE of
the resolver's alias-first rule. Candidate list = `[primary, ...hops]` deduped
by raw selector; walk slices after current model (forward-only; `wrapAround`
only on a GoUsageLimit path).

Consequence: `m_mid`'s primary `alibaba-token-plan/qwen3.8-flash:high` has an
exact concrete key (4 hops), so omp-native runs of that model ride the
concrete chain while ufo seats on `@m_mid` ride the 6-hop alias chain.
`m_mid_med`/`m_mid_low`/`m_fast_high` have no concrete keys, so variants
always ride alias chains. Live `default` (`devin/swe-2:max`) resolves to the
`devin/swe-2` key by base match — the `devin`-only 2-hop chain.

## Evidence

- `scripts/omp-global-config.mjs:362-541`; reports
  `ResolverChainRules.md`, `OmpRetrySemantics.md`, `SilentFailureModes.md` E5.

## Unknowns

- Whether ufo's `routeChain` is enforced inside omp's own walk (unread).
- Line 218 live google hop's owning chain not individually re-verified.
