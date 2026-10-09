# 2026-10-09 — environment variables that shape the harness

Lane `EnvAndRoots` (scout) · milestone r1-research · axes source-fidelity, coverage.
Question: the `$env`/`.env` resolution model, and the env vars that move roots, gate
discovery, or block a spawn.

## Observed

Authority: `omp://environment-variables.md` (read in full), cross-checked against
`omp://config-usage.md`, `omp://settings.md`, `omp://providers.md`; behaviour witness =
minified source extracted from the compiled bundle `/home/vgpnk/.local/bin/omp`.

- **Resolution model**: `$env` from `@oh-my-pi/pi-utils` (`packages/utils/src/env.ts`)
  is the **process env object itself** (`ve = Bun.env`), mutated at startup by the dotenv
  load. Load order, first non-empty wins: process env → project `.env` (launch cwd) →
  agent `.env` (`~/.omp/agent/.env`) → config-root `.env` (`~/.omp/.env`) → home `.env`
  (`~/.env`). The apply loop writes a key only when `!Bun.env[key]` (undefined **or empty
  string**).
- **Dotenv parser**: `node:util.parseEnv`; names must match
  `/^[A-Za-z_][A-Za-z0-9_]*$/`; after parsing, an `OMP_*` key is mirrored to `PI_*`
  **within the same file** (unconditionally overwriting the same-file `PI_*`). No variable
  expansion of loaded values. Project-dotenv keys are filtered out of child shells
  (Linux snapshot from `/proc/self/environ`).
- **Precedence**: a setting env var is the **highest** layer (above runtime overrides);
  `PI_CONFIG_FILES` is not a setting override — it is layer 3 (CLI config overlays),
  loaded in listed order **before** `--config`, resolved against cwd.
- **Root/config vars**:
  | var | effect |
  | --- | --- |
  | `OMP_PROFILE` | canonical profile selector (`~/.omp/profiles/<name>/agent`); wins over `PI_PROFILE` **even when explicitly empty** (empty ⇒ default profile); invalid names throw |
  | `PI_PROFILE` | legacy fallback, only when `OMP_PROFILE` is undefined |
  | `PI_CONFIG_DIR` | config-root dirname under home (default `.omp`); moves the generic OMP user base; does not itself move the agent dir |
  | `PI_CODING_AGENT_DIR` | full agent-directory override; **default profile only** (named profiles ignore it) |
  | `PI_CODING_AGENT_SESSION_DIR` | initial session-directory override, seeded into arg parsing (a later `--session-dir` wins) |
  | `PI_CONFIG_FILES` | platform-delimited overlay list, loaded before `--config`; missing/invalid file hard-fails |
  | `PI_NATIVES_DIR`, `OMP_WORKTREE_DIR` | native addon root; agent-managed worktree dir (wins over the `worktree.base` setting) |
  | `XDG_DATA_HOME`/`XDG_STATE_HOME`/`XDG_CACHE_HOME` | redirect data/state/cache only when the target `omp` root already exists; `config.yml` never moves |
  | `CLAUDE_CONFIG_DIR` | relocates the Claude user config dir (and `.claude.json`) |
- **Discovery-affecting vars**: `CLAUDE_CONFIG_DIR` **implicitly enables the Claude user
  discovery source** (skills, agent plugin roots, commands, tools, LSP config, MCP) and
  enables `claude-plugins` (enabling `claude` implies it); `disabledProviders` still wins.
  `PI_BLOCKED_AGENT` is a **pre-discovery spawn guard**: if the requested agent name equals
  the var, spawn fails with `Cannot spawn <name> agent from within itself (recursion
  prevention).` (a per-request `blockedAgent` override beats the env). `OMP_PROFILE`/
  `PI_PROFILE`/`PI_CONFIG_DIR`/`PI_CODING_AGENT_DIR` relocate the user roots every native
  discovery pass reads. **No dedicated extension/skill provider env var exists** — gating
  is CLI (`--extension`/`-e`, `--hook`, `--no-extensions`) or settings.
- **Provider auth** is a separate chain (runtime override → `models.yml` apiKey → stored
  OAuth → login-stored key → extension fallback → provider env var (incl `.env`) → other
  stored key), consumed via `getEnvApiKey()` (`packages/ai/src/stream.ts`). Credential
  values were never read or printed.

## Unverified

No live CLI probe was run. The checkout `packages/utils/src/env.ts` is absent, so bundle
symbol names (minified) were mapped back to the doc's names; medium confidence on the
`PI_CONFIG_FILES` failure branch and the `XDG_*` "already exists" gating. Live config
values belong to the live-config entry.