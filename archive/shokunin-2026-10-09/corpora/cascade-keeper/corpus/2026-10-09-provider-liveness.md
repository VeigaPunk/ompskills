# Provider liveness — omp usage grammar and the 2026-10-09 snapshot

Asked (lanes UsageOutputShape, DeadProviders, catalog lanes): the `omp usage`
output shape and each provider's auth/quota state.

## The grammar (observed)

Header `Usage · fetched <age> ago`. Per provider: `Display Name — N account(s)`.
Account rows: `● <identity>` (data present), `○ <label> — no usage data`,
`✗ <id> — disabled <age> ago: <reason> (re-login to restore)`. Meter rows: name,
28-cell bar, value (`% used` | `$x/$y` | `n/K credits`), `resets in Xd Yh`.
Per-provider `capacity: <window> → used/n account used (left× quota left)`.
openai-codex may show `✦ N saved resets · soonest expires in Nd (date)`.
Per-account `fetched Ns ago` toggles across runs (unexplained). `omp usage
--json` exposes `capacity`, `disabledCredentials` (with `disabledAtMs`), and
devin `metadata` (`planEnd`, `overageBalanceUsd`).

## Snapshot 2026-10-09 ~18:54 UTC (re-derive; do not reuse)

| provider | accounts | state |
|---|---|---|
| alibaba-token-plan | 3 API-key | all `○ no usage data` — quota invisible; agent.db shows `auth_credential_blocks` on creds 9/10/11 until Oct 11/23/28 — invisible ≠ healthy |
| cursor | 1 | Cursor Models (auto) 76.6%, resets 9d1h; Other Models (api) $400/$400 100% — but see quotaTiers in dead-lanes entry: composer/grok ride auto |
| devin | 2 | Max weekly 16%, resets ~1d13h; overage −$0.20 (display-only, no gate consumer); second row `app.devin.ai` no usage data |
| kimi-code | 1 live + 1 disabled | active acct 5h 0%, monthly 63.3%/48.5%; `d9e1…` disabled 1d6h ago, invalid_grant — excluded from pool by SQL, costs nothing |
| openai-codex | 1 | pro/daybreak, 7d 1.0%, 2 saved resets (expire 2026-10-29) — healthiest lane |
| xai-oauth | 1 | SuperGrok Weekly 0.0% |
| zai | 1 | pro, 5h 0/12K, weekly 1/60K — full headroom |
| google-antigravity | — | absent from `omp usage` AND `omp models` — unauthenticated |

`omp models --json` → 779 models: alibaba 11, cursor 81, devin 644, kimi-code 7,
openai-codex 8, xai-oauth 10, zai 18.

## Evidence

- Reports `UsageOutputShape.md`, `DeadProviders.md`, `CommsFindingsRecheck.md`
  (catalog counts + sha256 `1ef7b233` of live config), `SilentFailureModes.md`
  E1-E3 (agent.db blocks, `omp token --list`).

## Unknowns

- Alibaba true quota state — no usage data AND persisted blocks; whether blocks
  are stale or live is unobserved.
- Devin negative-overage server behavior unobserved.
- The second "devin account" in usage vs single credential row — unresolved.
