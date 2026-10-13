# Routing-purity precedent — tower1 `tf-audit-routing`

**Asked.** What did the prior routing audit already establish?

**Observed.** Distilled from `.tower/fleets/tower1/rounds/tf-audit-routing-r1.md`
and `-r2.md` (the canonical deliverable is
`.tower/fleets/tower1/reports/tf-audit-routing.md`; r1 sha256
`470f58f5…`, r2 `40aef74e…`, deliverable `585463bb…`).

Findings:

- **F1 (HIGH):** the `m_*` alias rule is machine-checked at zero points on the
  executed path.
- **F2 (HIGH, BY-LUCK):** the launcher injects an **unvalidated** route-capable
  `--config <ufoRoot>/config/mission-nightcall.yml` overlay that outranks the
  global table (`sighting/tower-fleet.mjs:327`).
- **F3 (LOW):** ambient `PI_*_MODEL` / `PI_CONFIG_FILES` env can outrank the
  table.
- **F4 (MEDIUM):** unvalidated `ufoRoot` redirects both route sources.
- **F5 (HIGH):** the suite is blind to a duplicate trailing `--model`
  (`test/tower-fleet.test.mjs:195` checks first occurrence only).
- **F6 (MEDIUM-LOW):** the band is launch-time only.
- **F7 (MEDIUM):** the compiled seat-routing mirror is stale.
- **F8 (MEDIUM):** hygiene — no credential screen on the launcher/applier path.
- **F9 (LOW):** a dead render value + a coarse `l1Alias` regex
  (`sighting/tower-fleet.mjs:137` charset gate).
- **F10 (MEDIUM):** candidate vs in-force table differ on `default`.

L1 probes:

- **V1** overlay precedence — overlay outranks the table (BY-LUCK);
- **V2** duplicate-pin suite blindness (CLEAN-WITH-GAP);
- **V3** live tree passes the routing-free gate; a pinned fixture -> exit 1 (CLEAN);
- **V4** alias gate admits non-`m_*` tokens (CLEAN-WITH-GAP).

Clean claims: claim 1 (no route-pin anywhere in the feature; sweep 0 pins / 176
table-route / 78 prose); `m_strong` is a live `modelRoles` key; the wall adds no
model flag; the wave payload rejects route keys.

**Changed.** None.

**Unknown.** All F1-F10 runtime residue stays INFERENCE (ghost `@token`,
missing/corrupt `--config`, duplicate `--model` last-wins) — not re-run here; the
audited feature revision differs from current HEAD but cited content matches.

Evidence: lane PrecedentScribe26.