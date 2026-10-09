# r2-corrections — round-2 falsification ledger

Asked: round 2 re-derived the round-1 card and corpus claims from the source
(18 lanes, wave `ledger-keeper-r2-w1`, reports in `reports/ledger-keeper-r2/`).
This entry records every corrected claim with its verifier. The corpus is
append-only, so the corrected entries themselves are left untouched.

Anchor: `ufo-fsd-alpha@5ace2559`; re-hashed by the lanes —
`scripts/primeagent-refinement-ledger.mjs` `ae69c40c7e774161…`,
`config/primeagent-assimilation.json` `d6348cabfcbf3e81…`,
`packages/substrate-runtime/src/primeagent-refinement.mjs` `725cfc537c421474…`,
`.omp/hooks/pre/primeagent-assimilation.js` `7247f8b0ec3d2b38…` (all four match
the seeded corpus anchors; no substrate drift).

## Corrections (REFUTE → corrected wording)

| # | corrected claim | verifier | evidence |
| --- | --- | --- | --- |
| 1 | `2026-10-09-runtime-digest-api.md` says "`display` always ends `[untrusted data]`". Corrected: **child** displays end with the tag; the **writer** success path bypasses the formatter and returns an untagged `pa-ledger writer · N entries`. | `VerifyDigestApi` | `primeagent-refinement.mjs:103-120` (child, tagged) vs `:393-405` (writer, untagged); the `.d.mts:50-51` comment claims otherwise — a declaration defect, not a runtime one. |
| 2 | `2026-10-09-doc-history.md` cites the stale `nc5-primeagent` ring path at `config/…json:26`. Corrected anchor: **line 17** (`hook.description`). | `VerifyDocDrift` | fresh read of the re-hashed config: lines 16-22 are the hook block; line 17 carries the stale path. |
| 3 | `2026-10-09-runtime-recovery-api.md` lists `continueEvidence` among the optional options but does not say what it gates. Clarified: it is **optional**; it is required only to admit `continuation-observed`. | `VerifyRecoveryApi` | `primeagent-refinement.mjs:521-530` (validated only when defined), `:576` (JSDoc optional), `.d.mts:137-144` (`continueEvidence?:`). |
| 4 | `2026-10-09-ledger-validate.md` carries neither a "what changed" nor a "what remains unknown" element. | `VerifyCardContract` | label scan over all 31 entries; the append-only *shape* holds 31/31, the four-element *content* clause holds 28/31. |
| 5 | `2026-10-09-append-semantics.md` carries no "what remains unknown" element. | `VerifyCardContract` | same scan. |
| 6 | `2026-10-09-chain-integrity.md` labels its unknowns "Residual limits" (substance present, label differs). | `VerifyCardContract` | same scan. |

Card-side fixes applied by the L1 (the card is not append-only): the hook bullet's
"ring-only roles" phrasing (mismatch/override-refused/unresolved also emit refusal
statuses — they are hook-only roles outside the five-value classifier); the
recovery provenance wording ("every explicit return", not "every result"); the
`continueEvidence` optionality; and the traps list moved under
`## The specialization` with the `:17` anchor and the 105-vs-87/99 count.

## New findings (not corrections)

- Timestamp rejection list is non-exhaustive: `2026-10-09T24:00:00.000Z` (hour 24)
  and `…T00:00:60.000Z` (second 60) are regex-admitted but round-trip-rejected
  (exit 2) — two more cases for the mechanism already recorded in
  `2026-10-09-timestamp-canonical.md`. Verifier: `VerifyChain`.
- `prune` re-anchor independently re-derived: retained seqs keep their values,
  the first retained hash equals `entryDigest(this, GENESIS)`, no pre-prune hash
  survives. Verifier: `VerifyChain`.
- The canonical serializer was independently replicated (string-sorted keys,
  `{a:{}}` and `{a:undefined}`→`{a:null}` digests match). Verifier: `VerifyChain`.

## Confirm tally

14 of 18 lanes returned CONFIRM-only (Store, Bounds, Floor, Screening, Chain,
Timestamp, Successor, Reset, Archive, Cli, Status, TestCounts, WaveContext,
DocDrift-with-anchor-correction). 4 lanes returned a REFUTE: RecoveryApi (#3),
Hook (card wording — fixed), DigestApi (#1), CardContract (#4-#6). No lane found
an invented contract in the card, and no lane found a wrong runtime claim.

## Unknowns

- Append-only is unverifiable from history: the card and corpus were untracked
  during round 2, so no commit history proves no row/entry was rewritten.
- The index row and its entry file are written in two steps (non-atomic); a crash
  between them would leave a row without a file. Observed mid-run by
  `VerifyCardContract`; final state consistent.
- `VerifyTestCounts` reported "current substrate hashes differ from the round-1
  corpus anchor" — the four anchored source files were re-hashed by the L1 and
  match exactly; the note is about test-file hashes the corpus never anchored.

Report: `reports/ledger-keeper-r2/` (18 lane reports).