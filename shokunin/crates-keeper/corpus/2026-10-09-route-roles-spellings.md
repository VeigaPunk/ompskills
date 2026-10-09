# ROUTE_ROLES spellings vs ROLE_TAXONOMY

Asked: the role-spelling table in `ufo-cli` and how it compares to
build.rs's taxonomy and the mirror seats. Substrate `5ace2559` (lane
CliRouteRoles; mechanical diff verified).

## Observed

- `ROUTE_ROLES` (main.rs:119-148): 16 rows → 14 distinct `AgentRole`s.
- Aliases: `judge → Judge` (echo of `main`, :125) and `mutation_tester →
  MutationTester` (echo of `mutation-tester`, :141-143).
- `route_role_names()` builds the unknown-role error string ONCE from the
  table — the accepted list and error text cannot drift apart.
- Set comparison: ROUTE_ROLES' 14 roles ≡ ROLE_TAXONOMY's 14 json_keys ≡
  `bundled/omp-seat-routing.json`'s 14 seat keys ≡
  `sync-global-routing.mjs:76-89` MIRROR_SEATS. Identical sets, different
  spellings (`main` vs `Judge` variant name; `mutation-tester` mirror
  spelling vs `mutation_tester` wire name — the actual wire name is
  `mutation_tester`, execution_profile.rs:100).
- `ufo route-plan --role` resolves through ROUTE_ROLES into the compiled
  `generated_omp_steps`/`generated_omp_family` data (main.rs:1119-1151);
  `route_step` emits `family = route.provider()` (:1111-1117) — family is
  the provider segment, not the `m_*` alias.

## Gaps found

- No test ties ROUTE_ROLES to build.rs ROLE_TAXONOMY or `AgentRole::ALL`;
  `main_tests.rs:15-33` checks internal consistency only.
- Doc defect: `fixture_spawn.rs:173-175` calls `mutation-tester` the
  snake_case wire name; the real wire name is `mutation_tester`.
