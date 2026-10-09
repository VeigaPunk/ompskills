# write-confinement — root validation and symlink refusal

Asked: the write-root invariants and their exact enforcement.
Source: `sighting/tower-fleet.mjs` @ b251c5a. Lanes: `WriteConfinement`, `SafetyVerdicts`,
`SpecValidation` (four root-refusal transcripts) + an L1 probe.

- `resolveRepoPath` (:169-172) resolves a root **lexically** (`isAbsolute ? normalize :
  path.resolve(repo, value)`); it does not contain. `repo`/`ufoRoot` are lexically `path.resolve`d
  too (:332-333).
- `realpathDeepest` (:204-230) realpath-`s the deepest existing ancestor and appends missing tail
  components lexically; a missing component that IS a symlink → `dangling: true` (:217-218).
- `assertSafeWriteRoot(value, field, roots)` (:237-252), BOTH sides realpath-resolved, refuses
  (`INVALID_SPEC`): a dangling symlink on the path (:239-241); a realpath inside `ufoRoot` (real OR
  lexical containment, equality counts as inside, :243-245); equal to the repo root (:246-248);
  inside `<repo>/.git` (:249-251). Wired for `stateDir`/`worktreeRoot` at spec load (:401-402).
- `assertSafeWriteTarget(target, root, field, spec)` (:257-285) re-checks the root against the
  zones (:264), refuses a dangling root/target (:265-269), a leaf symlink at the target (:270-273
  "is a symlink — refusing a write through it"), an uninspectable target (:274-279, re-throwing a
  `TypedError`), a resolved target outside its validated root (:280-283), and re-checks the
  resolved target against the zones (:284). `assertLaunchWriteTargets` (:287-307) applies it to
  every derived destination — worktree, skill target, session dir, prompt, `fleet.json` — up front
  at :708 before the wall opens or any write happens; `copySkill` re-checks each skill target
  (:697), and `verbLaunch` re-checks worktree (:797), stateDir (:727), sessions (:835), prompt
  (:837), fleet.json (:906).

Refused (run-confirmed): `stateDir`/`worktreeRoot` non-string/empty (`resolveRepoPath` :170); a
dangling symlink (:240); a path inside `ufoRoot` (:244); the repo root itself (:247); inside `.git`
(:250).

Flags (from the sentinel lanes; a card must not overstate the contract):
- **Containment is NEGATIVE only.** The zones forbid exactly `ufoRoot`, repo-root equality, and
  `<repo>/.git`; nothing requires a write to stay *inside* the repo. `stateDir: "sighting"` writes
  into a repo source dir (exit 0); `stateDir: "../outside"` writes fully outside the repo (exit 0).
  Do NOT state "writes are confined to `<repo>/.tower/…`" as a launcher-enforced property.
- **Zones are relative to the declared `ufoRoot`/`repo`** — the spec's own strings; a spec that
  declares a decoy `ufoRoot` is unprotected against the real substrate (but the same `ufoRoot` is
  where the wall CLI runs, so such a spec attacks only its own decoy).
- **A symlinked `stateDir` root is refused only late** — at :727, *after* `wallCli open` (:714) and
  the registry read (:722); the load gate (:401) and the pre-flight (:708) let it through. The
  `:727` throw is caught by :729-731 and re-emitted as `STATE_DIR_UNAVAILABLE`, not `INVALID_SPEC`.
  Fix: leaf-check the roots inside `loadSpec` and let :729-731 rethrow a `TypedError`.
- **A symlinked `worktreeRoot` root is not leaf-guarded at all** — only `stateDir` gets the :727
  guard; a symlinked `worktreeRoot` to a zones-clean location is accepted (exit 0), and the pane
  `--cwd` then points outside the repo.
- **TOCTOU** is inherent: the guard snapshots via lstat/realpath, the write follows as a separate
  syscall (mitigated by repeating the guard immediately before every write; no `O_NOFOLLOW`).

Evidence: lanes `WriteConfinement` (probes p2-p12, F1-F6), `SafetyVerdicts` (six refusals, five
symlink vectors, victim sha256 unchanged), `SpecValidation`.
