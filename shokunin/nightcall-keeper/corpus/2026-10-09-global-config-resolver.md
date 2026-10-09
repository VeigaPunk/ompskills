# global-config-resolver — how an alias becomes a route

Lane `GlobalConfigResolver` (scout).

- `scripts/omp-global-config.mjs` is a pure library. It never reads
  `UFO_OMP_GLOBAL_CONFIG_PATH`; callers do (e.g. `fleet-dispatcher.mjs:3591`)
  and pass `{ path }`.
- Discovery `globalOmpConfigPath` :304-338 walks `DEFAULT_CANDIDATES` :27-34
  under `HOME`: `.omp/agent/config.yml`, `.omp/agent/config.yaml`,
  `.config/omp/config.y{a,}ml`, `.omp/config.y{a,}ml`. A symlinked candidate,
  even a dangling one, fails `malformed`.
- `readBoundedFile` :71-114: `O_RDONLY|O_NOFOLLOW|O_NONBLOCK`, `fstat`
  regular-file check, 1 MiB cap (`MAX_CONFIG_FILE_BYTES` :25), size-change
  detection; returns `{text, sha256}`. Codes: `missing`, `malformed`,
  `unreadable`, `oversized`.
- `resolveAliasFromMaps` :473-487 / `resolveAliasRouting` :489-495. Looks up
  `modelRoles[alias]` (missing → `fail("missing", "modelRoles has no alias …")`
  :478), rejects `@` routes, and keys `retry.fallbackChains` by alias then
  route. Parsers: `yamlBlock`, `parseModelRoles`, `parseAgentModelOverrides`,
  `parseFallbackChains` (the hand-rolled dialect, see host-smith).
- Live: `m_strong` is present under `modelRoles`; `m_daybreak` is absent. Mirror
  `source.sha256` `dc31bdb2…` ≠ live global sha `1ef7b233…`.
