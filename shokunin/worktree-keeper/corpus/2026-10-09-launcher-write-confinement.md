# 2026-10-09 — launcher write confinement for worktree roots

**Asked.** Where may the launcher create a worktree — the write-confinement gate as it governs `worktreeRoot`/`stateDir`.
**Sources.** `sighting/tower-fleet.mjs` at HEAD `87c351a` (`resolveRepoPath` :169-172; `realpathDeepest` :204-230; `assertSafeWriteRoot` :237-252; `assertSafeWriteTarget` :257-285; wiring :401-402, :708, re-checks :697/:727/:797/:835-837/:906; `MISSION_ID_PATTERN` :349).
**Observed.**
- Sole worktree-creating site is `omp worktree add` :805-811 via `spawnSync` argv (no shell); removal is print-only :1220-1224. The slot `<worktreeRoot>/<id>` is traversal-free (`MISSION_ID_PATTERN` :349) and derived at :599.
- `resolveRepoPath` is purely lexical; `realpathDeepest` resolves the longest existing prefix and reports a dangling symlink leaf instead of resolving through it.
- `assertSafeWriteRoot` (:237-252) refuses exactly four zones: dangling leaf, inside `ufoRoot` (realpath **and** lexical; equality counts as inside), repo-root **equality**, and inside `<repo>/.git`. Wired at :401-402.
- `assertSafeWriteTarget` (:257-285) adds the leaf refusal (`lstat isSymbolicLink` :270-273; ENOENT tolerated :274-279), a resolved-target-inside-root check :280-283, and a zone re-check :284. Wired pre-loop :708 (before the wall opens :714) and re-checked at every write site.
- Live symlinks are refused only at derived-target leaves, never at a root.
- Residual holes: F-1 (MED, config surface) containment is negative only — nothing requires the roots to sit inside the repo, so the launcher accepts a lane path anywhere zones-clean; F-2 (MED, spec-trust) zones are relative to spec-declared `ufoRoot`/`repo` strings (:330-333), a decoy removes the substrate zone; F-3 (LOW-MED) a symlinked `stateDir` passes :401/:708 and is refused late at :727 after the wall opens (`STATE_DIR_UNAVAILABLE`); F-4 (MED-WT) a symlinked `worktreeRoot` is never leaf-guarded (`:264` zone-checks only, :281 containment relative to the resolved root, no root==target self-guard) — exit 0 with the pane `--cwd` outside the repo; F-5 (INHERENT) TOCTOU — guards snapshot lstat/realpath, writes re-resolve, no `O_NOFOLLOW`; F-6 (LOW) slot reuse trusts `existsSync` only (:798-799), so a planted plain dir suppresses the add; H-3.1 (OPEN) `base` trim-only :387, no `--` terminator :805-811.
**Changed.** Seed entry.
**Unknown.** The linked-worktree case (main repo `.git/worktrees` outside the declared `<repo>/.git` prefix) is uncovered by the textual zone check ([INFERENCE]); prior round-2 fixture reproductions for F-2 were cited, not re-run (no destructive probe).

**Lane.** LauncherWtConfine (sentinel). Report: `reports/worktree-keeper/LauncherWtConfine.md`.
