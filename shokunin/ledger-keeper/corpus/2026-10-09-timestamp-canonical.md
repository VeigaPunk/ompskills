# timestamp-canonical — UTC rule, canonical serializer, entry digest

Asked: `CANONICAL_UTC_RE`, `isCanonicalUtcTimestamp`, `canonical()`, and `entryDigest`.
Anchor: `ufo-fsd-alpha@5ace2559`; `scripts/primeagent-refinement-ledger.mjs` sha256 `ae69c40c7e774161812bbed3b34964978bb2d204b8daf19721ab5dd54e145096`; `config/primeagent-assimilation.json` sha256 `d6348cabfcbf3e8195e8335eb1dd3578681f644770f10dd3efdc21dc58439674`. Source: `reports/ledger-keeper/<Lane>.md` (mission round 1, wave `ledger-keeper-r1-w1`). Lane: `TimestampCanonical`.

Observed:
- `CANONICAL_UTC_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u` (:246); `isCanonicalUtcTimestamp`
  (:248-252) = primitive string AND full anchored match AND finite `getTime()` AND `toISOString()===value`.
  Rejects suffix `/`+00:00`/impossible dates (`2026-02-30`, `2026-13-99`)/toString objects (all executed, exit 2).
- `canonical(value)` (:269-276, private): arrays recursive order-preserved; objects key-sorted (UTF-16 code-unit,
  numeric keys sort as strings → `{2,10}` → `{"10","2"}`); leaves `JSON.stringify(v ?? null)`; no-own-key objects → `{}`.
  Used at :280 (digest preimage), :353/:408 (byte bounds), :1067 (archive slot digest), :1157/:1209 (replay equality).
- `entryDigest(entry, prevDigest)` (:278-281, exported): preimage `${prev ?? "GENESIS"}\n${canonical(entry without sha256)}`,
  hex sha256; `null`/`undefined`/omitted `prev` all map to `GENESIS`; `seq` is inside the hash.
- "Refusal, never normalization": write refuses (:326), stores input verbatim (:352); CLI default is a fresh clock
  value (:1482), never a repair; read refuses a non-canonical top-level createdAt (:387).

Changed: nothing. Unknowns: full enumeration of regex-admitted-but-round-trip-rejected inputs (mechanism pinned, case list not exhaustive).

Report: `reports/ledger-keeper/TimestampCanonical.md`.
