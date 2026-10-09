# route-auditor — corpus index

Routing purity: how OMP resolves a seat's route from the operator's global
config, and how the project/dispatch surface keeps that authority single.
Read the entries relevant to the assignment before starting; append one row per
new entry and never rewrite or delete a row.

| entry | topic | added |
| ----- | ----- | ----- |
| [2026-10-09-live-global-config](2026-10-09-live-global-config.md) | the live `~/.omp/agent/config.yml` schema and counts | 2026-10-09 |
| [2026-10-09-alias-table-taxonomy](2026-10-09-alias-table-taxonomy.md) | the `m_*` alias classes: buckets, effort variants, named lanes, omp roles | 2026-10-09 |
| [2026-10-09-resolution-precedence](2026-10-09-resolution-precedence.md) | seat override -> `@alias` -> route; chain keying; never recursed | 2026-10-09 |
| [2026-10-09-dialect-strictness](2026-10-09-dialect-strictness.md) | the hand-rolled parser, splitRoute grammar, effort whitelist, gemini ban | 2026-10-09 |
| [2026-10-09-host-apply-gates](2026-10-09-host-apply-gates.md) | `host/apply.mjs`: the 8-step dry run, what it enforces, what it does not | 2026-10-09 |
| [2026-10-09-routing-free-gate](2026-10-09-routing-free-gate.md) | `check-routing-free-config.mjs`: no project surface declares a route table | 2026-10-09 |
| [2026-10-09-seat-routing-mirror-drift](2026-10-09-seat-routing-mirror-drift.md) | the derived seat-routing mirror, `--check` drift, the compiled consumer | 2026-10-09 |
| [2026-10-09-no-pin-rule](2026-10-09-no-pin-rule.md) | the no-pin rule as written, and its executed-path machine-check status | 2026-10-09 |
| [2026-10-09-route-preflight](2026-10-09-route-preflight.md) | route families, `unpinned`, `route_unreachable`, the probe contract | 2026-10-09 |
| [2026-10-09-dispatch-surface](2026-10-09-dispatch-surface.md) | `config/ufo.json` `sighting.dispatch` and the apply-time delta | 2026-10-09 |
| [2026-10-09-credentials-and-redaction](2026-10-09-credentials-and-redaction.md) | credential-freedom of the routing surfaces and the redaction seam | 2026-10-09 |
| [2026-10-09-routing-purity-precedent](2026-10-09-routing-purity-precedent.md) | the tower1 `tf-audit-routing` findings F1-F10 and probes V1-V4 | 2026-10-09 |
| [2026-10-09-main-seat-bucket-binding](2026-10-09-main-seat-bucket-binding.md) | `main` binds `@m_strong` (with `critic`,`planner`); primary route | 2026-10-09 |