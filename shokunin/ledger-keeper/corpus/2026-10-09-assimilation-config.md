# assimilation-config — the canonical policy floor file

Asked: every key/value, the invariants + enforcement sites, how bounds are consumed, the "only tighten"
rule, and the unreadable-canonical case. Anchor: `ufo-fsd-alpha@5ace2559`. Source: `reports/ledger-keeper/<Lane>.md` (mission round 1, wave `ledger-keeper-r1-w1`). Lane: `AssimilationConfig`.

Observed:
- Top-level keys (5): `$schema`, `description`, `ledger`, `hook`, `invariants`.
- `ledger` (10 keys): schema `ufo-refinement-ledger-v1`; kinds (5); maxEntries 64, maxEntryBytes 4096, maxTitleChars 120,
  maxBodyChars 3000, maxEvidenceRefs 8, maxTotalBytes 65536, maxEvidenceRefChars 200; **secretPatterns = 11**.
- `hook` (6 keys): statusKey `pa-ledger`, digestMaxEntries 16, digestMaxBytes 1024, ringCapacity 32, ringMaxBytes 16384;
  its `description` still names the pre-SUB-7 `.ufo/scopes/nc5-primeagent/hook-loads/` path — **stale** vs the scope-bound hook.
- `invariants` = **10** entries (:25-34), not 11; each mapped to a source call site (state-not-engine is an absence claim).
- `loadPolicy` reads `raw.ledger` only and meets the canonical file: numeric min, kinds intersection, secretPatterns union
  (hostile config `secretPatterns: []`+raised caps → 11 patterns, 64/3000). `loadHookConfig`/`canonicalHookCaps`/`loadDigestCaps`
  meet the canonical hook caps and **degrade to hard defaults** when the canonical file is missing/malformed (never throw).
- `loadPolicy` on a missing/malformed canonical is a **typed refusal** (CLI exit 2 `refused: …`), never a silent weakening.

Changed: nothing. Unknowns: whether the mission's "11 invariants" intends a future addition or miscounts (secretPatterns = 11).

Report: `reports/ledger-keeper/AssimilationConfig.md`.
