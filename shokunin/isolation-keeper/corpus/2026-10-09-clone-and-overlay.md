# clone-and-overlay — the snapshot pipeline

Asked: reconstruct `snapshotCheckout`'s clone/overlay order and what it refuses.
Source: `scripts/prepare-ephemeral-l1.mjs` (557-581, 616-657);
`tests/prepare-ephemeral-l1.test.js:786-789,826-850`. Lanes `CloneDiscipline`
(scout) + `RemoteStrip` (scout) + `DocsReconcile` (critic).

`validateSource` (557-581): realpath → directory; `assertSourceGitConfigSafe`;
then one `git rev-parse --is-inside-work-tree --git-dir --git-common-dir
--show-toplevel --verify HEAD` (563-575). It refuses a non-checkout, a **linked
worktree** (`gitDir !== commonDir`, 577), a non-toplevel source, and a HEAD not
matching `^[a-f0-9]{40,64}$` (579).

Pipeline, in order:

1. `git clone --no-local --no-checkout -- <sourceRoot> <clone>` (:617);
   `chmod 0700` (:618).
2. `git -C <clone> checkout --detach <sourceHead>` (:619).
3. `lstat(<clone>/.git)` must be a **directory, not a symlink** (:620-621) —
   the normal-clone check that also kills a worktree `.git` file.
4. `git -C <clone> clean -ffdX` (:622).
5. `removeCloneRemotes(clone)` (:623).
6. Tracked overlay: `git -C <sourceRoot> diff --binary <sourceHead>` (:628,
   `encoding:null`) — diffed against the **pinned** HEAD, not live HEAD, so a
   HEAD move cannot produce a silent hybrid — piped into
   `git -C <clone> apply --binary --index --whitespace=nowarn -` (:632).
   `--index` stages the applied changes so apply-created files are not
   untracked.
7. Untracked replay (`ls-files --others --exclude-standard -z`, UTF-8 fatal,
   sorted) via `copyUntrackedEntry` (:634-646).
8. Final equality: re-read the source diff **and** the untracked list; a
   mismatch throws `source working state changed during snapshot` (:647-651).
   Then `assertCopiedUntracked` per entry.
9. `ls-files --others --ignored --exclude-standard -z` on the clone must be
   empty → `ephemeral clone contains ignored debris` (:653-654).
10. `git -C <clone> remote` must be empty → `ephemeral clone gained a remote
    during overlay` (:655).

The source checkout is never mutated; read-only is by construction (read-only
git plumbing + dangerous-config sentinel + the detect-only equality check) —
there is **no** OS-level permission or lock on the source tree.

## Unknowns

- Whether clone origin creation is avoidable by argv (not in the source).