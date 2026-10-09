# persistence-invariants — the five durable-store guarantees and their enforcement points

Asked: list the refinement ledger's persistence invariants — bounds, shape validation, chain,
credential screening, parent-scoping — each cited into
`ufo-fsd-alpha/scripts/primeagent-refinement-ledger.mjs`. Card-side consolidation of seeded lanes
(store-schema, entry-shape, ledger-validate, policy-floor, chain-integrity, secret-screening,
append-semantics, atomic-write) with every line anchor re-verified by grep against
`ufo-fsd-alpha@5ace2559` (module sha256 `ae69c40c7e774161812bbed3b34964978bb2d204b8daf19721ab5dd54e145096` —
re-hashed, matches). Canonical caps verified against `config/primeagent-assimilation.json`
(sha256 `d6348cabfcbf3e81…`): maxEntries 64, maxEntryBytes 4096, maxTitleChars 120, maxBodyChars 3000,
maxEvidenceRefs 8, maxTotalBytes 65536, maxEvidenceRefChars 200; 11 secretPatterns; 10 invariants.

Observed (enforcement points, fresh line anchors):

**1. Bounds (policy-capped, floor-meet).**
- Cap roster: `POLICY_NUMERIC_KEYS` :140-148 (7 keys); shape-checked non-negative-integer in
  `readPolicyFile` :167-176 plus kinds/secretPatterns array checks :177-186.
- Per-entry caps in `validateEntryShape` (:306): kind ∈ policy.kinds :311-313; title ≤ maxTitleChars
  :314-316; body ≤ maxBodyChars :317-319; axis ≤ 64 :320-322; createdByRun ≤ 128 :323-325;
  canonical-UTC createdAt :326-328 (`isCanonicalUtcTimestamp` :248-251, `CANONICAL_UTC_RE` :246);
  evidence ≤ maxEvidenceRefs, each ref ≤ maxEvidenceRefChars :329-336; canonical 8-field byte cap
  ≤ maxEntryBytes :353-356 (measured WITHOUT seq/sha256).
- Store caps in `validateLedger` :390-392 (entry count ≤ maxEntries) and :408/:451-453
  (running total ≤ maxTotalBytes, measured WITH seq/sha256 — the two byte caps measure different forms).
- Floor: `loadPolicy` :229-233 meets canonical × supplied via `policyMeet` :213-224
  (numeric Math.min, kinds intersection — empty fails closed :218, secretPatterns union :219-220).
  Trusted-caller boundary documented :197-211: exported functions take caller policy unchanged.
  CLI routes everything through the floor: `runCli` `const policy = loadPolicy(flags.config)` :1457.
- Read-projection cap at the store layer: `SUCCESSOR_MAX_ENTRIES = 16` :719, applied
  `slice(-SUCCESSOR_MAX_ENTRIES)` :738 in `readForSuccessor`; conditional `omitted` key :744-749.

**2. Shape validation (closed key sets, ordered checks, double validation).**
- Key sets: `INPUT_ENTRY_KEYS` (8) :292, `STORED_ENTRY_KEYS` (9) :293, `STORE_KEYS` (7) :294,
  `STORE_VERSION = 1` :295; `unknownKeyCount` :297-298; count-only refusals :309 and :373
  (key NAMES never echoed). Refusal strings verified verbatim.
- `validateEntryShape` ordered checks :307-357 (object :307; unknown keys :308-309; kind :311;
  title :314; body :317; axis :320; createdByRun :323; createdAt :326; evidence :329-336;
  screen :345-351; byte cap :354). `validateLedger` ordered checks :369-392 (object/schema/version
  :369-371; store unknown keys :372-373; entries array :374; parentMissionId ≤128 :375-377;
  parentSessionId ≤128 :384-386; non-empty canonical createdAt :387-389; maxEntries :390-392),
  per-entry re-shape with STORED keys :396-398, seq unique-positive-int :399-402, chain :403-406,
  byte accumulation :408.
- Genesis/empty dual :422-425 (all four lineage fields must be null on an empty store);
  writer-coherence :426-434 (non-empty store: parentRunId non-empty ≤128 AND every entry's
  createdByRun === parentRunId, refusal :432).
- Double validation before persistence: `appendEntry` builds candidate then `validateLedger`
  :677-679 before `writeLedgerAtomic` :680; `pruneLedger` same :1290-1293.
- Read-side root screens in `readLedger` :457-495: `O_RDONLY|O_NOFOLLOW` open :468; ELOOP →
  "ledger path is a symlink" :471; fstat regular-file gate :476-477; non-object JSON root :485-486;
  invalid JSON :490. ENOENT → `emptyLedger()` :470 (`emptyLedger` :360-362).

**3. Chain (sha256 over canonical bytes, array-order linked, unkeyed).**
- `canonical()` :269-275: key-sorted objects (UTF-16 default sort), arrays order-preserved,
  `undefined`/`null` → null via `JSON.stringify(value ?? null)` :275.
