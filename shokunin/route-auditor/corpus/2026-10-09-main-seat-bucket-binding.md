# The `main` seat's bucket binding

**Asked.** In `/home/vgpnk/.omp/agent/config.yml` `task.agentModelOverrides`,
which bucket does the `main` seat bind to, which two other seats share it, and
what single approved-bucket primary route does `main` resolve to?

**Observed** (read of `/home/vgpnk/.omp/agent/config.yml`):

- `main` seat binds to `@m_strong` — `config.yml:32`:
  `    main: "@m_strong"`.
- Same bucket, two other seats:
  - `critic: "@m_strong"` — `config.yml:28`
  - `planner: "@m_strong"` — `config.yml:34`
  (Only those three of the 14 seats carry `@m_strong`; `main`+`critic`+`planner`
  = the three-bucket split's `m_strong` seats.)
- Primary route: `@m_strong` dereferences one hop through `modelRoles` to
  `m_strong: alibaba-token-plan/deepseek-v4.1-flash:max` — `config.yml:7`.
  So `main` -> `@m_strong` -> `alibaba-token-plan/deepseek-v4.1-flash:max`.
  (`m_fast`, `config.yml:10`, holds the same concrete selector, and `plan`,
  `config.yml:6`, too — a route is not a bucket identity; the bucket, not the
  string, is what `main` is bound to.)

Bucket set = the approved three `m_strong`/`m_mid`/`m_fast`; the other `m_*`
keys are named lanes.

**Changed.** None (read-only; corpus entry only).

**Unknown / caveat.** Per the card and
`2026-10-09-resolution-precedence.md`, the `main`/L1 seat as used by the UFO
native trial resolves through `resolveAliasRouting(l1Alias)` and deliberately
**skips** the seat-override step, so `agentModelOverrides.main` does not move
that trial's main. The `@m_strong` answer here is the seat-override binding in
the global config, not necessarily the executed trial route. Unverified in this
task (read-only, no runner).

Evidence: read of `/home/vgpnk/.omp/agent/config.yml` (grep line numbers
:28,:32,:34 seats; :7 route). Confidence: high on the config facts; inference on
the trial-path caveat (cited from corpus, not re-run).