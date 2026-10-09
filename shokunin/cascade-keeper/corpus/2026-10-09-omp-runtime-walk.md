# omp runtime walk — gates, snapping, suppression

Asked (lane OmpRetrySemantics): how omp itself walks `retry.fallbackChains` —
from the bundled JS in `/home/vgpnk/.local/bin/omp` (v18.8.7). Line numbers are
`strings` extraction offsets.

## Observed

**Walk trigger — two gates, not "any error".** Gate A `isRetryableError`
(L1029969): stopReason=error, not preflight/context-overflow, classifies as
Transient | UsageLimit | ThinkingLoop | StaleResponsesItem |
ProviderFinishError | EmptyResponse | AccountPolicy | classifier refusal.
Gate B `isHardErrorFallbackEligible` (L1030472, else-if): ANY
stopReason=error except preflight/refusal/abort/committed/context-overflow/
Anthropic-400 — **AuthFailed is NOT excluded**, auth errors walk via Gate B.
Requires `retry.enabled && retry.modelFallback` (live: true/true). Walker
suppressions: ThinkingLoop never walks; codex ICe never; fitting
credential-reset wait suppresses; same-model retry for first-attempt stream
errors.

**Hop effort.** `applyRetryFallbackCandidate` (L1030337): hop suffix (else
session level) → clamped by session ceiling `pF` → snapped to the hop model's
declared list `bd` (undeclared suffix snaps DOWN; effort-less model → no
effort). Consequence: a stale suffix degrades silently rather than erroring.

**Unauthenticated hop: silent skip.** Walker `#Z` continues on missing model
or no API key (L~1030418-428); `getApiKey` undefined for `disabledProviders`
and no-key-source providers. Throws only on bypass paths. Startup
`validateRetryFallbackChains` (L1030102) warns, doesn't error, and defers
while discovery is pending.

**Quota is reactive.** `retry.usageAwareFallback` defaults false; live config
doesn't set it — quota never pre-filters. After a UsageLimit error the failing
selector is suppressed 30 min (`EKn`; RATE 30s, CONCURRENT 5s, CAPACITY
45-75s, SERVER 20s, unknown 5min). Suppression is a per-process in-memory Map.
Revert policy `cooldown-expiry` (live): primary restored after cooldown.
Other knobs (live): `maxRetries` 10, `baseDelayMs` 500, `maxDelayMs` 300000.

**Account selection.** Disabled creds excluded by `disabled_cause IS NULL`.
Single-account providers keep sending even when blocked (`if (o.length===1)
return o[0]`). Multi-account all-blocked: still returns a candidate — blocked
keys are never withheld. Alibaba's `VMs` strategy exposes no
`healableBlockScopes` → persisted blocks ride out to `blocked_until`.

## Evidence

- Report `OmpRetrySemantics.md` (full offset table, ~60 cited offsets);
  `SilentFailureModes.md` E5-E6.
- `omp config get retry.{enabled,maxRetries,baseDelayMs,maxDelayMs,
  usageAwareFallback,fallbackRevertPolicy}` → `true,10,500,300000,false,
  cooldown-expiry`.

## Unknowns

- No live request driven — all from embedded source; Gate A/B interplay under
  unusual classifier combos is medium confidence.
- `#re` revert beyond first 25 lines unread; kimi rotation-to-healthy-account
  unverified.
