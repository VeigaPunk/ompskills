# host/omp-agent.config.yml — retry.fallbackChains

**Asked.** The chain table's key forms and rules.

**Observed.** `host/omp-agent.config.yml`: **31 chains** — 19 alias-form keys +
12 concrete-selector keys.

- **Alias forms:** role names (`default:247`, `smol:258`, `slow:272`, `plan:285`);
  seat-bucket aliases (`m_strong:301`, `m_qwen38max:314`, `m_mid:323`,
  `m_fast:332`); effort variants (`m_mid_med:354`, `m_mid_low:361`,
  `m_fast_high:370`); pool lanes (`m_luna:341`, `m_antigravity:382`,
  `m_composer:388`, `m_swe:391`, `m_k3:394`, `m_sol:398`, `m_glm53:403`,
  `m_grok:413`).
- **Seat chains:** `m_strong` 9 hops, `m_mid` 6, `m_fast` 6; `m_qwen38max` 7
  (no seat consumes it).
- **Concrete keys** (byte-identical to a distinct non-variant `modelRoles`
  value): lines 430/435/441/446/452/456/459/462/466/470/476/481.
- **Bare-distinct / no-wrap rule** (`build.rs:493-508 validate_chain`,
  `omp-global-config.mjs:7-10`, `apply.mjs:462-477 wholeTableAudit`, header
  L32–36): a chain never wraps its own primary or repeats a bare model at another
  effort.
- **Dead-weight rule** (header L19–21; `readGlobalSeatRouting:581-587`): every
  chain key must be a `modelRoles` key, a `modelRoles` value, or a resolved seat
  route.

**Verified.** Dry run: `19 modelRoles, 31 fallbackChains, 14 seats`; `m_strong
chain 9 hop(s)`, m_mid 6, m_fast 6; `164 routes … splitRoute-legal`; `107
primary+hop routes, pairwise-distinct bare models`.

**Doc-defects found (prose only; no gate reads them).**

- Header L33 says "all twenty-nine chains"; actual = **31**.
- Header L425–428 says "Four aliases (default, plan, m_strong and m_fast) share
  the deepseek-v4.1-flash:max value"; actual `default` is
  `openai-codex/gpt-5.6-luna:medium` (L111), so only **three** share it.
- L72 "one chain per route, no duplicates" — distinct alias keys *do* share route
  values; the parser rejects duplicate **keys** only.
- L125 says the qwen3.8-max lane "leads its cascade", but m_strong's first hop is
  `devin/deepseek-v4-1-flash:max` (302); qwen3.8-max:xhigh is hop 2 (303).

**Added.** 2026-10-09 · lane `ConfigFallbackChains` (critic)