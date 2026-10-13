# Substrate — scripts/sync-global-routing.mjs (mirror + splitRoute)

**Asked.** `splitRoute` rules, the mirror shape, the main-seat binding, and the
`--check` messages gate 7 greps.

**Observed.** `scripts/sync-global-routing.mjs`.

- `splitRoute` L115–166, six ordered rules: first-slash grammar; case-insensitive
  gemini ban over the whole route with a `google-antigravity/` exemption prefix
  (nc4 directive); padded-selector rejection (`:143`); `lastIndexOf(':')` effort
  suffix whitelisted exactly to `low|medium|high|xhigh|max` (case-sensitive;
  absent → `null`); empty-segment check; `[A-Za-z0-9_.-]+` charsets. Returns
  `{provider,model,effort,resolved}` — **no `requested` field**.
- Mirror shape L239–307: `seats[seat]` carries **seven** keys `{alias, chainKey,
  requested, resolved, effort, family, fallbackChain}` (the readme's six-field
  summary omits `chainKey`); each hop is `{requested,resolved,effort,family}`;
  envelope `{schema ufo-seat-routing-v1, resolverVersion 1, source{path,sha256},
  seats, digest}`; `canonicalJson` = sorted-key stringify indent 1 + trailing
  newline.
- **main-seat binding** L220–233/248–266: `main` is resolved through
  `resolveAliasFromMaps(modelRoles, fallbackChains, l1Alias)`; the
  `agentModelOverrides.main` value is never consumed; `seats.main.alias ===
  l1Alias`. `configuredL1Alias()` requires a bare non-`@` alias from
  `config/ufo.json` `sighting.dispatch.missionFormat.l1Alias` (live `m_strong`
  at :85); missing → `modelRoles has no alias <key>` (`omp-global-config.mjs:473-479`).
- `--check` messages gating gate 7: drift
  `error: crates/ufo-core-runtime/bundled/omp-seat-routing.json drifts from the
  live global OMP config; re-run node scripts/sync-global-routing.mjs`
  (L357–363, exit 1) matches `apply.mjs:734`; staleAlias
  `modelRoles has no alias …` matches `apply.mjs:735`. Rewording either source
  string silently downgrades gate 7 (substring contract).

**Verified.** `--check` exits 1 with the exact drift line; a render probe with
`l1Alias m_daybreak` throws the exact staleAlias message.

**Divergence (low).** The `google-antigravity/` exemption prefix is tested
case-insensitively in JS but against the raw route in Rust (`build.rs:473`), so a
mixed-case exemption route with a banned marker renders a mirror the compile gate
refuses. Padding asymmetry (splitRoute rejects, `build.rs:422` trims) is
documented design.

**Added.** 2026-10-09 · lane `SubstrateMirrorScript` (reviewer)