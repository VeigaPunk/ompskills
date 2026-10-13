# Dialect strictness — parsers and route grammar

**Asked.** What dialect must the config obey, and what makes a route value
legal?

**Observed.** Two parsers read the global file; the hand-rolled one is stricter
and fails closed.

`omp-global-config.mjs` (`ufo-fsd-alpha/scripts/`):

- `MAX_CONFIG_FILE_BYTES` = `1_048_576` (:25); fd-bound read `openSync(..., O_RDONLY|O_NOFOLLOW|O_NONBLOCK)`,
  fstat-regular-file and size-pin, post-read size re-check, symlink candidate
  refused at `globalOmpConfigPath` (:318-326).
- `yamlBlock`/`yamlSubBlock` (:122, :155): a duplicated top-level or sub key
  fails closed as `ambiguous` (YAML last-wins would silently override the
  inspected section); keys are quote- and space-tolerant (`key:`, `"key":`,
  `'key':`); a tab fails closed.
- `parseSimpleMap`/`parseFallbackChains`: reject non-scalar indicators
  (`[` `{` `&` `*` `!`), trailing bytes after a quoted value, unterminated
  quotes, duplicate keys, nested keys, a `key: []` that then carries items.
- `safeLine`/`safeKey` redact any line/key matching `containsSensitiveShape`
  before interpolating into an error message.

`host/omp-agent.config.yml` header (the candidate's own contract): sections at
column 0 spelled bare, two-space indent / no tabs / no dup keys, map values
scalars only, chains `- item` strictly deeper than their key at a shared indent,
`task.agentModelOverrides` must carry every seat, an alias must name a concrete
route (never `@alias`), and every `fallbackChains` key must be a `modelRoles`
key, a `modelRoles` value, or a resolved seat route. (The header prose "all
twenty-nine chains" is **stale**: the table declares 31; no machine gate reads
the number.)

Route grammar (`sync-global-routing.mjs:115-166`, `host/apply.mjs:415-445`):

- `splitRoute`: first `/` splits provider from model; padded selector rejected;
  effort is the suffix after the **last** `:`; charset `[A-Za-z0-9_.-]+` both
  segments; `provider/model` with no effort is legal.
- `EFFORT_SUFFIXES` = `low|medium|high|xhigh|max`. **`minimal` is illegal** —
  the same whitelist in `sync-global-routing.mjs:91`, `host/apply.mjs:66`,
  `build.rs:105`.
- Gemini-family routes are banned unless the route starts with
  `google-antigravity/` (`GEMINI_MARKERS` = gemini, google-ai, google_ai,
  google-gemini, bard).
- `build.rs` adds two constraints the mirror script does not: a **non-empty
  chain** and **pairwise-distinct BARE models** (effort stripped) — the primary
  enters the same set, so a chain may not repeat its own primary at another
  effort.

**Changed.** None.

**Unknown.** A JS/Rust case-sensitivity divergence in the antigravity carve-out
(observed, no divergent input constructed).

Evidence: lanes DialectRulesScout06, DialectParserScout13, ApplyRouteGateScout09,
SplitRouteScout17.