# digest-test-suite — what the 23-case digest suite pins

Asked: the harness, pinned facts, gaps, and doc drift. Anchor: `ufo-fsd-alpha@5ace2559`; `scripts/primeagent-refinement-ledger.mjs` sha256 `ae69c40c7e774161812bbed3b34964978bb2d204b8daf19721ab5dd54e145096`. Source: `reports/ledger-keeper/<Lane>.md` (mission round 1, wave `ledger-keeper-r1-w1`). Lane: `DigestTestSuite` (reviewer).
Live: `node --test tests/primeagent-refinement-digest.test.js` → 23/23 pass, exit 0 (run in a scratch copy with a workspace symlink).

Observed:
- Pins: sanitization (control/bidi/separator collapse, truncation); five-arm classifier coverage; projection cap with total/overflow
  markers + untrusted tag + 1024/256 byte budgets; exact titles-only child digest with deep-equal entries + store-byte identity;
  writer role; caller-parent binding + `parent-mismatch`; foreign/unbound refusals; tamper `chain-invalid` vs garbage `no-ledger-state`;
  chain-valid foreign-writer coherence refusal; parseable non-object roots typed never-throw; wrong-schema empty store as `chain-invalid`;
  `ledgerModuleUrl` pre-import containment with canary proofs; packed-seat `unavailable` + own-checkout fallback; six-arm `options-invalid`
  + tighter-cap; newline-title single-line display; `DIGEST_CAPS_DEFAULTS` 16/1024; r19 `loadDigestCaps` floor + symlinked-scripts realpath anchor;
  SUB-7 session-shape guard + no-path/no-scope typed `no-ledger-state`.
- Not pinned: `digest.bytes` field, hook intake surface, CLI verbs, bodies-v1 allowlist, archive roll-up, atomic-write/concurrency,
  wave-context and recovery consumers, exact display format.
- Doc drift: doc:287 claims "12 focused probes" while its own enumeration lists 13 and the file has 23 `test()` cases; the adjacent
  "57/57 aggregate" is stale (current primeagent probe total ~198).

Changed: nothing. Unknowns: pre-squash r03 probe count unrecoverable; `digest.bytes` may be pinned by a sibling suite.

Report: `reports/ledger-keeper/DigestTestSuite.md`.
