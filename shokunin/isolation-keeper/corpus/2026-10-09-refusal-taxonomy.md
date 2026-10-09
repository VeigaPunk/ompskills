# refusal-taxonomy — typed sighting surface vs bare prepare surface

Asked: enumerate the typed codes and confirm which surface is typed. Source:
`scripts/ufo-sighting-lib/base.mjs:105-137,247-249,327-329`;
`scripts/ufo-sighting.mjs`; `scripts/prepare-ephemeral-l1.mjs`;
`scripts/ufo-sighting-lib/surface.mjs:48`. Lane `RefusalTaxonomy` (scout).

Headline: **sighting is typed, prepare is bare.**

Typed surface: `SightingError extends Error {code, details}` (base:105-112);
`fail(code,message,details)` (:247-249); `environmentFail(message,details)` →
`fail("INVALID_ENVIRONMENT", …)` (:327-329). CLI: `main().catch(emitFatal)`
(ufo-sighting:4704-4705); `emitFatal` (base:116-137) writes
`{ok:false,code,message,details?}` to stderr, exit 2; an untyped throw becomes
`UNEXPECTED_ERROR` (:131).

Ephemeral codes:
- `INVALID_ENVIRONMENT` (base:328) — every `environmentFail`: env/marker refusals
  (ufo-sighting:35,38,42,51,55,63,65,67,74,66,75,71,78,86,92,94,97,108,114,119,
  121,125,133,4355; 4196,4199,4210,4219,4222,4225,4234,4256; 4296,4298,4304,4307,
  4316,4319,4322; 2385,2394,2397).
- `SANDBOX_UNAVAILABLE` (4206) — bwrap unresolvable at pane start.
- `INVALID_OPENCODE_DISPATCH` (4208) — OpenCode executable unavailable at pane
  start.
- `OMP_EPHEMERAL_TWIN_UNSAFE` (3908) — a twin requested for an ephemeral mission.

Registry: `surface.mjs:48 FAIL_CODE_PATTERN = /\bfail\(\s*"([A-Z][A-Z0-9_]*)"/gu`
— reproduced over the five surface files = 72 codes; `environmentFail` sites
register only via base:328.

Bare surface: `prepare-ephemeral-l1.mjs` has **no** error class (grep
`class|SightingError|extends Error` → no output) and 113 `throw new Error(...)`
sites; `createEphemeralL1`'s cleanup rethrows the original. CLI: success
`JSON.stringify(main(),null,2)` on stdout; failure `JSON.stringify({error:
error.message})` on stderr, exit 2 — **no `code` field**. Pinned only as
`JSON.parse(stderr).error` (tests:1299-1311).

## Discrepancies observed

- `loadMissionEnvironment`'s comment (ufo-sighting:103-107) claims
  `readBoundedUtf8` raises a typed `SightingError`, but it raises a plain `Error`
  (base:480-484) — the `instanceof SightingError` branch is dead there and a
  bound trip is retyped to `environmentFail("environment file is not valid
  JSON")` (:108); the same dead branch exists at :4304. Typing is unaffected
  (still `INVALID_ENVIRONMENT`); only the message is wrong.
- `tests/prepare-ephemeral-l1.test.js:1293` is titled "reports typed errors" but
  asserts only `JSON.parse(stderr).error` — prepare carries no code field.

## Unknowns

- Whether an external consumer parses prepare's stderr expecting a `code` field.