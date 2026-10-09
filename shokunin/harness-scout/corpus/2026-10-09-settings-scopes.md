# 2026-10-09 — settings scopes and precedence

Lane `SettingsScopes` (scout) · milestone r1-research · axes source-fidelity, coverage.
Question: which layers supply a settings value, in what order, where each lives, how keys
are defined, and what `omp config` exposes.

## Observed

Authority: `omp://settings.md` (read in full), `omp://config-usage.md`,
`omp://extension-loading.md`, `omp://skills.md`; live probes `omp config path`,
`omp config list --json` (**541 keys**), `omp config get extensions`.

- **Precedence, lowest → highest**: built-in defaults ← global config ← project config ←
  CLI overlays ← runtime overrides ← setting env var. Env vars declared on a setting
  definition win; unparseable text counts as unset; a boolean uses the `parseFlag`
  convention (empty = unset). A few env vars are **fallbacks** (`SEARXNG_*`,
  `MNEMOPI_EMBEDDING_MODEL`) that only replace the built-in default. Runtime overrides
  (`--smol`, `--slow`, `--plan`, `--approval-mode`, `--yolo`, `--hide-thinking`, …) are
  in-memory and never persisted. `config-usage.md` §4 gives the same 6-layer order.
- **Merge rules**: objects deep-merged; scalars and **arrays replaced wholesale** (project
  `disabledProviders`/`extensions`/`cycleOrder` do not append); a configured `null` counts
  as unset (exception: project `modelRoles` null entries fall back to global roles).
- **Per-scope paths**:

  | scope | path | writes |
  | --- | --- | --- |
  | global | `~/.omp/agent/config.yml` (or existing `config.yaml`) | `/settings`, `omp config set/reset` |
  | global legacy | `~/.omp/agent/settings.json` | migration only; renamed `.bak` |
  | project | `<cwd>/.omp/config.yml` + `.omp/settings.json` | only `modelRoles` when `modelRoleStorage: project` |
  | project legacy | `<cwd>/.omp/settings.json` | read only |
  | CLI overlay | any `--config <file>`, repeatable | never persisted |
  | runtime | in-memory | never persisted |

  Project settings are **cwd-only** (no ancestor walk); `omp --profile`/`OMP_PROFILE`
  relocates the OMP-native user root; `PI_CODING_AGENT_DIR` relocates the default
  profile's agent dir only.
- **Key definition mechanism** (doc-sourced): every key is declared with
  `register({id, type, default, env?, protocolDefault?, validate?, pathScoped?, credential?,
  ui?})` next to the owning feature (`src/tools/settings.ts`, `src/session/settings.ts`,
  `src/config/model-settings.ts`), collected by `packages/coding-agent/src/config/all-settings.ts`
  in settings-panel order, held by `config/registry.ts` as typed handles
  (`get/set/unset/setEntry/setMember/override/clearOverride/map/combine/listen/provenance/layered`).
  `provenance()` returns `env|runtime|overlay|project|global|default`; `layered()` ignores env.
- **`omp config` vs `/settings`**: `omp config` exposes the complete schema
  (`omp config list` is authoritative — 541 keys observed); the interactive `/settings`
  panel exposes only entries with a supported UI editor and shows/edits **layered** values
  (not env-supplied ones). Some entries are conditional, and numbers/arrays without UI
  choices remain config-file-only. Subcommands: `list|get|set|reset|path|init-xdg`
  (`--json` on all but `path`/`init-xdg`); `set` prints `overriddenBy` when another layer
  still supplies the effective value; `list` masks credentials, JSON omits them.
- **Domain keys observed** (effective values, no env overrides): `task.*` — 23+ keys
  including `task.batch=true`, `task.speculativeLaunch=true`, `task.enableEffort=false`,
  `task.maxConcurrency=32`, `task.maxRecursionDepth=2`, `task.maxRuntimeMs=0`,
  `task.agentIdleTtlMs=420000`, `task.softRequestBudget=200`, `task.disabledAgents=[]`,
  `task.isolation.enabled=false`, `task.agentModelOverrides` (14 seats → `@m_*`).
  `skills.*` — 13 keys (see the skill entries). **No `extensions.*` prefix** — the schema
  is flat: `extensions=[]`, `disabledExtensions=[]`,
  `extensionHandlers.toolCallTimeoutMs=30000`. `tools.approvalMode=yolo`,
  `tools.approval={}` (dotted names like `tools.approval.eval` are **entries** in that
  record, not separate ids).
- **Live**: `omp config path` → `/home/vgpnk/.omp/agent`; `config.yml` exists
  (`-rw-------`, 7457 B); no `config.yaml`; the worktree `.omp/` is non-empty but holds no
  `config.yml`/`settings.json`, so the project scope contributes nothing here.

## Unverified

The `register(...)` signature, handle API, `all-settings.ts` ordering, `protocolDefault`
pinning, and `.broken-*` quarantine are quoted from the docs — the source tree is absent
from this filesystem. Which entries are "conditional" is not enumerable from the docs or
the `omp config list --json` payload (no `ui`/`conditional` flag).