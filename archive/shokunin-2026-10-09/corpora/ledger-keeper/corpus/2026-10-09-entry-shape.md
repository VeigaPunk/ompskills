# entry-shape — `validateEntryShape` contract

Asked: the per-entry validator — return union, ordered checks, reason strings, bounds, and the
joint `title+body` screen. Anchor: `ufo-fsd-alpha@5ace2559`; `scripts/primeagent-refinement-ledger.mjs` sha256 `ae69c40c7e774161812bbed3b34964978bb2d204b8daf19721ab5dd54e145096`; `config/primeagent-assimilation.json` sha256 `d6348cabfcbf3e8195e8335eb1dd3578681f644770f10dd3efdc21dc58439674`. Source: `reports/ledger-keeper/<Lane>.md` (mission round 1, wave `ledger-keeper-r1-w1`). Lane: `EntryShape`.

Observed (`validateEntryShape(input, policy, allowedKeys = INPUT_ENTRY_KEYS)` :306):
- Returns `{ok:true, entry}` (:357) or `{ok:false, reason}`; 14 sequential checks, first failure wins.
  Order/refusals: object (:307) → unknown-key count (:308) → kind∈policy.kinds (:311) →
  title≤maxTitleChars (:314) → body≤maxBodyChars (:317) → axis null-or-≤64 hard-coded (:320) →
  createdByRun non-empty ≤128 hard-coded (:323) → canonical-UTC createdAt (:326) →
  evidence array ≤maxEvidenceRefs (:329) → each ref ≤maxEvidenceRefChars (:332) → secret screen (:345) →
  `Buffer.byteLength(canonical(entry))≤maxEntryBytes` (:353).
- Bounds are read by the validator: maxTitleChars (title.length, UTF-16 units), maxBodyChars,
  maxEvidenceRefs, maxEvidenceRefChars, maxEntryBytes; **not** maxEntries/maxTotalBytes (store-level, `validateLedger` :390/:451).
- Screen values (:346): `[body, title, \`${title}${body}\`, createdByRun, createdAt, axis?, ...evidence]`;
  `firstSecretHit` :260-268 strips `\p{Cf}` then pattern-major.
- Returned `entry` (:352) drops `mission` (input-only) and carries no seq/sha256; `appendEntry` reads
  `input?.mission` separately (:638) and binds genesis lineage (:652-656).

Changed: nothing. Unknowns: intent behind "chars" (code enforces UTF-16 `.length`); no in-file grapheme spec.

Report: `reports/ledger-keeper/EntryShape.md`.
