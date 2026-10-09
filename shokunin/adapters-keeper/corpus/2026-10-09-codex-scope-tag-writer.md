# codex-scope-tag-writer — is packages/codex/ufo-skill-scope.json generated, and by what

Asked (L1 verification): is `packages/codex/ufo-skill-scope.json` a generated file, which
exact code writes it, and which code enforces no other package carries one.

## Answer

Yes — generated (written and byte-checked) by `scripts/sync-ufo-contracts.mjs`; git-tracked
but produced, not authored.

## Writer path (verified against real tree)

- `cliFamilyScopes` — `scripts/sync-ufo-contracts.mjs:178-199`; codex entry at `:187-190`
  maps `scopeTag: "packages/codex/ufo-skill-scope.json"` (:189).
- `expectedScopeTag(packageScope)` — `:381-387` — returns Buffer of
  `JSON.stringify({schema_version:1, skill:"ufo", package_scope}, null, 2) + "\n"`.
- Write/check loop — `:1997-2020`: iterates `charterlist.assigned_slots`; for each,
  `destination = join(root, cliFamilyScopes[slot.package_scope].scopeTag)` (:1998),
  `expected = expectedScopeTag(slot.package_scope)` (:2000). Missing → `missing[]` +
  `writeAtomicFile` when `!checkOnly` (:2001-2009); byte-drifted → `drifted[]` +
  rewrite when `!checkOnly` (:2011-2019). `checkOnly = --check || --review` at `:47`.
- `writeAtomicFile` — `:1606-` — mkdir + tmp-file (`<dest>.<pid>.<ts>.tmp`) + rename.
- Result reporting — `packageScopes` at `:2160-2167` (`ok` requires zero missing/drifted
  under `--check`, `:2161`).

## Exclusivity enforcement

- `unexpectedScopeTags()` — `:389-402` — builds `expected` set from all
  `cliFamilyScopes.*.scopeTag`, readdir's `packages/` (follows symlinked dirs, `:397`),
  flags any `packages/<name>/ufo-skill-scope.json` not in the set.
- Called unconditionally at `:1755-1756` (both sync and check modes); non-empty →
  `throw new Error("unexpected CLI-family scope tags: …")` at `:1757-1759` **before** the
  write loop — so a stray at `packages/cursor/` or `packages/devin/` hard-fails the run.
- Charterlist gate — `validateCharterlist` `:342-373`: `assigned_slots` must have exactly
  `Object.keys(cliFamilyScopes).length` (5) entries (:342-347), each `package_scope` must
  hit a `cliFamilyScopes` key (:353), and the scope set must equal the key set exactly
  once (:366-368). `docs/ufo-fsd-charterlist.json` assigned_slots: omp(1), opencode(2),
  codex(3, `package_scope_ref` = the file itself), grok(4), kimi-code/kimi(5);
  `next_unassigned_ordinal: 6`.
- Safety-net: `assertSafeRepoPath` on every scopeTag dest at `:1954-1956` (pre-write).

## Tree facts

- `packages/codex/ufo-skill-scope.json` bytes = `{schema_version:1, skill:"ufo",
  package_scope:"codex"}` 2-space + trailing `\n` (od-verified) — matches
  `expectedScopeTag("codex")` exactly.
- Git-tracked (`git ls-files` lists it; `git check-ignore` exit 1). Generated-but-committed,
  same posture as the skill mirrors.
- Exactly 5 such files exist on disk: substrate-omp, opencode, codex, grok, kimi —
  matches `cliFamilyScopes` keys; cursor and devin carry none.
- Scope limit: `unexpectedScopeTags` scans `packages/<name>/` one level deep only — a
  nested stray (`packages/x/sub/ufo-skill-scope.json`) is invisible to it.

## Unknowns

- None new beyond existing entry `2026-10-09-skill-scope.md` (no in-tree reader).
