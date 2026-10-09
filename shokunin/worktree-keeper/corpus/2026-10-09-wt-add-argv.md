# 2026-10-09 — `omp worktree add` argv grammar (measured)

**Asked.** Nail the `omp worktree add` argv grammar empirically (six forms, `-C` semantics, the `__fnmcd` 127 failure).
**Sources.** probes in throwaway `/tmp` repos (`/tmp/omp-wt-probe` etc., created and destroyed); `omp worktree --help`.
**Observed.**
- Six forms (all exit 0 unless noted):
  - A `add PATH` (no base): `Preparing worktree (new branch 'a')` / `HEAD is now at … c2` / `Cloned from <repo> via reflink`; row `[a]` — base = **HEAD**, new branch name = **basename(PATH)**.
  - B `add PATH COMMIT`: `Preparing worktree (detached HEAD <sha>)`; row `(detached HEAD)` — an explicit COMMIT **detaches**, no branch (plain git behaves identically).
  - C `add -b BRANCH PATH BASE`: `[brC]` — `-b` overrides the basename rule.
  - D `add -B BRANCH PATH`: `[brD]` — with no COMMIT the base is HEAD.
  - E `add -d PATH`: `Preparing worktree (detached HEAD <sha>)`, row `(detached HEAD)`.
  - F `add -q PATH`: stdout **and** stderr empty, worktree+branch still created; `-q` does **not** suppress stderr warnings (the FICLONE fallback still prints with `-q`).
- `-C`: `-C .` from inside the repo works; `-C /abs/repo` from elsewhere works; with **no `-C`** and cwd not a repo → `not a repository: <cwd>` exit 1 (a typed omp error); `-C /nonexistent` / `-C <file>` → `not a repository: <path>` exit 1; `-C <linked worktree>` resolves to the common repo; a **relative PATH resolves against the `-C` repo dir, not the invoking cwd**; `-C` parses on `list` but does not scope it.
- Edge cases: missing PATH → `Error: Missing required argument: path` exit 1; `-b` with no value → `error: Option '-b, --branch <value>' argument missing` + USAGE exit 1; existing path → `fatal: '<path>' already exists` exit 1; `-b` on a diverged existing branch → raw git ref error exit 1; `-b` and `-B` together → `fatal: options '-b' and '-B' cannot be used together` exit 1; an extra positional is silently ignored; `-j/--json` is accepted and ignored for `add`; unknown action → `error: Expected action to be one of: list, clear, add; got "bogus"` exit 1; missing parent dirs are created (`mkdir -p`).
- Delegation: [INFERENCE, high confidence] omp shells out to `git worktree add` (byte-identical git stdout, standard branch/detach semantics, standard `gitdir:` pointer) and adds the clone-first layer only.
- Clone-first: success prints `Cloned from <repo-dir> via reflink`; on a non-reflink FS it prints `warning: worktree clone fell back to plain checkout: git worktree add: FICLONE unsupported for … Operation not supported (os error 95)` and still exits 0 (destination correct, different inode). Hazard: the clone source is the whole `-C` repo tree, so a PATH **inside that repo recurses** (the warning path grows `relpath/relpath/…`) yet exits 0 → a lane PATH must be absolute and outside the repo.
- **`__fnmcd` 127 is NOT omp.** `omp worktree add <path>` with no `-C` and cwd not a repo gives only `not a repository: <cwd>` exit **1**. `__fnmcd` is a harness-shell artefact: `shopt expand_aliases` is on, `alias cd='__fnmcd'`, and `type __fnmcd` is not found (no fnm hook functions loaded); any **mid-script** `cd` in one bash call prints `error: command not found: __fnmcd` and exits **127** (a leading `cd`/the `cwd:` param, `command cd`, `builtin cd`, and a fresh `bash -c` all work). Name provenance: `~/.bashrc:8` evals `fnm env --use-on-cd` which emits `__fnmcd`/`alias cd=__fnmcd`, but the interactive zoxide `cd` normally wins. Verdict: environment-dependent, orthogonal to the CLI. Safe patterns: the bash tool's `cwd:`, `env -C <dir> <cmd>`, `git -C <repo> …`, or `command cd`.
**Changed.** Seed entry.
**Unknown.** The exact installer of `alias cd='__fnmcd'` in the harness shell (`BASH_ENV` empty; no `~/.config/omp` rc) — [INFERENCE] the harness installs the alias while the fnm function never loads.

**Lane.** WtAddArgv (scout). Report: `reports/worktree-keeper/WtAddArgv.md`.
