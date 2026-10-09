# remote-removal — `removeCloneRemotes` and the clone's net-isolation

Asked: quote the remote-removal function and state what net isolation it does
*not* guarantee. Source: `scripts/prepare-ephemeral-l1.mjs:583-607`,
`:655`, `:178-191`; `config/ephemeral-l1.machine.json:30-39`;
`docs/EPHEMERAL-L1-MISSIONS.md:36`; `tests/prepare-ephemeral-l1.test.js:332-335,
856-875`. Lane `RemoteStrip` (scout).

`removeCloneRemotes` (583-607): enumerate `git remote` (584) → `git remote
remove <name>` each (585); then a **config sweep** `git config --get-regexp
^remote\.` (590, `allowStatus [1]`) — a survivor throws `ephemeral clone retains
remote configuration` (591), it is not merely reported. Then
`git config --get-regexp -z ^branch\.` keys are `--unset-all`'d (596-602), and a
union sweep `^(remote|branch)\.` throws `ephemeral clone retains remote or
upstream configuration` if anything remains (603-605). A second pre-emit gate at
`:655` asserts `git remote` is empty before the digest returns.

`--no-local` plus removal is **not** the sole guarantee: every git spawn runs
under `scrubbedGitEnvironment()` (178-191), so the clone at `:617` also runs
with `GIT_CONFIG_GLOBAL=/dev/null`, `GIT_CONFIG_SYSTEM=/dev/null`,
`GIT_TERMINAL_PROMPT=0`, and empty `SSH_AUTH_SOCK`/`GIT_ASKPASS`/tokens. The
policy `childEnvironment` (machine config:30-39) duplicates that scrub for the
launched child.

Docs `:36` matches the code; no contradiction.

## Residuals

- The code proves absence of `remote.*`/`branch.*` keys and an empty remote
  listing, but does **not** scan other config namespaces
  (`url.*.insteadOf`, `push.*`, `submodule.*.url`) that could still encode a
  reachable endpoint, and does not verify object-store independence beyond
  `--no-local`.
- The url-less-remote comment (586-588) has no matching test.

## Unknowns

- Whether non-remote namespaces can enter the clone via this pipeline.