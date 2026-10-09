# store-schema — the ledger STORE document contract

Asked: `LEDGER_SCHEMA`/`STORE_VERSION`, the three key sets, the five kinds, `emptyLedger()`,
and where an unknown key refuses. Anchor: `ufo-fsd-alpha@5ace2559`; `scripts/primeagent-refinement-ledger.mjs` sha256 `ae69c40c7e774161812bbed3b34964978bb2d204b8daf19721ab5dd54e145096`; `config/primeagent-assimilation.json` sha256 `d6348cabfcbf3e8195e8335eb1dd3578681f644770f10dd3efdc21dc58439674`. Source: `reports/ledger-keeper/<Lane>.md` (mission round 1, wave `ledger-keeper-r1-w1`). Lane: `StoreSchema`.

Observed:
- `LEDGER_SCHEMA = "ufo-refinement-ledger-v1"` (:110), `STATUS_SCHEMA = "ufo-refinement-status-v1"` (:111),
  `STORE_VERSION = 1` (:295).
- Key sets: `INPUT_ENTRY_KEYS` (:292) = kind,title,body,axis,evidence,createdByRun,createdAt,mission;
  `STORED_ENTRY_KEYS` (:293) = seq,kind,title,body,axis,evidence,createdByRun,createdAt,sha256;
  `STORE_KEYS` (:294) = schema,version,parentRunId,parentSessionId,parentMissionId,createdAt,entries.
- Kinds (5, from `config:6`): prompt-note, memory, skill-note, subagent-note, refinement-event;
  enforced at `validateEntryShape` :311-313 (write, :617) and :397 (storage re-validate).
- `emptyLedger()` (:360) = all four lineage fields `null`, `entries: []`; only caller is `readLedger` :470 on ENOENT.
- `unknownKeyCount` (:297) at :308 (entry) and :372 (store); refusals report a **count only**,
  never key names: `entry carries ${n} key(s) outside the entry schema` / `store carries ${n} key(s) outside the ledger schema`.
- `readLedger` :427-455 is a pure JSON parse + root-object screen — no key checks; key checking lives in `validateLedger`.
- The config's `ledger.schema` string is **not read** by `readPolicyFile` (it reads only numeric keys + kinds + secretPatterns).

Changed: nothing (read-only). Unknowns: whether packages restate the key sets (they do not export them);
whether the :748 digest-schema re-use is one schema or two (bytes share the string).

Report: `reports/ledger-keeper/StoreSchema.md`.
