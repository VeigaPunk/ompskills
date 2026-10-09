# Chain graph — shared vertebrae and blast radius

Asked (lanes ChainGraphShape, DeadChainHops): cross-chain dependency shape.

## Observed (2026-10-09)

31 chains / 145 hop slots / 47 unique routes. Most-shared hops:
`devin/glm-5-3-flash-1m:low` (9 chains), `kimi-code/kimi-for-coding:high` (9,
terminal of 9), `kimi-code/kimi-for-coding-highspeed:low` (7, terminal of 7),
`alibaba/glm-5.2:max` (7), `openai-codex/gpt-5.6-sol:max` (7),
`openai-codex/gpt-5.6-luna:medium` (6), `devin/deepseek-v4-1-flash:max` (5),
`zai/glm-5.3:max` (5), `kimi-code/k3:max` (5), `google-antigravity/
claude-opus-5-5:high` (5 — dead lane).

Provider slot share: alibaba 30 (20.7%), codex 29, kimi 27, devin 26, zai 17,
google 7 (all dead), cursor 7, xai 2.

Terminal concentration: **kimi-code terminates 23/31 chains (74%)** on a
single active account — the load-bearing dependency. Watch kimi's 5h/monthly
counters first.

Blast radius: alibaba fails → `m_antigravity` and `google-…/gemini-3.8-flash`
lose their only non-terminal live hop (both already ride dead primaries);
`m_glm53`/`zai-glm-5.3:max` lose their alibaba terminal but keep zai/devin.
kimi fails → only `m_k3` and `kimi-code/k3:max` go fully dark; the other 21
kimi-terminating chains keep live pre-terminal hops. devin fails → live
`default` (devin/swe-2:max → devin-only chain) and `m_swe` have no live hop.

## Evidence

- Reports `ChainGraphShape.md`, `DeadChainHops.md` (47 distinct selectors,
  26 devin slots across 21 chains — M1's "devin twins absent" claim is STALE:
  `omp models devin` now serves 644 rows incl. the twins).

## Unknowns

- Liveness is catalog+usage inference, never probed by a live request.
