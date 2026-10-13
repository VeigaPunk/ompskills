# 2026-10-09 — re-derivation: `test/evidence/` has no in-repo machine gate

**Asked.** Independently re-derive ONE claim of
`2026-10-09-evidence-gitignore-contract.md` from source: that `test/evidence/`
has **no in-repo machine gate**. Run, in this worktree, and record the exact
command, exit code and output for each:
`git grep -n -i gitignore -- '*.mjs' '*.js' '*.json' '*.yml'`;
`git grep -n 'check-ignore'`;
`git check-ignore -v test/evidence/wave-20261009T120000Z/manifest.json`;
`git ls-files test/evidence/`.

**Where.** Worktree `/home/vgpnk/Projects/ompskills/.tower/worktrees/shokunin2/evidence-auditor`
(`git rev-parse --show-toplevel` → that path, rc=0), revision pinned
`git rev-parse HEAD` → `87c351a89f65967c11b726a278304f83ffeb1949`; tracked file
count `git ls-files | grep -c .` → `242`.

## Observed — the four named commands (verbatim, with exit codes)

1. `git grep -n -i gitignore -- '*.mjs' '*.js' '*.json' '*.yml'`
   → **no output; rc=1** (no match in tracked `.mjs/.js/.json/.yml`).
2. `git grep -n 'check-ignore'`
   → **no output; rc=1** (no tracked file contains the string).
3. `git check-ignore -v test/evidence/wave-20261009T120000Z/manifest.json`
   → rc=0, output (TAB between rule and path):
   ```
   test/evidence/.gitignore:4:*	test/evidence/wave-20261009T120000Z/manifest.json
   ```
   Line 4 of the ignore file is `*`; the probed path matches the rule.
4. `git ls-files test/evidence/`
   → rc=0, output exactly:
   ```
   test/evidence/.gitignore
   ```
   i.e. the directory's only tracked member is the ignore file.

Corroborating runs (same worktree, same revision):

- `git ls-files -o --exclude-standard test/evidence/` → **no output; rc=0**;
  `git status --porcelain test/evidence/` → **no output; rc=0** — nothing under
  the tree is untracked-but-not-ignored, nothing is modified/staged.
- `git grep -n -iE 'check-ignore|\.gitignore'` (all tracked files, no pathspec)
  → **rc=0**, hits only in prose `.md` documents and the ignore file itself:
  `.omp/agents/test-smith.md:32`, `reports/tf-audit-docs.md:11,152`,
  `reports/tf-audit-routing.md:38`, `shokunin/test-smith/corpus/2026-10-09-evidence-gitignore.md:7,11,12,36,44`,
  `test/evidence/.gitignore:5`, `test/sighting-wave-smoke.md:21`. No hit in any
  `.mjs/.js/.json/.yml/.sh/.toml` or other executable/config file.
- `git grep -n --untracked 'check-ignore'` → **rc=0**, 4 lines in 2 files:
  `.omp/agents/evidence-auditor.md:26` and
  `shokunin/evidence-auditor/corpus/2026-10-09-evidence-gitignore-contract.md:14,31`.
  Both files are untracked (`git status --porcelain` → `?? .omp/agents/evidence-auditor.md`,
  `?? shokunin/evidence-auditor/`; `git ls-files --error-unmatch .omp/agents/evidence-auditor.md`
  → rc=1), which is why command 2 (tracked scope, git default) is rc=1 while the
  string does exist on disk.
- `git ls-files shokunin/evidence-auditor/corpus/` → **no output; rc=0** — this
  corpus is untracked in the worktree, so `git grep` never searches it.
- Ignore-rule answer is path-string based, not existence based:
  `git check-ignore -v --no-index test/evidence/wave-20261009T120000Z/manifest.json`
  → rc=0, same rule line `test/evidence/.gitignore:4:*`. And
  `test/evidence/**` on disk holds only `.gitignore` — the probed
  `wave-20261009T120000Z/manifest.json` **does not exist**; command 3's rc=0
  measures the rule, not a file.
- Repo-local surfaces a tracked-file search cannot see:
  `git rev-parse --git-common-dir` → `/home/vgpnk/Projects/ompskills/.git`; its
  `hooks/` contains **only `*.sample` files** (applypatch-msg, commit-msg,
  fsmonitor-watchman, post-update, pre-applypatch, pre-commit, pre-merge-commit,
  pre-push, pre-rebase, pre-receive, prepare-commit-msg, push-to-checkout,
  sendemail-validate, update) — no active hook. No CI config exists
  (`glob .github/**;.gitlab-ci.yml;Jenkinsfile;.cirrus.yml;.woodpecker*` → none).

## What this establishes

The original claim reproduces at this revision: **git's ignore semantics are the
mechanism (command 3 names the rule that covers the path; command 4 shows only
the ignore file is tracked), and no in-repo machine gate references it** —
commands 1 and 2 are both rc=1, and the broad all-tracked search finds only
prose. Nothing in the tracked tree would fail if a covered file were force-added
(`git add -f`) or a run wrote outside the tree.

**[INFERENCE] (reasoned, not run).** rc=1 for `git grep` is git's documented
"no lines selected" exit, so I read it as "zero matches in the searched scope"
— not as an error. The step from "no executable/config file reads the ignore
rule" to "no gate is possible" is also inference: command 1 is extension-scoped,
and only the broader command 6 (all tracked files) closes that gap, itself still
limited to *tracked* bytes. I did not run any test suite, the launcher, or the
wall CLI (out of bounds).

## Changed

Nothing — read-only. No file outside `shokunin/evidence-auditor/corpus/` was
touched; `git status --porcelain` before and after shows only the two pre-existing
untracked entries (`?? .omp/agents/evidence-auditor.md`, `?? shokunin/evidence-auditor/`).

## Unknown (not measured)

- **Non-repo gates.** A hosted/remote CI pipeline, a harness-level check, or an
  editor task could read this rule; none is observable from this checkout
  (no CI config tracked, hooks sample-only). Commands 1/2/6 search tracked bytes
  only — a gate stored outside the repo is invisible to all of them.
- **Other checkouts.** Every measurement is from this worktree at
  `87c351a…`. `reports/tf-audit-routing.md:38` records the *main* checkout
  holding run output at `test/evidence/wave-20261008T191554Z/`; whether the main
  checkout's tracked-file scope differs was not re-measured here.
- **The mechanism under a write.** `git check-ignore` answers for a path string;
  it does not prove what happens when a run actually writes a file there
  (`writeEvidence` behaviour is source-derived, per the sibling entry). No live
  run was executed.