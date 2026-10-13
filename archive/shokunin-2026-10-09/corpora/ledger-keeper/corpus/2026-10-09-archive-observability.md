# archive-observability — `list-archives` / `read-archives`

Asked: the two read-only archive verbs' distinct failure semantics, schemas, hash domains,
eligibility, and never-projected surfaces. Anchor: `ufo-fsd-alpha@5ace2559`; `scripts/primeagent-refinement-ledger.mjs` sha256 `ae69c40c7e774161812bbed3b34964978bb2d204b8daf19721ab5dd54e145096`. Source: `reports/ledger-keeper/<Lane>.md` (mission round 1, wave `ledger-keeper-r1-w1`). Lane: `ArchiveObservability`.

Observed:
- Docstring (:940-947): list-archives **succeeds** with refused rows visible (exit 0); read-archives **fails closed** on any
  refused/unavailable slot or a changed name set (exit 2). Neither mutates, neither follows symlinks, neither projects raw
  bodies/runIds/session-mission lineage. Both `prettyDefault`.
- Schemas/domains (:948-951): `ufo-refinement-archive-inventory-v1`, `ufo-refinement-archive-digest-v1`,
  `ARCHIVE_SLOT_DOMAIN "ufo-refinement-archive-slot-v1\n"`, `ARCHIVE_ROLLUP_DOMAIN "ufo-refinement-archives-v1\n"`.
- Recipe (:1067,:1095): `slotDigest = sha256(SLOT_DOMAIN + canonical(projection))`; `chain = sha256(ROLLUP_DOMAIN)` then
  `chain = sha256(chain + "\n" + slotDigest)` over slot-name-asc; empty set → `sha256(ROLLUP_DOMAIN)` =
  `51174ef6ad926751a8da49cb8c6816238205834141cc1e09eb95973821d06f82` (reproduced).
- Inventory valid row `{name,stamp,status:"valid",entryCount,createdAt,parentRunIdDigest}`; refused row has no vouch metadata;
  rows sorted by slot name; legacy `<base>.archive.json` presence-only.
- Digest slot `{name,stamp,parentRunIdDigest,entryCount,createdAt,entries:[{seq,sha256}],slotDigest}`; post-read name-set re-check.
- `managedArchiveReadEligibility` (:959-966): requires `.json` path and basename ≤120 bytes.
- Receipt limit (:1034-1046): "tamper-EVIDENCE receipt, not a signature, not a Merkle proof, and not proof of chronology or parentage".
- Scratch probes: successor-reset → `retention {ok:true,kept:1,pruned:0,refused:[]}`; forged slot → list exit 0 `refusedCount:1`,
  read exit 2, status exit 0 `degraded`; empty set → exit 0 empty roll-up.

Changed: nothing. Unknowns: direct callers outside the CLI/tests (text grep, no LSP reference).

Report: `reports/ledger-keeper/ArchiveObservability.md`.
