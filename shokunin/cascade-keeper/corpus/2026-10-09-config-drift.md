# Config drift — candidate vs live, and stale header claims

Asked (all lanes cross-checked): divergences between `host/omp-agent.config.yml`
(candidate) and `~/.omp/agent/config.yml` (live), plus claims the candidate
comments make that evidence contradicts.

## Observed (2026-10-09)

**One content divergence.** `modelRoles.default`: live `devin/swe-2:max`
(live :22) vs candidate `openai-codex/gpt-5.6-luna:medium` (candidate :111).
All 31 chains, all other modelRoles, and agentModelOverrides are
byte-identical (comments stripped in live; live also lacks quoting on keys).
Live sha256 `1ef7b233…`, 220 lines, 7443 bytes, mtime 2026-10-09 15:21.

Consequence: live `default` resolves by base-match to the `devin/swe-2` chain
key (hops swe-1-6, swe-1-6-fast — devin-only, no cross-provider escape). The
`default` alias chain (luna-first, 4 cross-provider hops) is unreachable for
the live primary under omp runtime precedence (concrete key beats role); under
the ufo resolver the `default` chain would win if `default` were a seat alias
— it is not.

**Stale candidate header claims:**
- `host:33` "twenty-nine chains" — 31 keys (145 hops) in both files.
- `host:41-43` pool list omits `xai-oauth` (authenticated, 10 catalog rows,
  2 chain first-hops) and understates devin (644 rows, authenticated).
- `host:46-47`/`:298-299` "google-antigravity hops cost one provider error
  each" — binary says keyless hops are skipped silently (see dead-lanes).
- `host:163-165` "cursor rest do not [stay reachable]" — cursor-grok rides the
  auto tier per quotaTiers; zero chain hops ride the exhausted bucket.
- `host:167-168` "devin-agent family declares no efforts" — true of swe-1-6/
  -fast only; swe-2 declares medium,high,max.
- `host:54-55` "kimi-code only as terminal fallback hop" — it is also the
  `m_k3` primary and non-terminal inside `m_k3`/`kimi-code/k3:max`.
- `host:126` attributes deepseek-v4.1-flash 1M context to the kimi catalog —
  kimi-code has zero deepseek rows; omp's own row is contextWindow null.

## Evidence

- Reports `ModelRolesTable.md`, `ChainsRoleKeys.md`, `ChainGraphShape.md`,
  `EffortSurvey.md`, `KimiCatalog.md`, `SilentFailureModes.md`, host-smith
  corpus `2026-10-09-live-config-drift.md` (agrees: one behavioral diff).

## Unknowns

- Whether `default`'s divergence is intentional operator state or pending
  apply drift — outside this domain (host-smith owns apply state).