- `entryDigest(entry, prev)` :278-281: sha256 hex of `(prev ?? "GENESIS") + "\n" + canonical(entry sans sha256)`
  (destructure-omit :279-280). Genesis anchor: append prev = null on empty store :675.
- Verify loop threads `prev` in ARRAY order :393/:403-407; seq is checked separately (:399-402),
  chain order is not seq order. Tamper refusal :405 "sha256 chain broken at seq".
- Prune re-anchor: retained tail re-signed from GENESIS, `let prev = null` :1273, map :1274-1279 —
  pruned history unrecoverable by design.
- Unkeyed, no out-of-band head: top-level lineage is NOT chain-covered (comment :378-383), which is
  why lineage gets a read-side screen (:444-449). Residual: a whole-store rewrite + re-sign re-validates
  (see chain-integrity entry).
- Durable-write substrate `writeLedgerAtomic` :514-555: mode-0700 dir :515, unpredictable
  `<path>.<pid>.<uuid>.tmp` :516, `O_WRONLY|O_CREAT|O_EXCL|O_NOFOLLOW` 0o600 :520, write through the
  owned fd, `lstatSync` regular-file gate before rename :530-537 (`renameSync` :538), own-tmp cleanup
  stands down after rename or detected swap :544-554. No fsync anywhere — process-crash atomicity,
  not power-loss durability.

**4. Credential screening (pattern-major, one pass, both sides).**
- `firstSecretHit` :260-266: strips `\p{Cf}` format chars :261, pattern-major over
  policy.secretPatterns (policy order, case-sensitive, `u` flag), returns the first matching PATTERN
  (deterministic naming; value never quoted).
- Write side, per entry: `body, title, `${title}${body}`` (joint, SUB-7 item 3), `createdByRun`,
  `createdAt`, `axis` (non-null), each evidence ref — one call :345-350.
- Write side, lineage params: session :624-630, mission :637-646 (both shape-bounded ≤128 and screened).
- Read side: top-level lineage re-screen `parentSessionId/parentMissionId/createdAt` :444-449 —
  every read path gates on `validateLedger`, so both digest shapes are credential-free by construction.
  parentRunId provably cannot fire (:440-443, simplifier r20 207-case probe) because writer-coherence
  + per-entry screen already cover it.
- Floor can only GROW screening: secretPatterns union :219-220; canonical config carries 11 patterns
  (verified in config file).

**5. Parent-scoping (one writer runId per generation, receipt-bound reads).**
- Genesis founds all four lineage fields from the entry :652-656; non-genesis appends: run mismatch
  refuses :657-658 ("parent-scoped to run"); session-rebind strictness :667-672 (bound session refuses
  a differing one :668; session-free store refuses a late bind :671); mission re-confirm only,
  differing refuses :647-650.
- Read-side coherence :426-434 (above). Receipt-bound generation gate `readValidatedGeneration`
  :691-712: validate BEFORE the empty check :697-701, "no ledger state" :694-695/:702-703,
  parentRunId === expectedParentRun else "identity binding refused" :705-709. Consumed by
  `readForSuccessor` :726-728 and `successorReset` :1113-1115.
- Mutating verbs identity-bound: `pruneLedger` :1241-1264 (non-empty store REQUIRES
  --expect-parent-run :1254-1257; validate before identity :1252-1253; empty store refuses an explicit
  expectation :1246-1248/:1262-1264); `successorReset` adds a live-bytes parity guard — archive written
  :1194, then live store re-read and canonical-compared before `rmSync` :1209-1213 (refusal :1210).
  NOTE: pruneLedger has NO equivalent live-bytes parity guard — the documented loss window.
- Store-path scoping: `--ledger` wins; else `UFO_PRIMEAGENT_SCOPE` → `scopedLedgerPath` :120-125
  (pattern :119 rejects `..`); neither → `defaultLedgerPath` returns null :127-131 and runCli refuses
  "no ledger bound" :1467-1470. Scope path anchors to the module checkout, not UFO_PROJECT_ROOT.
- Archive namespace is parent-stamped: `defaultArchivePath` :816-818 = `<base>.archive.<sha256(parentRunId)>.json`
  (`archiveStamp` :796-798), retention `ARCHIVE_RETENTION = 3` :785, intrinsic-createdAt ordering
  :911-917, vouch-before-delete + excludeName guard :923, byte-based basename bound `MAX_MANAGED_BASENAME = 120`
  :794/:804-807, read eligibility :960-967.

Changed: nothing under the substrate (read-only); added this corpus entry + index row.
Unknowns: none for the five classes at this revision; the residual TOCTOU window (active dir-writer
swapping the tmp pathname :531-537, detected never silent) and prune's missing live-parity guard remain
documented limitations, not unknowns. Seeded lane anchors for `readLedger` (store-schema entry's
":427-455") predate this grep pass — fresh measure is :457-495; the hash anchor is unchanged, so the
seeded numbers are the stale side.

Report: card-side consolidation; no new lane report (cites prior lanes `StoreSchema`, `EntryShape`,
`LedgerValidate`, `PolicyFloor`, `ChainIntegrity`, `SecretScreening`, `AppendSemantics`, `AtomicWrite`).
