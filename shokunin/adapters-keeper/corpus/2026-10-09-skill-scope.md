# skill-scope — ufo-skill-scope.json, the five charterlist slots

Asked: every ufo-skill-scope.json under packages/ — shape, writer, readers.
Source: lane SkillScope (`reports/adapters-keeper/SkillScope.md`).

## Observed

- **Present**: substrate-omp, opencode, codex, grok, kimi (5). **Absent**: cursor, devin.
- **Shape**: `{schema_version:1, skill:"ufo", package_scope:<scope>}` — byte-identical
  except `package_scope`; declares no skill list.
- **Writer**: sync-ufo-contracts.mjs — `cliFamilyScopes` :178-199,
  `expectedScopeTag` :381, write loop :1997-2016, `packageScopes.ok` :2161; source set =
  `docs/ufo-fsd-charterlist.json` assigned_slots (validated to exactly 5,
  validateCharterlist :342-373).
- **Readers**: sync itself (validateCharterlist; `unexpectedScopeTags` :389-402 refuses
  a stray scope file at :1755 — so cursor/devin **couldn't** carry one even if added);
  `packages/substrate-omp/package.json:11` ships it in npm `files`.
- **No runtime reader in-tree**: grep over crates/, substrates/, scripts/, *.ts/*.js
  found nothing outside the writer — the loader is external to this repo (unknown).
- Skill **set** per adapter is identical anyway (byte-identical ufo+wwkd+directive);
  the scope file is a packaging tag, not a skill selector.

## Contract

Scope-tag membership = charterlist slot membership, enforced by refusal of strays.
Cursor and devin are full supportedSubstrates but not family slots.

## Unknowns

- What the external loader does with `package_scope` beyond marking.
- `docs/charter-named-clis.json` references nonexistent `packages/substrate-cursor`
  (stale name) — and :59-61 names `packages/substrate-opencode` (OpencodePkg lane).
