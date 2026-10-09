# Candidate YAML parser dialect — stated vs enforced

**Asked.** The candidate header's rule list, and which rules the substrate
parser actually enforces.

**Enforced** (`scripts/omp-global-config.mjs`):

- R1 column-0 single bare section headers (`yamlBlock:122-131`; mirrored by
  `apply.mjs:200-210`).
- R2 no duplicate keys (`parseSimpleMap:291-293`, `parseFallbackChains:405-407`,
  `yamlSubBlock:160-162`).
- R4 chain nesting deeper than its key (`parseFallbackChains:420-424`), and
  `key: []` then carrying items refused (`:425-427`).
- R5 a missing seat (`resolveSeatFromMaps:516-519`) — the header attributes this
  to the launcher, and `apply.mjs:243-245` mirrors it.
- R6 alias-to-alias refused (lazy, `resolveAliasFromMaps:483-485`).
- R7 dead-weight chain keys (`readGlobalSeatRouting:581-587`; targets =
  modelRoles keys/values/resolved seat routes).

**Stated in the header but NOT load-time enforced:**

- **two-space indent** — no code measures indent width; any consistent ≥1-space
  indent loads.
- **no tabs anywhere** — the parser rejects only content-line indent tabs inside
  the three sections; a tab in a comment, after `:`, or inside a quoted value
  loads (probe). The file-wide rule lives only in `apply.mjs:198`.
- **no block scalars / scalars-only** — the `| > [] {} [{&*!` guards miss `|-`
  (parses to literal `"|-"`), and chain steps have **no** guard (`- [a]`,
  `- &anchor`, `- *ref` accepted as opaque steps).
- **all chain keys at one shared indent** — only deeper-than-predecessor keys
  fail; a dedent that reaches the parent indent silently truncates the sub-block
  (`yamlSubBlock:177`), so dropped chains vanish and those seats resolve with an
  empty `fallbackChain` — no error anywhere in the parser (non-empty seat chains
  are enforced only downstream).
- **alias names a concrete route at load time** — an unconsumed
  `m_bad: "@m_a"` passes `readGlobalSeatRouting`; enforcement is lazy per
  resolution plus `auditRoute`.

**Defect found (credential echo).** `resolveSeatFromMaps:524/:529` interpolate
raw `${seat}`; a credential-shaped quoted config key leaks verbatim into the
error message, where the duplicate-key path redacts the same shape via `safeKey`
(`:213-215`).

**Verified.** Dry run: candidate parses clean (19 modelRoles / 31 fallbackChains
/ 14 seats); it violates none of the un-enforced rules by authorship.

**Added.** 2026-10-09 · lane `ConfigParserDialect` (reviewer)