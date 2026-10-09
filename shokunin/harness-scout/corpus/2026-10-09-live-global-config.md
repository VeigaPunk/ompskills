# 2026-10-09 — the live global config anatomy

Lane `LiveGlobalConfig` (revenger) · milestone r1-research · axes source-fidelity, coverage.
Question: what the operator's live global config actually contains, and what evidence shows
it is machine-written.

## Observed

Source: `/home/vgpnk/.omp/agent/config.yml`, read in full (221 lines, 7457 B), plus
`ls -la --time-style=full-iso` of `/home/vgpnk/.omp/agent/`. **No credential values are
present in the file** (full read observed; nothing redacted because nothing was there).

- **Top-level keys (6)**: `setupVersion: 2`, `extendedContext: true`, `modelRoles`,
  `task`, `retry`, `dev` (`dev.autoqaConsent: granted`). `dev` is a sixth key beyond the
  five commonly named.
- **`modelRoles`** — 19 alias keys: the three fleet buckets `m_strong`, `m_mid`, `m_fast`
  (the only aliases `task.agentModelOverrides` references), 12 further named `m_*` lanes
  (`m_qwen38max`, `m_mid_med`, `m_mid_low`, `m_fast_high`, `m_luna`, `m_antigravity`,
  `m_composer`, `m_swe`, `m_k3`, `m_sol`, `m_glm53`, `m_grok`), and 4 legacy role names
  (`smol`, `slow`, `plan`, `default`). Concrete provider/model selectors are the
  operator's live values — read them from the file; a card or corpus entry must never copy
  one into a route slot. Duplication observed: `smol` ≡ `m_mid`'s target; `plan` ≡
  `m_strong` ≡ `m_fast`'s target.
- **`task`** (L23–40): `maxConcurrency: 32`, `maxRecursionDepth: 2`, and
  `agentModelOverrides` — **all 14 seats** mapped to an `@m_*` alias, no seat using a named
  lane or a bare model id. Fan-out: `@m_strong` ×3 (critic, main, planner);
  `@m_mid` ×5 (connector, executor, revenger, reviewer, sentinel);
  `@m_fast` ×6 (distiller, labrat, mutation-tester, scout, scribe, simplifier).
  The live config sets **no** `task.batch`, `enableEffort`, `speculativeLaunch`,
  `disabledAgents`, `isolation`, `agentPrewalk`, or `agentAdvisor` keys.
- **`retry`** (L41–219): `modelFallback: true` and **31 `fallbackChains`**, in two
  families — 19 alias-keyed chains mirroring every `modelRoles` key 1:1 (including
  `default`), and 12 fully-qualified-model-keyed chains whose keys equal alias target
  values. The `default` chain has 4 entries; `m_strong` has 9; `m_mid`/`m_fast` have 6
  each. `m_mid_med`/`m_mid_low` mirror `m_mid`; `m_fast_high` mirrors `m_fast`. Alias
  targets without a dedicated model-keyed chain (the `:medium`/`:low` mids and
  `m_fast_high`'s target) rely on their alias-keyed chains [inference: the resolution rule
  is not visible in the file].
- **Rewrite evidence**: **7** `config.yml.<UTC-ISO>Z.bak` backups beside it (sizes
  4087–25003 B, all mtime 2026-10-08; newest `…22-05-48-022Z.bak`, 24767 B) versus the live
  7457 B file. Timestamped naming plus size churn (backups up to 3.4× the live file) show
  the file is atomically rewritten by tooling [inference from naming/mtime — the writer
  process was not observed].
- **Companion state** in `/home/vgpnk/.omp/agent/`: `agent.db` (SQLite, active WAL)
  with `agent.db.corrupt-20261008` leftovers and a `recovery-20261008/` dir;
  `skill-descriptions.db` (+shm/wal, touched this session-day); `history.db`;
  `models.db`; `sessions/`, `terminal-sessions/`, `custom-session-files/`, `cache/`,
  `agents/`; `kimi-device-id` (value not read).

## Unverified

Runtime resolution semantics (`@alias` indirection, retry-chain lookup order, whether
`modelRoles.default` or `fallbackChains.default` wins) — config-only observation, behavior
not exercised. Whether any secret lives in `agent.db`/`models.db` (not opened). The
writer of the `.bak` files.