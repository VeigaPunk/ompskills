# The live global config — schema and counts

**Asked.** What does the operator's global routing authority actually contain?

**Observed.** `/home/vgpnk/.omp/agent/config.yml`, 221 lines (220 newlines, no
trailing newline), mode 0600, zero comment lines, no credential.

- Exactly 6 top-level keys: `setupVersion` (l.1 = 2), `extendedContext` (l.2 =
  true), `modelRoles` (l.3 block), `task` (l.26 block), `retry` (l.42),
  `dev.autoqaConsent` (l.221 = granted). No `agents`/`seats`/`routes`/`aliases`
  key — one routing authority, no second route source in the file.
- `modelRoles`: **19 keys**, lines 4-22; every value a concrete
  `provider/model[:effort]`, none an `@alias`.
- `task.agentModelOverrides`: **14 seats**, lines 27-40, every value `@m_*`
  (see the alias-taxonomy entry).
- `task.maxConcurrency` = 32 (l.24), `task.maxRecursionDepth` = 2 (l.25) — both
  routing-neutral budgets.
- `retry.modelFallback` = true (l.42); `retry.fallbackChains`: **31 chains**.
- sha256 of the raw bytes: `ed164f819af11cec956bc19ca5404cc81949ecfac9e463117d2e5ea53686abdb`
  (matches `sha256sum`; the resolver hashes raw bytes and strips a BOM only for
  `text`).

**Changed.** Nothing (read-only).

**Unknown.** Whether omp's own loader accepts an unprefixed vs `@`-prefixed
override spelling (not run); whether the `@m_*` bucket namespace is asserted
closed anywhere.

Evidence: lane LiveAliasScout01, SeatsScout02, KnobsScout04, ChainsReviewer03;
reports under `.tower/fleets/shokunin/reports/route-auditor/`.