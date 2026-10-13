# Effort-suffix survey — declared efforts vs every config route

Asked (lanes EffortSurvey, catalog lanes): does every `:effort` in the config
exist in the model's live catalog row? The M2 finding proved no gate checks
this.

## Observed (2026-10-09, `omp models --json` — 779 rows)

**0 mismatches.** Every suffixed route in both configs uses an effort its
model declares. `:minimal` appears nowhere (illegal under the ufo seat-grade
rule; omp's own ladder DOES include it).

Key declared lists: `alibaba/qwen3.8-max` [low,medium,xhigh] — `:xhigh` top,
no `:max`; `alibaba/deepseek-v4.1-flash` [high,max] (contextWindow null — the
1M claim is unverifiable from omp); `alibaba/qwen3.8-flash`
[minimal,low,medium,high]; `alibaba/deepseek-v4-pro` [high,max];
`alibaba/glm-5.2` [minimal..max]; `alibaba/glm-5.3` NO efforts (why it's absent
from all chains); `devin/swe-2` [medium,high,max] — **comment at host:167-168
is stale** (true only of swe-1-6/-fast, which declare none and carry
suffix-free routes); `devin/deepseek-v4-1-flash` [high,max],
`devin/glm-5-3-flash-1m` [low,high,max], `devin/kimi-k3` [low,high,max]
(context 1048576); `devin/glm-5-3-1m` […]; codex models all
[low,medium,high,xhigh,max]; `cursor/composer-2.5(-fast)` [minimal..high];
`cursor-grok-4.6` [low..xhigh]; `kimi-code/kimi-for-coding-highspeed`
[minimal,low,medium,high]; `k3` [low,high,max]; `zai/glm-5.3` [low,high,max];
`xai-oauth/grok-4.7` declares xhigh; `grok-4.6` [minimal..xhigh]. `grok-4.20`
exists in the catalog but is excluded from all routes per operator.

**Gate blindness (structural, still true):** `sync-global-routing.mjs:91,151`
`EFFORT_SUFFIXES` whitelist + `build.rs:105,442-447` — no catalog lookup.
Mutation test proved `qwen3.8-max:high` (undeclared) passes all gates. Only
the 14 seats are route-validated; omp roles, variants, and pool lanes are not
— `host/apply.mjs`'s wholeTableAudit covers legality, not catalog liveness.

## Evidence

- Reports `EffortSurvey.md`, `AlibabaCatalog.md`, `CursorCatalog.md`,
  `KimiCatalog.md`, `CodexCatalog.md`, `ZaiCatalog.md`, `XaiCatalog.md`,
  `CommsFindingsRecheck.md` (mutation test).

## Unknowns

- Wire acceptance of each effort not probed; zai tier gating of `glm-5.3:max`
  unverified; bare `devin/swe-2` effective effort at dispatch unverified.
