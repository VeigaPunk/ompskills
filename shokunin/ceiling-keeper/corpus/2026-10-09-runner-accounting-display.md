# runner-accounting-display — what the wall shows vs what it enforces

Asked: separate the displayed runner totals from the enforced reservations.
Source: `scripts/ufo-sighting.mjs` (`runnerAccounting`, wall line `:1632`). Lane `RunnerAccountingDisplay`. `used` and the `l3: 0` literal re-read by the L1.

- The wall line `totals on wall: L1(n) | L2(n) | L3(n) · runners used/1056` computes `used = max(reserved, observed)` (`:2643-2644`), where `observed = bound.l1 + (l2 ?? 0)`.
- The admission gates (launch, resume, twin, register) compare **reserved only** (`:2128`). `used` is enforced only indirectly, through the dispatcher's `runnerHeadroom`.
- Displayed but never enforced: `L3` is the literal `0` (`levels: { l1, l2, l3: 0 }`, `:2930`); the `used` composite is not an admission gate; `processDescendants` is diagnostic.
- `used` is not clamped, so the line can show more than 1056/1056.
- With an opaque L2, `observed` and `used` are lower bounds (`:2636-2662`). The dispatcher's `wallCapacity` (`fleet-dispatcher.mjs:7728-7766`) does not consume `observedIsLowerBound`.
- `ufo-sighting-lib/surface.mjs:246-248` publishes the three ceilings with `provenance: "config"`. It attributes byte constants to `ufo-sighting.mjs`, but they live in `base.mjs:61-65`.
