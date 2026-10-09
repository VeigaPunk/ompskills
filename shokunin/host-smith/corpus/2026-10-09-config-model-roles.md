# host/omp-agent.config.yml — modelRoles

**Asked.** The candidate's route table.

**Observed.** `host/omp-agent.config.yml` (492 lines; `modelRoles:` at 104,
`task:` at 187).

- **omp role selectors:** `default` L111 `openai-codex/gpt-5.6-luna:medium`,
  `smol` L115 `alibaba-token-plan/qwen3.8-flash:high`, `slow` L118
  `alibaba-token-plan/deepseek-v4-pro:max`, `plan` L121
  `alibaba-token-plan/deepseek-v4.1-flash:max`.
- **ufo buckets:** `m_strong` L129 `alibaba-token-plan/deepseek-v4.1-flash:max`,
  `m_mid` L139 `alibaba-token-plan/qwen3.8-flash:high`, `m_fast` L141
  `alibaba-token-plan/deepseek-v4.1-flash:max`.
- **Effort variants** (no seat pins them; the L1 selects one per
  mission/round/wave): `m_mid_med` L148, `m_mid_low` L149, `m_fast_high` L152.
  No `m_strong_*` variant (comment L91–93).
- **Named lanes:** `m_qwen38max` L136 `alibaba-token-plan/qwen3.8-max:xhigh`,
  `m_luna` L157 `openai-codex/gpt-5.6-luna:medium`, `m_antigravity` L162
  `google-antigravity/gemini-3.8-flash:high`, `m_composer` L166
  `cursor/composer-2.5:high`, `m_swe` L175 `devin/swe-2`, `m_k3` L178
  `kimi-code/k3:max`, `m_sol` L179 `openai-codex/gpt-6.1-sol:max`, `m_glm53`
  L180 `zai/glm-5.3:max`, `m_grok` L185 `xai-oauth/grok-4.7:xhigh`.
- **Quota rationale:** the `default` route favors codex (~99% headroom) over the
  scarce token-plan quota; `plan` reuses the flash route; `m_strong` is routed to
  `deepseek-v4.1-flash`; `smol` is the cheap flash lane (qwen3.6-flash out of
  pool).

**Verified.** Dry run enumerates exactly these; sha256
`15b40185…b5c9`.

**Unknowns.** The deepseek-v4.1-flash 1M-context declaration is unverifiable
from omp's live catalog (file note L125–128); the ~99% headroom figure is not
independently re-measured.

**Added.** 2026-10-09 · lane `ConfigModelRoles` (scout)