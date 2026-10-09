# sighting-surface — the UFO Sighting wall entry, shim, and lib

Asked: the three on-disk wall entries, the verbs, and the registry authority.
Source: lane SightingScripts report. Anchor: ufo-fsd-alpha@5ace2559
(`config/ufo.json` sha256 `0e416f0abc559e9a…`); file sha256 prefixes: `ufo-sighting` `01bbcc95…`,
`ufo-sighting.mjs` `5e8ea127…`, `argv.mjs` `7ca628c1…`, `base.mjs` `64c843ee…`,
`observe.mjs` `43e9cf0d…`, `surface.mjs` `64d1a781…`.

## Observed

- `scripts/ufo-sighting` (95 lines, bash shim): resolves ROOT via `readlink -f BASH_SOURCE[0]`
  (`:13-21`), sets `NODE_COMPILE_CACHE` (`:22`), owns exactly **4 internal routes** — attach
  (`UFO_SIGHTING_ATTACH=1`, `:36`), `--ufo-sighting-inquiry-direct` (`:40`), `--ufo-sighting-native-direct`
  (`:63`), `--inquiry` (`:68`) — and falls through to `exec node scripts/ufo-sighting.mjs "$@"` (`:95`).
  It carries **no public verb table**.
- `ufo-sighting.mjs` `main()` `:4399-4713` dispatches public verbs as an ordered **if-chain**:
  hatch→open `:4427`, `__idle` `:4404`, `__pane-run` `:4408`, `__reconcile` `:4413`, `--help` `:4440`,
  open `:4444`, surface `:4451`, status `:4461`, overview `:4468`, reconcile `:4506`,
  respawn-terminal `:4511`, inquiry `:4518`, launch `:4555`, register `:4586`, twin `:4604`,
  remove `:4616`, resume `:4627`, complete `:4648`, steer `:4659`, peek `:4667`, help `:4675`;
  bare `--flags` → `runLegacyNativeDirect` `:4688`.
- Lib modules: `base.mjs` (507 ln — constants/paths/errors/config: `SESSION_NAME 'ufo_sighting'` `:23`,
  `WINDOW_INDEX 1` `:25`, `TMUX_TARGET 'ufo_sighting:1'` `:27`, `MANIFEST_SCHEMA` `:41`, `stateDir` `:301`,
  `SightingError` `:105`, `boot/SIGHTING_CONFIG/readProjectConfig` `:148-245`); `argv.mjs` (510 ln —
  opencode/omp argv parsing + `preflightArgvDispatch` `:455`); `observe.mjs` (614 ln — OMP session
  observation, `ompSessionsRoot` `:22`, `observeMissionTasks` `:384`, `loadObservations` `:493`);
  `surface.mjs` (325 ln — `surface --json` manifest kind `sighting-surface-v1` `:24`, usage `:294`,
  digest over shim+module+4 libs `:13-18,31-45`, `runLegacyNativeDirect` `:318`).
- The entry imports all four lib modules and re-exports the moved names (`:4706-4714`, "public surface
  of this module is unchanged"); no lib imports the entry.

## Contract

| # | Rule | Evidence |
| --- | --- | --- |
| 1 | One live CLI, three on-disk entries: bash shim (public path) → `node ufo-sighting.mjs "$@"` | shim `:95`; `base.mjs:19,21` |
| 2 | The shim owns 4 internal routes only; the verbs live in the module's if-chain | shim `:25,40,63,68,95` |
| 3 | Hatch phrases resolve to `open` before verb parsing | `:4427` (def `:1186`) |
| 4 | `ufo-sighting.mjs` is the live entry (module + shim are one digest artifact); the only "legacy" path is bare `--flags` | `surface.mjs:13-45`; `:4682-4688` |
| 5 | Wall identity: tmux session `ufo_sighting:1`, ownership option `@ufo_sighting_protocol=ufo-sighting-wall-v1` | `base.mjs:23-27`; `:1089`, `:3002` |
| 6 | Wall state root defaults to `ROOT/.ufo/sighting` (`UFO_SIGHTING_STATE_DIR` overrides) | `base.mjs:301` |
| 7 | The mission registry is `manifest.json` (schema `ufo-sighting-wall-v1`), validated/written **only** by `ufo-sighting.mjs` | `base.mjs:41,305`; `ufo-sighting.mjs:279,326,379,548` |
| 8 | `surface --json` is the machine contract of the CLI surface (kind `sighting-surface-v1`), not the mission registry | `surface.mjs:24,59`; `sync-ufo-contracts.mjs:52-60` |

## Not carried by the source

- The shim carries no `open/status/overview/peek/steer/complete/launch` table; there is no
  `case`/`switch` verb dispatch anywhere in `ufo-sighting.mjs`.
- No v2 process registry: `L2-L3-ROUTING.md:199` / `BEHAVIOR-MATRIX.md:242` "There is no locked v2
  process registry with `parentMissionId` reservations".
- The lib modules never read/write `manifest.json`; state mutation lives in the entry. No separate
  `.ufo/sighting/registry.json` exists — `manifest.json` is the sole registry file named by the tree.

## Unknowns

- Whether any non-wall writer mutates `manifest.json` in place is not settled (observed readers:
  `fleet-dispatcher.mjs:84`, `ufo-state-retention.mjs:182`); docs imply the wall's operation lock is
  the reservation boundary. No LSP server answered for this slice — anchors are literal line anchors.