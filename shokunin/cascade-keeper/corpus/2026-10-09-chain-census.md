# Chain census — the 31 fallbackChains keys

Asked (r1 wave lanes ChainsRoleKeys, ChainsSeatAliases, ChainsConcreteKeys,
ModelRolesTable): inventory every chain, every hop in order, every primary.

## Observed

Both `host/omp-agent.config.yml` (candidate) and `~/.omp/agent/config.yml`
(live) carry **31** `retry.fallbackChains` keys and **145** hop slots,
byte-identical chain bodies (parser-verified). The candidate header says
"twenty-nine chains" (line ~33) — stale prose; the real count is 31.

Key forms: 19 alias keys = 4 omp roles (`default`, `smol`, `slow`, `plan`) +
15 `m_*` (buckets `m_strong`/`m_mid`/`m_fast`, variants `m_mid_med`/`m_mid_low`/
`m_fast_high`, lanes `m_qwen38max`, `m_luna`, `m_antigravity`, `m_composer`,
`m_swe`, `m_k3`, `m_sol`, `m_glm53`, `m_grok`); 12 concrete-selector keys, each
byte-matching a distinct non-variant modelRoles value.

Chain-key line map (candidate): default 247, smol 258, slow 272, plan 285,
m_strong 301, m_qwen38max 314, m_mid 323, m_fast 332, m_luna 341, m_mid_med
354, m_mid_low 361, m_fast_high 370, m_antigravity 382, m_composer 388,
m_swe 391, m_k3 394, m_sol 398, m_glm53 403, m_grok 413; concrete keys
430, 435, 441, 446, 452, 456, 459, 462, 466, 470, 476, 481.

modelRoles (19 keys): candidate 111-185, live 3-22. All values are concrete
routes — none is an `@alias`. Only content divergence: `default` (see
config-drift entry).

Six concrete keys duplicate their alias twin byte-for-byte; six differ —
notably `alibaba-token-plan/qwen3.8-flash:high` (concrete, 4 hops) drops the
`glm-5.2` and `cursor` hops that `m_mid` (alias, 6 hops) carries.

Variant parity verified in both files: `m_mid_med` and `m_mid_low` chains equal
`m_mid` byte-for-byte; `m_fast_high` equals `m_fast`. No `m_strong` variant
exists — its only lower rung (`:high`) already exists as `m_fast_high`.

## Evidence

- `.tower/fleets/shokunin3/reports/cascade-keeper/{ChainsRoleKeys,
  ChainsSeatAliases,ChainsConcreteKeys,ModelRolesTable,EffortVariantParity,
  ChainGraphShape}.md`
- `awk`-parse of both files: 31 keys / 145 slots each; 0 chain diffs.

## Unknowns

- Which fleet L1 aliases dispatch the 16 alias chains no seat consumes.
