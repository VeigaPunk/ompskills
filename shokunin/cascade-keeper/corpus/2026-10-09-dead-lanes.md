# Dead lanes and silent dependencies

Asked (lanes DeadProviders, DeadChainHops, CursorQuotaLanes, SilentFailureModes):
which hops a chain can silently depend on that cannot serve.

## Observed (2026-10-09)

**7 of 145 hop slots are dead — all google-antigravity.** Provider
unauthenticated: absent from `omp usage`, `omp models google-antigravity` →
`No models matching`, `omp token google-antigravity --list` → none. Positions:
`m_strong` #8/9, `m_qwen38max` #6/7, `m_antigravity` hops 1-3 (its own primary
`gemini-3.8-flash:high` is dead too), concrete `google-antigravity/gemini-3.8-
flash:high` #1, concrete `alibaba-token-plan/qwen3.8-max:xhigh` #6. Selector
`google-antigravity/claude-opus-5-5:high` carries 5 of the 7 slots.

**Skip, not error.** Binary reads (`strings:770001-770003`): a hop with no API
key is `continue`d in the fallback walker before any request — contradicting
the candidate header's "cost one provider error each" (host config :46-47,
:298-299). Startup validation emits warnings for unknown providers (observed
for `m_sol`/`gpt-daybreak-blue-latest`) but zero antigravity warnings were
found in `~/.omp/logs` [INFERENCE: deferred discovery or stale logs].

**Cursor bucket split.** `Other Models` (api) is $400/$400 exhausted, but the
compiled `quotaTiers` maps `composer-2.5` exactly and `composer`/`grok` by
substring to the `auto` ("Cursor Models", 76.6%) tier — so
`composer-2.5(-fast):high` and `cursor-grok-4.6:high` are LIVE. The exhausted
bucket kills the other 71 catalog models, none referenced by any chain. Header
claim "the rest do not" (:163-165) is wrong for grok.

**Single-provider chains (no cross-provider escape):** `m_composer` (2 cursor
hops), `m_swe` + `devin/swe-2` (swe-1-6, swe-1-6-fast), `m_k3` +
`kimi-code/k3:max` (all kimi → fully dark if kimi fails), `m_sol` +
`openai-codex/gpt-6.1-sol:max`. kimi-code is the TERMINAL of 23/31 chains; the
live `default` resolves to `devin/swe-2:max` whose chain is devin-only.

**Impaired-but-live:** kimi-code (1 of 2 accounts disabled, invalid_grant —
excluded cleanly by `disabled_cause IS NULL`, costs no error); devin (weekly
16%, overage −$0.20 display-only); alibaba-token-plan (all 3 keys carry
`auth_credential_blocks` in agent.db — usage invisible, blocks may make every
alibaba hop burn a provider error; `selectByType` returns a blocked key anyway
when all are blocked).

## Evidence

- Reports `DeadProviders.md`, `DeadChainHops.md`, `CursorQuotaLanes.md`,
  `SilentFailureModes.md` (E2 credential store, E6 account selection, E7
  quotaTiers, E8 hop-liveness arithmetic).

## Unknowns

- Skip-vs-error for google hops unprobed dynamically.
- Whether the alibaba blocks are stale or live; true exhaustion unobservable.
- Whether ufo `routeChain` enforcement overrides omp's own walk.
