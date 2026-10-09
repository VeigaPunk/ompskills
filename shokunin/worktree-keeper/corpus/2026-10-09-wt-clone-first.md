# 2026-10-09 — clone-first: `worktree.clone`, and the fallback is not a failure

**Asked.** Investigate the CLI's "clone-first when enabled" behavior and the fallback warning.
**Sources.** probes (cross-device, tmpfs, btrfs, a disabled profile, `isolation.backend=rcopy`, `-q`); binary strings (`worktree-cli.ts` markers, settings def, `pi_natives.linux-x64-modern.node`); `omp worktree --help`.
**Observed.**
- Enabling key: **`worktree.clone`** (boolean, default **true**; `protocolDefault [rpc,acp]`; UI "Clone Checkout into Worktrees"); backend key `isolation.backend` (enum, default `auto`). `omp worktree add` asks the native layer for a copy-on-write clone of the current checkout.
- Success (btrfs): stdout `Cloned from <repoRoot> via reflink`, and **gitignored artifacts carry over** (`ignored.bin` present in the new worktree).
- Fallback (reflink unsupported): stderr `warning: worktree clone fell back to plain checkout: git worktree add: FICLONE unsupported for <src> -> <dst>: <io error>`, **exit 0**, a plain checkout **without** gitignored artifacts. Both variants observed: cross-device `Invalid cross-device link (os error 18)` (`EXDEV`) and tmpfs `Operation not supported (os error 95)` (`EOPNOTSUPP`).
- Disabled: via an isolated profile (`omp --profile … config set worktree.clone false`) → no clone line, no warning, `ignored.bin` absent. `isolation.backend=rcopy` → no clone marker, no warning, `ignored.bin` absent.
- `-q` + a failing clone: stdout empty, the warning **still** prints on stderr, exit 0.
- Anchors: `packages/coding-agent/src/cli/worktree-cli.ts` (`worktreeAdd(o,r,{detach, clone: j5.get(n), backend: DB(K5.get(n))})` + a dim `console.error` warning placed outside the `!e.quiet` guard); `session/session-worktree.ts`; `commands/worktree.ts`; `tools/gh-pr-checkout.ts`; `tools/bash-worktree-rewrite.ts` (`rewriteGitWorktreeAdd`, gated by `if (j5.get(this.session.settings))`); the security `ref_diff` path passes `clone:false`. Settings def ~line `802186`. Native literals: `'FICLONE unsupported for '`, `'spawn git worktree add: '`, `'source and destination are on different devices'`. Help lead: "Add, list, or clear git worktrees (clone-first when enabled)"; there is no per-invocation clone flag.
- Drift: changelog 18.4.3 documents `PI_SMART_GIT=1` for the bash `git worktree add` clone shortcut, but the current JS gate reads the `worktree.clone` setting; empirically `PI_SMART_GIT=1` had no effect and the bash-tool rewrite did not fire in this session (activation unresolved).
**Changed.** Seed entry.
**Unknown.** The first-file abort behavior of the per-file FICLONE loop [INFERENCE]; the native `auto` backend ranking [INFERENCE]; the `protocolDefault` effect for non-`rpc`/`acp` sessions [INFERENCE]. Side effect (cleaned): one probe initially ran in the session cwd — a shell `cd` broken by `__fnmcd` — and created branch `wt1` + worktree `/tmp/wtprobe/wt1` in the ompskills repo; both removed.

**Lane.** WtCloneFirst (scout). Report: `reports/worktree-keeper/WtCloneFirst.md`.
