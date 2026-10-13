# policy-floor — `loadPolicy` and the "only tighten" meet

Asked: `readPolicyFile`, `POLICY_NUMERIC_KEYS`, `policyMeet`, `CONFIG_PATH`, and the
trusted-caller boundary. Anchor: `ufo-fsd-alpha@5ace2559`; `scripts/primeagent-refinement-ledger.mjs` sha256 `ae69c40c7e774161812bbed3b34964978bb2d204b8daf19721ab5dd54e145096`; `config/primeagent-assimilation.json` sha256 `d6348cabfcbf3e8195e8335eb1dd3578681f644770f10dd3efdc21dc58439674`. Source: `reports/ledger-keeper/<Lane>.md` (mission round 1, wave `ledger-keeper-r1-w1`). Lane: `PolicyFloor`.

Observed:
- `readPolicyFile` (:157-197) reads **`raw.ledger` only**; 7 ordered plain-Error refusals
  (`${label} policy unreadable/missing ledger section`, `policy missing ledger.${key}`,
  `policy invalid: ledger.${key} must be a non-negative integer`, kinds non-empty, secretPatterns array,
  `pattern does not compile`).
- `POLICY_NUMERIC_KEYS` (:140-148) = maxEntries,maxEntryBytes,maxTitleChars,maxBodyChars,maxEvidenceRefs,maxTotalBytes,maxEvidenceRefChars.
- `policyMeet(canonical, supplied)` (:219-227): numeric `Math.min`; `kinds` = canonical order ∩ supplied (empty fails closed);
  `secretPatterns` = `new Set([...canonical, ...supplied])` (union); other keys spread from canonical.
- `CONFIG_PATH` (:112-114) = the script's own checkout config (identity-pinned by `import.meta.url`); `loadPolicy` (:229-233)
  always re-reads it as `canonical`, so a hostile `secretPatterns: []`/raised caps config yields the canonical floor
  (executed: 11 patterns, maxEntries 64, maxBodyChars 3000).
- `loadPolicy`-routed: CLI `runCli` :1457, `ufo-refinement-context.mjs:91`, package `configPath` :339.
  Direct exports (validateEntryShape :306, validateLedger :368, appendEntry :613, readForSuccessor :726,
  pruneArchiveGenerations :906, listArchiveGenerations :992, readArchiveDigests :1047, successorReset :1113,
  pruneLedger :1241) take the caller `policy` **unchanged** (F10/r21 trusted-caller contract :203-217).
- `$schema`, `description`, `invariants` are not validated; the `hook` section is not read by the ledger module.

Changed: nothing. Unknowns: the trusted-caller doc lists six names and omits the three archive exports (stale).

Report: `reports/ledger-keeper/PolicyFloor.md`.
