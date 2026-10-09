# 2026-10-09 — launcher scope gate and worktree-root defaults

**Asked.** Extract the launcher's one-writer-per-path gate and the worktree/state root defaults.
**Sources.** `sighting/tower-fleet.mjs` (:175-190 `normalizeScopePath`, :192-197 `scopeOverlaps`, call site :360, gate :374-383, defaults :393-394, `resolveRepoPath` :169-172); `sighting/l1-prompt.md:46,129-130,136-138`.
**Observed.**
- Defaults: `stateDir` = `<repo>/.tower/fleets/<fleet>`, `worktreeRoot` = `<repo>/.tower/worktrees/<fleet>`; per-mission worktree = `<worktreeRoot>/<id>`. `plan` reproduces them (exit 0). No drift vs `.omp/skills/tower/SKILL.md`'s fleet section.
- Canonicalization (`normalizeScopePath`): non-empty string; strip leading `./` and trailing `/`; refuse empty; refuse `.` or any `.` segment (`INVALID_SPEC`, repo-root/dot); refuse absolute or `~`; refuse `..` or empty `//` segment; else `parts.join('/')` → a repo-relative prefix (`./src/` → `src`).
- Gate (`scopeOverlaps`): prefix containment over path segments — nesting or equality refuses the whole fleet with `SCOPE_OVERLAP` (exit 2, `{ok:false,code,message}` on stderr); disjoint passes (empirical: `src` vs `src/foo` and `src` vs `src` refuse; `src` vs `lib` exits 0). It runs in `loadSpec` for every verb, including `plan`, before any mutation.
- `INVALID_SPEC` cases (all exit 2): `.`/`src/./x` ("not the repo root or a dot segment"), `/etc`/`~/x` ("must be repo-relative, not absolute"), `src/../x`/`src//foo` ("must stay inside the repo"), missing/empty scope ("needs a non-empty scope array").
**Changed.** Seed entry.
**Unknown.** No runtime path-level enforcement of scope was observed — scope is mission-duty enforced by the L1 at integration (l1-prompt.md:129-130); the launcher's mechanical enforcement is the `SCOPE_OVERLAP` refusal plus `assertSafeWriteRoot` confinement.

**Lane.** LauncherScopeGate (scout). Report: `reports/worktree-keeper/LauncherScopeGate.md`.
