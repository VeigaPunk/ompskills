# the-tick-machine — `config/the-tick.machine.json`

Lanes `TickConfigValidator`, `TickConsumers` (scouts). L1 re-read
`the-tick-config.mjs:15,311-320,386-397` and `gates.sh:494-512`.

- Schema `the-tick-machine-v1`, sha `c0f35a29…`. Validator
  `validateTickMachineConfig` (`scripts/the-tick-config.mjs:183`); loader
  `loadTickMachineConfig`; default path `DEFAULT_TICK_CONFIG_PATH` :15
  (MODULE_ROOT-absolute).
- Exact key sets at :93-122. Bounds:
  - `contextTokensPerRunner` 1024..1048576
  - `backend.endpoint` must be credential-free `http://127.0.0.1/v1/chat/completions`
  - `contextTokens == parallelSlots × contextTokensPerRunner` (2×8192=16384)
  - `runners.length == parallelSlots`
  - `pathPing` bounds :235-268, with `min ≤ default ≤ max` intervals
- `model.sha256` is checked for **shape only**; nothing hashes the GGUF, and
  `model.path` existence is unchecked.
- Templates: `${XDG_RUNTIME_DIR}/…` (`runtimeDir`, sockets) and `${REPO_ROOT}/…`
  (path roots). The shape is checked at :173-181 and expanded at :302-308.
- `freshnessPing.staleAfterMs` must exceed `config/ufo.json`
  `sighting.heartbeatIntervalMs` (:273-290). This is advisory if ufo.json is
  unreadable.
- Consumers:
  - `scripts/ufo-ground-handler.mjs` (`--config` default)
  - `scripts/the-tick-ping.mjs:563`
  - `scripts/gates.sh` `wall_probe_tick_root` :494-542: cwd-relative read;
    codes `tick_config_unreadable`, `tick_root_mismatch`
  - `sync-ufo-contracts.mjs:1777-1860`: validator, socket-direct-child,
    policy-root checks; `--check` reports `tickMachine: {ok:true}` (observed)
- `config/ufo.json` lists the file in `membrane.paths` (:33, action
  `authority_boundary`). An admitted change to it seals as an authority
  boundary (proposal/judge code in crates). It is not in `NATIVE_CONTRACT_FILES`.
- Live validation passed (lane).
