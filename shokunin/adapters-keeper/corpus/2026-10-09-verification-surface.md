# verification-surface — what checks packages/ and how

Asked: everything that tests or validates packages/.
Source: lane PkgTests (`reports/adapters-keeper/PkgTests.md`).

## Observed

- **Byte-verified** by `sync-ufo-contracts.mjs --check`: skill mirrors, wwkd/directive
  dep mirrors, agents/ mirrors (omp,kimi,cursor,devin only), scope tags (5 slots).
  `contracts:check` (package.json:26) is the **only** battery path that byte-checks
  adapter content.
- **Structurally checked only**: packages/* set membership (check-hand-authored-sets —
  existence/tracking, not contents); substrate-lib schemas are read by Rust only.
- **Package-level npm tests exist but no gate runs them**: ufo-core (8 src test files —
  119/119 pass in scratch), contract-support (2 files, 10/10), substrate-runtime test/
  (6 files, 24/24 with workspace links). Zero tests under substrate-lib, substrate-omp,
  or the six adapter dirs. `gates.sh` has no `npm test` call.
- Root `tests/*.test.js`: 1338 tests / 1255 pass / 83 fail in scratch — dominated by
  `m_strong` alias absent from global OMP config (47 log hits); environment, not
  packages regression.
- `sync --check` red in scratch on surfaceDigest (declared sha256:666cd0a1… vs computed
  sha256:88849…) — the 18 missing `.devin` mirrors were a write-then-check ordering
  effect that converges on recheck.

## Contract

Verification split: **content** correctness = contracts:check byte gate;
**membership** = check-hand-authored-sets; **package code** = un-gated npm tests you
must invoke deliberately.

## Unknowns

- Whether the surfaceDigest mismatch is sole remaining sync failure (re-check in fresh
  scratch advised).
- Whether codex/grok/opencode should have agents mirrors (no agentTargets entry — a
  policy gap, not a check failure).
