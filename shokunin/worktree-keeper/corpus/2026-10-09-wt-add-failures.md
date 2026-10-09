# 2026-10-09 — `omp worktree add` failure modes

**Asked.** Map `omp worktree add` failure modes with exact stderr/exit codes, in scratch repos.
**Sources.** empirical probes in throwaway `/tmp` repos, cross-checked against the embedded `worktree-cli.ts` strings; all probes cleaned up.
**Observed.**
- (a) target path exists as a file or non-empty dir → `fatal: '<PATH as typed>' already exists`, exit 1, repo unchanged. **(a′) an existing EMPTY dir does not block** — exit 0, succeeds.
- (b) `-b <name>` with an existing branch **≠ base commit** → `git branch: Reference "refs/heads/<name>" was not supposed to exist when writing it with value Object(Sha1(<base>)), but actual content was …`, exit 1, unchanged. **(b′) an existing branch == base commit succeeds silently** (exit 0), yet stdout still claims "new branch".
- (c) `-B <name>` on an existing diverged branch → exit 0, resets the branch to base (verified diverged `2c314b9` → `HEAD 5b3d2d9`); on a non-existing branch → exit 0.
- (d1) unknown base commit with `-b` → `object not found: deadbeef1234`, exit 1; (d2) without `-b` (detach path) → `git show: couldn't parse revision: "deadbeef1234"`, exit 1.
- (e) `-C` points at a non-repository (missing or an existing non-repo dir) → `not a repository: <path>`, exit 1.
- (f) target path **inside an existing worktree** → exit 0; nested worktrees are permitted (the inside-main case emits a malformed recursive path in the clone-fallback warning but still exits 0).
- (g) `-b` and `-B` together → `fatal: options '-b' and '-B' cannot be used together`, exit 1.
- Extra: `PATH` is resolved relative to `-C` (`resolve(t, e.path)`), verified from cwd `/tmp`; the "already exists" message echoes the raw path as typed; the default branch name is `basename(path)`, created only if `refs/heads/<basename>` is absent; the clone-first fallback warning goes to stderr but the exit stays 0; `createBranch(name,commit,force=false)`: absent→create, present==target→no-op, present≠target→raw git ref error exit 1.
**Changed.** Seed entry.
**Unknown.** The `-d` detach success-path output; `-q`'s effect on the stderr warning; a target branch already checked out in another worktree; the exact recursion boundary of the nested-in-main anomaly.

**Lane.** WtAddFailures (mutation-tester). Report: `reports/worktree-keeper/WtAddFailures.md`.
