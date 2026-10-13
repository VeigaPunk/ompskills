# mission-result-hub — scripts/ufo-mission-result.mjs, the shared spine

Asked: the hub module — purpose, exports by concern, importers, config/env reads.
Source: lane MissionResultHub report. Anchor: ufo-fsd-alpha@5ace2559;
`ufo-mission-result.mjs` **2966 lines**, sha256 `bf23cf3ee51702a74bc492049a0f613d79d838a1cec55579508da1c214755551`,
**0 project-module imports** (node builtins only).

## Observed

- Header `:1-4`: "Typed UFO mission-result envelope (evidence/display only). Strict structured
  evidence; never completion authority or dispatch." **66 exported bindings**, **19 real importers**
  (`fleet-dispatcher`, `land-fleet-run`, `primeagent-recovery-assess`, `ufo-l0-monitor(.test)`,
  `ufo-l0-watch(.test)`, `ufo-mission-{activity,lifecycle,observation}`, `ufo-stale-watchdog`,
  `ufo-swarm-collect(.test)`, `ufo-swarm-wave(.test)`, `ufo-watchdog-repend`, and three `tests/` files);
  one re-export (`ufo-stale-watchdog.mjs:63 export { newestMtime }`). Four further files mention it
  as a string only (`fleet-dispatcher.test.mjs:440`, `gates-plan.mjs:54`, `ufo-stale-watchdog.test.mjs:35`,
  `tests/gates-plan.test.js:94`) — not import edges.
- Key export anchors: `SCHEMA :11`, `RECEIPT_SCHEMA :12`, `MissionResultError :106`, `readBoundedFd :768`,
  `readBoundedFile :832`, `readBoundedJson :936`, `writeFileAtomic :968`, `writeFilePairAtomic :1032`,
  `beneath :1114`, `pidIsAlive :1186`, `acquireSingletonLock :1308`, `withDirLock :1571`,
  `parseDeclaredArgv :1932`, `emitJson :2014`, `emitErrorJson :2031`, `containedJoin :2182`,
  `gatedConfigPath :2143`, `isMainModule :2391`, `loadSwarmPolicy :2431`, `resolveQueuePath :2615`,
  `cliErrorCode :2638`.
- Config/env: the hub reads **no** `config/ufo.json` and **no** `UFO_*` env itself — the strings
  appear only in prose/doc comments (`:2138, :2423, :2613`). `UFO_FLEET_ALLOW_EXTERNAL_TOOLS` is the
  only direct `process.env` read (`:2126`). Callers bind paths: `ufo-swarm-wave.mjs:123,136`,
  `ufo-swarm-collect.mjs:82`, `ufo-stale-watchdog.mjs:731`.
- `loadSwarmPolicy(configPath)` `:2431` → bounded read `:2438` → returns
  `sighting.dispatch.swarm{maxLanes,minLanes,waveMinLanes,waveMaxLanes,rampBatchSize,rampIntervalMs}`
  + `sighting.dispatch.globalRunnerCeiling` `:2529`; repo values 100/16/16/32/5/700/1056.

## Contract

| concern | exports | notes |
| --- | --- | --- |
| policy | `loadSwarmPolicy`, `MAX_SWARM_POLICY_BYTES` `:2420` | the band reader used by wave/watchdog/collect |
| path gates | `beneath` `:1114`, `gatedConfigPath` `:2143`, `containedJoin` `:2182`, `resolveQueuePath` `:2615` | outside-root ⇒ `EXEC_PATH_OUTSIDE_ROOT`; queue outside `.ufo` ⇒ `queue_path_outside_root` |
| locks | `acquireSingletonLock` `:1308`, `withDirLock` `:1571` | — |
| atomic IO | `writeFileAtomic` `:968`, `writeFilePairAtomic` `:1032`, `readBoundedFile/Fd/Json` `:832/:768/:936` | — |
| argv/envelope | `parseDeclaredArgv` `:1932`, `emitJson` `:2014`, `emitErrorJson` `:2031`, `isMainModule` `:2391` | `isMainModule` is the shared main-guard used by 11 scripts |

Flagged, not judged: `optionValue` `:1893` is exported with **zero** importer and zero in-module
caller; `pidIsAlive` `:1186` and `MAX_SWARM_POLICY_BYTES` `:2420` are exported but internal-only.

## Not carried by the source

- The hub carries no hardcoded `config/ufo.json` or `UFO_CONFIG_PATH` read — the path/env binding is
  entirely caller-side. No dispatch, no completion authority, no process spawn (`child_process` is
  not imported).
- `gates-plan.mjs:54` groups the hub as `["l0","swarm"]` while `tests/gates-plan.test.js:94` asserts
  `["fleet","l0","swarm"]` — two different classification surfaces, not a contradiction.

## Unknowns

- Importers were derived from textual import-block parsing (no LSP device in that lane); dynamic
  `import(...)` call sites were not walked.
- Whether `snapshotConfigDigests`/`expectedReceiptBag`/`validateTaskReceiptEitherBinding` stay in
  sync with the dispatcher's own expected-bag code is out of this item's scope.