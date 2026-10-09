# 2026-10-09 — path-scoped commit practice (observed)

**Asked.** Are shokunin commits path-scoped to mission scope, and does the state dir ever enter a commit?
**Sources.** `git show --stat --oneline <sha>` on `84074ac`, `9c5b569`, `87c351a`, `c78ca86`; `git log --all --name-only`; `.tower/fleets/shokunin/spec.json`; `sighting/l1-prompt.md:135-138`.
**Observed.**
- Each sampled card commit touches exactly the mission's two-element scope: `.omp/agents/<name>.md` + `shokunin/<name>/corpus/**` (`84074ac` = 33 files/1830 ins; `9c5b569` = 28/1170; `87c351a` = 2/68 corpus+index only).
- An all-refs sweep found **zero** commits mixing in-scope shokunin paths with out-of-scope paths.
- `.tower/` is never committed: `git log --all --name-only | grep -c '^\.tower/'` = 0; `git ls-files .tower` empty; `.git/info/exclude` line 6 = `.tower/`.
- Mission scope ground truth (`.tower/fleets/shokunin/spec.json`): each mission = `[".omp/agents/<name>.md", "shokunin/<name>"]`. Rule source: l1-prompt.md:136-138.
**Changed.** Seed entry.
**Unknown.** Which integration mechanism (merge vs `git checkout <branch> -- <paths>` + path-scoped commit) was used per mission — commit metadata cannot disambiguate. (MergeHistory shows the merge pattern on main; both exist across this repo's history.)

**Lane.** CommitScopePractice (scout). Report: `reports/worktree-keeper/CommitScopePractice.md`.
