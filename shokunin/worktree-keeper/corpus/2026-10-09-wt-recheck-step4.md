# 2026-10-09 — card re-verification (step 4, post round-2 corrections)

**Asked.** Re-verify the corrected card/corpus against a bounded 5-question scenario:
fleet `acme`, mission `wt-demo`, repo `/tmp/wksmoke2/repo` (branch `main`),
worktreeRoot `/tmp/wksmoke2/.tower/worktrees/acme`. Answer only from the card +
corpus, citing anchors; scratch `/tmp` probes only, cleaned up.

**Sources.** `.omp/agents/worktree-keeper.md`; corpus entries `-wt-add-argv`,
`-launcher-worktree-add`, `-wt-retire-by-path`, `-wt-list-semantics`,
`-branch-naming`, `-lane-bindings-l1-prompt`, `-launcher-reuse-idempotence`,
`-wt-clone-first`, `-launcher-close-manual-only`, `-wt-clear-semantics`,
`-launcher-scope-gate`, `-verification-dispatch`; source re-reads
`sighting/tower-fleet.mjs:305-317,387,597-610,797-819,946` and
`sighting/l1-prompt.md:128-166`; fresh scratch probes in `/tmp/wksmoke2` (created
and destroyed).

**Observed (each claim re-confirmed).**
- Q1 argv (launcher :805-811, exact array): `omp worktree add -C <spec.repo> -b
  tower/<fleet>/<id> <worktreeRoot>/<id> <spec.base>`. For the scenario →
  `omp worktree add -C /tmp/wksmoke2/repo -b tower/acme/wt-demo
  /tmp/wksmoke2/.tower/worktrees/acme/wt-demo <base>`. Writer lane (l1-prompt
  :151-154) → `omp worktree add -C /tmp/wksmoke2/repo -b tower/acme/wt-demo-lane1
  <sibling-path> <base>`. Branches: mission `tower/acme/wt-demo`; lane
  `tower/acme/wt-demo-lane1` (hyphen sibling; a child ref cannot exist —
  `-branch-naming`). `base` default: launcher :387 `raw.base === undefined ||
  trim()==="" ? gitHeadBranch(repo) : …` → the repo's HEAD branch (`main` here);
  `gitHeadBranch` :310-317 refuses a detached HEAD as `INVALID_SPEC`.
- Q2 retire: `git -C /tmp/wksmoke2/repo worktree remove
  /tmp/wksmoke2/.tower/worktrees/acme/wt-demo` (what `close` prints,
  launcher :1220-1223; `worktreeRemoval:"manual-only"` :1209). `omp worktree
  clear`/`--all` is wrong: it sweeps only the agent yard (`~/.omp/wt`;
  `worktree.base`/`OMP_WORKTREE_DIR`), never the repo, and `--all` would also
  remove live entries — never run it (`-wt-retire-by-path`, `-wt-list-semantics`,
  `-wt-clear-semantics`).
- Q3 inventory: `git -C /tmp/wksmoke2/repo worktree list [--porcelain]` (+
  `git status`/`log` per tree). `omp worktree list --json` prints `[]` because it
  scans the agent yard, not the repo's git worktrees; `-C` is inert for `list`
  (`-wt-list-semantics`). Re-probed: `omp worktree list --json` → `[]` exit 0
  while `git worktree list --porcelain` showed the trees.
- Q4 failure posture: a failed `omp worktree add` records `WORKTREE_ADD_FAILED`
  per mission and `continue`s (launcher :812-819); the run ends `LAUNCH_PARTIAL`
  exit 2 (:946). It does NOT abort (`-launcher-worktree-add`,
  `-launcher-reuse-idempotence`).
- Q5 PATH: relative PATH accepted, resolved against `-C` (probe A:
  `../.tower/worktrees/acme/wt-demo` → exit 0, tree created). A PATH inside the
  clone source repo recurses in the clone-fallback warning path yet still exits 0
  (probe B: `warning: worktree clone fell back to plain checkout: … create
  /tmp/wksmoke2/repo/.tower/worktrees/acme/inside/.tower/…` repeated, exit 0) —
  noise, not a refusal (`-wt-add-argv`, `-wt-clone-first`). Recreate trap (probe
  C): after `git worktree remove` of a tree whose branch carries its own commits,
  a later `omp worktree add -b <that branch>` FAILS exit 1 — `git branch:
  Reference "refs/heads/tower/acme/adv" was not supposed to exist when writing it
  with value Object(Sha1(b6ca24d…)), but actual content was Object(Sha1(153e0cf…))`
  (`-launcher-reuse-idempotence`, `-wt-add-failures` (b)).

**Changed.** Appended; no card/corpus claim required correction this round — all
five answers matched the corrected card and corpus, and the three probe-able
claims (relative PATH, inside-repo recursion exit 0, recreate-after-remove-with-
commits exit 1) reproduced exactly.

**Unknown.** The omp-envelope lane-name validation (still not probed); the exact
merge argv/actor (no generator in tracked sources).

**Lane.** WorktreeKeeperRecheck (worktree-keeper). Scratch: `/tmp/wksmoke2`
(created + destroyed; `git worktree remove --force`, `git branch -D`, `rm -rf`).
