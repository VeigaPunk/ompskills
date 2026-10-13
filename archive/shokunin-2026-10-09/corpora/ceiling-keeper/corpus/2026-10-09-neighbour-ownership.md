# neighbour-ownership — what ceiling-keeper owns vs cites

Asked: the boundary with neighbouring shokunin, and whether their numeric claims still hold.
Lane `NeighbourCorpora` (connector).

Neighbour claims that match live: config sha `0e416f0a` (wave-smith, godspeed-keeper); 16/32/100 (wave-smith, fleet-warden, godspeed-keeper, host-smith);
maxConcurrentL1 16, windowPaneCeiling 16, globalRunnerCeiling 1056 (fleet-warden); the launcher gate sites `tower-fleet.mjs:151-159,337-341`; validator derivation `:794-1009`; hub constants `:2415-2418`.

Gaps this corpus fills:
- fleet-warden `ceiling-relational-model` marks `globalRunnerCeiling` "NOT READ / no gate". That is true for the **launcher only**. The wall enforces it (`RUNNER_CEILING_EXCEEDED`).
- Neighbours cite only the launcher's `>` gates. The wall's `>=` gates (`L1_CEILING_EXCEEDED`, `CAP_EXCEEDED`) count live rows globally.

Own: the cross-surface numbers table (value, declaration, readers, enforcement, operator, unit), the runtime enforcement sites, numeric prose drift, and same-name or same-value distinctions.
Cite: wave-smith (spec shape, refusal precedence semantics, resume exemption), fleet-warden (launcher verbs, `CONFIG_UNREADABLE` arms), host-smith (apply dry-run machinery),
route-auditor (`l1Alias`, seat table), harness-scout (omp internals), godspeed-keeper (directive prose).
