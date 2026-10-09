# m_strong chain verification (card smoke test)

Asked (CascadeKeeperVerify): which `m_strong` hops cannot serve today, which
hop first actually runs if the primary fails repeatedly, and whether the
google-antigravity hop costs an error or is skipped.

## Observed (2026-10-09, live evidence re-run)

**Chain** (`/home/vgpnk/.omp/agent/config.yml:70-79`; primary
`alibaba-token-plan/deepseek-v4.1-flash:max` at :7):

| # | hop | state today |
|---|-----|-------------|
| 1 | devin/deepseek-v4-1-flash:max | LIVE — devin weekly 56.0% used, resets 1d12h (was 16% ~18:54 UTC, now higher — quota meters move) |
| 2 | alibaba-token-plan/qwen3.8-max:xhigh | IMPAIRED — see below |
| 3 | alibaba-token-plan/deepseek-v4-pro:max | IMPAIRED |
| 4 | alibaba-token-plan/glm-5.2:max | IMPAIRED |
| 5 | openai-codex/gpt-5.6-sol:max | LIVE — 7d 1.0%, 2 saved resets |
| 6 | openai-codex/gpt-5.6-terra:max | LIVE — same account |
| 7 | zai/glm-5.3:max | LIVE — 5h 0/12K, weekly 1/60K |
| 8 | google-antigravity/claude-opus-5-5:high | DEAD — unauthenticated, `omp models google-antigravity` → `No models matching`, absent from `omp usage` |
| 9 | kimi-code/k3:max | LIVE — 1 healthy account (5h 0%, monthly 63.3%); second account disabled 1d7h ago invalid_grant, excluded by SQL |

**Alibaba detail:** all 3 API-key creds carry persisted
`auth_credential_blocks` (agent.db creds 9/10/11, empty scope, blocked_until
2026-10-11/23/28); `omp usage` shows `no usage data` on all three. Account
selection returns a blocked key when all are blocked (omp-runtime-walk entry,
`o.length` / all-blocked paths), so each alibaba hop is attempted and likely
burns one provider error — blocked-vs-stale unobservable without a request.

**Skip vs error for hop 8:** SKIP. Walker `#Z` `continue`s on missing model
or no API key (~L1030418-428 embedded source; prior strings:770001 read) —
the candidate header's "costs one provider error each" is wrong. Medium-high
confidence; still not dynamically probed.

**First hop that actually runs on repeated primary failure:** hop 1,
`devin/deepseek-v4-1-flash:max` — live and unimpaired. If the question means
"first hop guaranteed healthy after all impairments," that is hop 5
(`openai-codex/gpt-5.6-sol:max`), assuming hops 2-4 burn errors on the blocked
alibaba keys; hop 8 is skipped silently so it never delays hop 9.

## Evidence

- `grep m_strong -A 15 live config`; `read config.yml:70-82`
- `omp usage` (fresh run, fetched ~52s ago)
- `omp models google-antigravity` → `No models matching "google-antigravity"`
- `sqlite3 agent.db (ro) SELECT * FROM auth_credential_blocks` → 3 rows, all
  alibaba-token-plan:api_key

## Unknowns

- Whether alibaba blocks are stale or enforced (no request driven).
- Devin serving `deepseek-v4-1-flash` specifically assumed from catalog
  membership (devin 644 models), not per-model probed.
