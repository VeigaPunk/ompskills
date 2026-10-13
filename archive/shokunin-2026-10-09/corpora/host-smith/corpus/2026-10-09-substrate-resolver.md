# Substrate — scripts/omp-global-config.mjs (the resolver)

**Asked.** What `readGlobalSeatRouting` does and the fields `apply.mjs`
consumes.

**Observed.** `scripts/omp-global-config.mjs`.

- `readBoundedFile` L71–110: `openSync(O_RDONLY|O_NOFOLLOW|O_NONBLOCK)` L79;
  errno map ENOENT→`missing`, ELOOP→`malformed`, else `unreadable` L83–85;
  `fstatSync` L89; non-regular→`malformed` L90; `> 1_048_576`
  (`MAX_CONFIG_FILE_BYTES` L25)→`oversized` L91–93; post-read size recheck
  L101–103; returns `{text (BOM-stripped), sha256}`.
- `DEFAULT_CANDIDATES` L27–34 (`.omp/agent/config.yml` first);
  `globalOmpConfigPath` L304–341: `lstat(full,{throwIfNoEntry:false})` L322,
  absent→continue L323, symlink (live **and** dangling)→`fail("malformed")`
  L324–326.
- `yamlBlock` L122–153: regex `^(?:bare|"bare"|'bare')\s*:\s*$` gmu; 0→`missing`,
  >1→`ambiguous`; column-0 `#` skipped before break; tab→`malformed`.
  `yamlSubBlock` L155–183.
- `parseSimpleMap` L224–296: key charset `[A-Za-z0-9_.\-/:+]` (no `@`);
  non-scalar `|,>,[],{},[/[{&*!]` rejected L247–250; inline ` #` comment stripped
  on unquoted values; dup key→`ambiguous`.
- `parseFallbackChains` L367–458: bare `@` key→`malformed` L451; nested key;
  dup→`ambiguous`; `indent <= keyIndent`→`malformed` L421–424; items under
  `key:[]`→`malformed`; standalone `[]` sets `declaredEmpty`.
- `resolveAliasFromMaps` L473–488: unknown→`missing`; `@`-value alias→`malformed`;
  delegates `resolveFromMaps` L460–471 (alias-keyed chain wins over route-keyed).
- `resolveSeatRouting` L503–513 returns only `{route, fallbackChain,
  via:{alias,chainKey}}` — **never `sha256`**.
- `readGlobalSeatRouting` L546–598: one parse of all three blocks; per-seat
  resolve; orphan-chain fail L579–587; returns `{path,text,sha256,seats,
  modelRoles,fallbackChains}`.

**Consumption by `apply.mjs`.** import L233, `readGlobalSeatRouting({path:
CANDIDATE})` L235; `sha256`→L241; `via.alias`→L250 bucket key and L977–978
main==l1Alias gate; `route`/`fallbackChain.length`→L257–258; `modelRoles`/
`fallbackChains`→L239–240, L456–459; `seats`→L243–256, L977. `apply.mjs` does
**not** call `resolveSeatRouting` directly.

**Added.** 2026-10-09 · lane `SubstrateResolver` (scout)