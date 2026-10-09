# Audit — `sighting/tower-fleet.mjs` safety invariants

- **Axis:** `audit-launcher` · mission `tf-audit-launcher` · fleet `tower1`
- **Audited revision:** `/home/vgpnk/Projects/ompskills/sighting/tower-fleet.mjs`, 741 lines
  - sha256 `d8d5b6ae26cbfba3faf5d3c130c6e16ceb13b3982060c600e25836a1f33f72d4`
  - md5 `d365090b3df0db67beb4d25da31b8c70` (worktree copy byte-identical)
- **Method:** 32-lane swarm wave (`tf-audit-launcher-r1`, band 16–32, validated by
  `scripts/ufo-swarm-wave.mjs plan`), plus an independent L1 probe. Lanes were
  read-only on the real repo/substrate and probed a `mktemp -d` sandbox with a
  fake `ufoRoot`; each lane's scoped report is under
  `.tower/fleets/tower1/reports/tf-audit-launcher/`.
- **Note on line numbers:** the file was edited during the audit (launcher
  robustness work landed in a sibling mission). All line citations below are
  from the audited revision above; a few lanes also cite the canonical copy,
  which matched byte-for-byte at probe time.

## Verdict summary

| # | Invariant | Verdict | Worst severity |
|---|-----------|---------|----------------|
| 1 | `sweep-safety` — no repo-wide worktree sweep | **HOLDS** | — |
| 2 | `removal-discipline` — per-path removal only, never automatic | **HOLDS** | low (guidance) |
| 3 | `argv-integrity` — argv-array shell-outs, no spec-built shell string | **HOLDS for shell** / **VIOLATED for option-flag injection** | high |
| 4 | `interactivity` — interactive omp argv, `--cwd` == mission cwd | **HOLDS at runtime** / latent guard hole | low (was medium; §R2) |
| 5 | `write-confinement` — writes only under stateDir/worktreeRoot/worktrees | **VIOLATED** (spec-trust dependent; follows symlinks) | high |
| 6 | `gate-honesty` — `--apply` gate, truthful typed errors/exit codes | **HOLDS** | medium |

Round 2 (16 refutation lanes) tried to falsify each accepted finding with disjoint
methods and the real binaries; results and corrections are in
[§ Round 2](#round-2--refutation-pass). No finding was fully refuted; three were
corrected (M-4.1 Medium→Low; L-2.1 and L-7.3 scope-narrowed), one remediation was
shown insufficient (H-5.2), and one incident attribution was corrected.

Adversarial confirmation:
- Mutation test M1 — injecting `run(["omp","worktree","clear"])` into `verbStatus`
  was **killed** by the argv-log detector (baseline clean, mutant caught, bytes
  restored to `d8d5b6ae…`) — `SwarmMutationTester03`.
- Mutation test M2 — neutralizing `MAXTIME_PATTERN` leaves the guard
  load-bearing: deleting the `interactiveGuard` call lets `--print` reach the omp
  argv (`SwarmMutationTester20`).

---

## 1. `sweep-safety` — HOLDS

No code path reaches a repo-wide sweep or bulk deletion.

- Single spawn primitive: `spawnSync(argv[0], argv.slice(1), …)` at **:359**;
  `shell` is never set by any caller (`Sp2`, `S13`, `R02`, `S16`).
- Only worktree subcommand ever executed: `omp worktree add -C <repo> -b <branch>
  <worktree> <base>` at **:511–517** (`add` only).
- `node:fs` imports (`:49–56`) are `cpSync / existsSync / mkdirSync / readFileSync /
  readdirSync / writeFileSync` — **no delete/remove primitive is imported at all**,
  so in-process removal is structurally impossible.
- `omp worktree clear` appears only as prohibition prose (`:22`) and a printed
  banner (`:662`); `git … worktree remove` only inside a printed string (`:664`).
- Runtime: `plan`/`status`/gated and un-gated `launch`/`close` in a PATH-shimmed
  sandbox logged only `omp worktree add`, `ufo-sighting open|launch|complete`.
- Cross-repo map (`Connector04`): the only automatic worktree remover in either
  repo is `ufo-fsd-alpha/scripts/nc5-origin-sync.sh` (`rm -rf`/`git worktree
  remove --force` against a hardcoded `/tmp/nc5-sync-wt`), disjoint from fleet
  trees and not scheduled/running. Nothing in `ufo-sighting` removes worktrees.

## 2. `removal-discipline` — HOLDS

- `verbClose` (`:642–668`) completes wall missions and **prints**, never runs, a
  per-path command; `--json` emits `worktreeRemoval: "manual-only"` (`:658`).
- Reuse branch (`:507`): an existing worktree is reused with a warning, never
  reset/removed — proven by re-running `launch --apply` over a dirty/advanced
  worktree (branch tip, reflog, HEAD, modified/untracked all unchanged; zero
  extra `omp` spawns) — `Critic14`.
- Real `omp worktree add -b` refuses an existing branch without moving its tip.

**Findings (low):**
- **L-2.1 Printed cleanup command is unquoted** (`:664` interpolates `spec.repo`
  and `row.worktree` raw). A repo/worktree path containing a space or `$(…)`
  makes the pasted line split and, if pasted into a shell, execute command
  substitution from spec content. The launcher itself never executes it
  (argv-integrity unaffected). Fix: reuse `quoteArg` (`:406`), already used for
  plan's display at `:421`. (`SwarmReviewer12` F2, `SwarmReviewer18`, `SwarmReviewer02`)
- **L-2.2 Reuse keyed on `existsSync` only** (`:507`) — a pre-existing directory
  at `<worktreeRoot>/<id>` that is *not* a worktree on `row.branch` is silently
  reused; the mission then runs on the wrong branch (or a non-git directory,
  cfg. 5.3). Fix: verify `git -C <wt> rev-parse --abbrev-ref HEAD == row.branch`,
  else typed refuse. (`SwarmCritic14` F2)

## 3. `argv-integrity` — shell holds, option-flag injection VIOLATED

**Shell-string integrity HOLDS.** One `spawnSync` site (`:359`), argv arrays
everywhere, no `shell: true` / `exec*` / backtick command strings. A hostile
`title` (`drop $(touch PWNED) \`id\``) arrived as **one inert argv element** in
the wall argv; no artifact created (`SwarmScout16`, `SwarmReviewer18`,
`SwarmReviewer02`, `SwarmSentinel08`). `bash` is `bash <script> <args>` with an
explicit script path, never `-c`.

**VIOLATION — unvalidated `base` reaches an option position.**

- `base` (`:249`) is only `String(raw.base).trim()` — no type check, no pattern,
  no leading-dash check (contrast `maxTime` at `:253`).
- It is passed as the **final positional** of `omp worktree add` (`:512–517`)
  with no `--` terminator.
- Observed against a **real** `omp` in a sandbox (`SwarmCritic10` C2):
  `base: "--cwd=<otherrepo>"` → the launcher reports `ok:true` and
  `worktree=<repo>/.tower/worktrees/tower1/tf-x`, while the worktree and branch
  are actually registered **in `<otherrepo>`** (`otherrepo/.git/worktrees/tf-x/*`,
  branch `tower/tower1/tf-x`); `git -C <repo> worktree list` does not see it.
  `SwarmSentinel15` independently observed `--force`, `--`, `-b` reaching the
  `omp` argv (the `-b` case via `base: ["-b"]` → `String()` coercion).
  Adding `--` before the positional makes `omp` fail closed with zero writes.
- Shell execution is **not** possible here (`$()` stays inert); the impact is
  flag/semantics injection and misreported success.

Fix: require `typeof base === "string"` and a conservative ref pattern
(e.g. `^[A-Za-z0-9][A-Za-z0-9._/@:-]{0,255}$`), and pass `--` before positionals.

**Finding (low) — `title` `--` boundary.** `title` (`:214–217`) is trim-only and
passed as `--title <title>` (`:346`); the wall splits on the first literal `--`,
so a title of exactly `--` shifts the boundary. The real wall fails closed (no
pane), but the launcher has already created the worktree/prompt for that mission.
Fix: refuse `title === "--"` and control characters. (`SwarmSentinel15` F2)

**Finding (info) — `run()` spreads caller options** (`:359`): a future caller
passing `shell:true` would break the invariant; unreachable today. (`Sp2`,`R02`)

## 4. `interactivity` — HOLDS at runtime, latent guard holes

- `buildOmpArgv` (`:319–336`) is the sole omp-argv constructor; `interactiveGuard`
  (`:305–317`) runs before the wall (`:333` → before `wallCli` at `:483/:536`),
  proven both directions with a wall-reaching fake. The real argv passes the
  guard (`--print-thoughts` matches by **equality**, not prefix — `:310/:328`).
- Guard fires on `-p`, `--print`, `--mode`, `--mode=rpc`, `--mode=rpc` via `=`.
  Deleting the guard call lets `--print` through → guard is load-bearing
  (`SwarmMutationTester20`, `SwarmScout22`, `SwarmReviewer19`).
- `argv.slice(1)` correctly excludes `argv[0]`.

**Findings:**
- **M-4.1 `--print=`/`-p=` forms are not blocked** (`:310` matches exact tokens),
  asymmetric with the deliberate `--mode=` handling at `:313`. Latent today:
  no spec field can inject a dash-leading token (`maxTime` is pattern-gated;
  paths are `path.resolve`d and lead with `/`), and the wall's own preflight
  rejects headless argv on `launch`. `plan` never reaches the wall, so a naive
  future edit is the exposure. Fix: also match `token.startsWith("--print=")` /
  `token.startsWith("-p=")`. (`SwarmReviewer19` F1)
- **L-4.2 `--cwd` assertion is a tautology** (`:334` compares `argv[2]` — the same
  `worktree` binding stored at `:323`); it never checks `argv[1] === "--cwd"`, so a
  layout edit that silently drops `--cwd` is not caught. Informational; the
  invariant holds by construction today. Fix: check the pair by token.
  (`SwarmCritic21`, `SwarmReviewer19` F3)
- **L-4.3** exit-immediately omp flags (`--export=`, `--alias=`, `--from-claude`)
  are in neither guard's vocabulary; literal-edit-only vector. (`SwarmReviewer19` F2)

## 5. `write-confinement` — VIOLATED

Converged across 8 independent lanes (`Scout05`, `Sentinel06`, `Sentinel08`,
`Sentinel11`, `Critic10`, `Scribe32`, `Revenger09`, `Critic14`) plus the L1 probe.

**H-5.1 No containment check on `stateDir` / `worktreeRoot`** — `resolveRepoPath`
(`:145–148`) is `path.isAbsolute(value) ? path.normalize(value) : path.resolve(repo, value)`
with **no** boundary test; `loadSpec` passes the result through (`:262–263`).
Observed (sandbox, `launch --apply` unless noted):

| spec `stateDir` / `worktreeRoot` | result |
|---|---|
| `/tmp/outside` / absolute | accepted, exit 0; prompts + `fleet.json` written there |
| `../../escape` / relative | accepted; resolves outside the repo (`/tmp/escape/state`) |
| `<ufoRoot>/config`, `<ufoRoot>/wt` | **accepted**; `fleet.json`, `*.prompt.md`, `sessions/`, and a full worktree checkout written **under the declared ufoRoot** |
| `<repo>/.git` | accepted; writes into the git dir |
| `sighting` (tool's own source dir) | accepted; drops `fleet.json`/prompt/sessions inside `sighting/` |

Impact: the header contract "never edit anything under `<ufoRoot>`" (`:25–26`) is
*spec-trust dependent*, not enforced. The launcher only guarantees writes land
under whatever the spec declares — and a spec can declare the substrate.
Fix: in `loadSpec` (`:262–263`) reject roots that escape the repo or are equal
to / nested in `ufoRoot` (or `repo/.git`), with a typed `INVALID_SPEC`.

**H-5.2 Writes follow symlinks; leaf symlinks are an arbitrary-file-overwrite
primitive** (`Sentinel11`, 5 of 6 planted-symlink probes wrote outside the
sandbox; `Critic14` E5). `resolveRepoPath` is lexical (`path.resolve` only); no
`realpath`/`lstat`/`O_NOFOLLOW` anywhere in the file. Concretely:
- `stateDir` / `worktreeRoot` symlinked out → checkout + skills + `fleet.json`
  land at the link target while `git worktree list` records the resolved path and
  the launcher reports the lexical one (misleading provenance).
- Pre-planted symlinked leaves (`<id>.prompt.md`, `fleet.json`) are truncated and
  overwritten with launcher content (exit 0).
- `cpSync` (`:472`) and `mkdirSync`/`writeFileSync` (`:487,:531–533,:561`) all
  follow links. `existsSync` reuse (`:507`) follows links, so a symlinked
  `<worktreeRoot>/<id>` is "reused" and the pane launches with `--cwd` at an
  external, non-git directory.
- One planted intermediate symlink redirected **both** roots of a launch at once.

This is the same mechanism class as the substrate-config clobber observed during
this mission. Fix: `realpathSync` the nearest existing ancestor of each root and
require it under `realpathSync(repo)`; `lstat`/`O_NOFOLLOW` before the write
sites; make the reuse gate lstat-based.

**M-5.3 `base` injection re-registers worktrees elsewhere** — see §3 (`Critic10` C2);
also a confinement bypass (worktree + branch land in an arbitrary repo while
`ok:true`).

**Context — delegated writes.** `omp worktree add` itself writes under
`<repo>/.git/worktrees/<id>/` (outside the three named roots), and the wall
(`ufo-sighting open|launch|complete`, `status --lite`) writes under
`<ufoRoot>/.ufo/**` — including a status-advisory cache even for
`status --lite` (`Critic23` C1, `Critic24` B). The blanket "no substrate writes"
claim must be read as *no launcher-initiated write into `<ufoRoot>`*, which H-5.1
shows is not enforced.

## 6. `gate-honesty` — HOLDS

- `launch`/`close` without `--apply` refuse with exit 2
  `MUTATION_REQUIRES_APPLY`, **zero** filesystem writes and **zero** wall calls;
  the refusal precedes spec/config I/O (`Critic23`, `Critic24`, `Executor07`,
  `MutationTester03`).
- `plan` (`--json`) emits `writes:false` and performs **no** write under
  instrumented block mode; `status` makes exactly one read-only wall call
  (`status --lite`). `plan` does spawn `git rev-parse` when `base` is absent
  (informational; no write).
- Exit codes truthful in every probe: 0 ok / 2 typed / 64 usage.
  Positive control: `--apply` is the discriminator (`Critic23` F6).
- No parsing bypass reaches the mutating path (9 attack forms rejected).

**Findings:**
- **M-6.1 `close --mission '' --apply` completes ALL missions** — `parseArgs`
  (`:690`) accepts an empty value (non-null), and `verbClose` (`:644`) tests
  truthiness, so the `UNKNOWN_MISSION` guard is skipped and every fleet mission
  is completed (reproduced: exit 0, two `complete` calls). Fix: reject empty at
  the usage layer (64) or compare `!== null`. (`SwarmReviewer25` F1)
- **M-6.2 Partial-failure gaps.** When a mission's wall launch fails, the code
  records `failure`, keeps earlier panes, writes `fleet.json` with `ok:false`,
  then throws `LAUNCH_PARTIAL` (exit 2) — verified good. But a mid-loop **typed
  abort** (`WORKTREE_ADD_FAILED`, `WALL_OUTPUT`) exits *before* `fleet.json` is
  written while earlier panes stay live — contradicting the inline comment
  "written either way" (`:543–545`); human mode prints `launched <id> · pane ?`
  for a **failed** mission; and `close` has no partial policy, so a never-launched
  mission aborts the close loop (`COMPLETE_FAILED`) leaving mixed state
  (`SwarmReviewer27` F1/F2/F3).
- **L-6.3 Untyped surface.** A missing `sighting/l1-prompt.md` (unguarded
  `readFileSync` at `:271`) exits 2 with code `UNEXPECTED_ERROR`, not a typed
  code; the header advertises "2 typed error". (`SwarmScribe26` F2/F3,
  `SwarmReviewer31` F6)

## 7. Spec validation surface (supporting findings)

- **M-7.1 `FLEET_PATTERN` type coercion** (`:189`): `fleet` of `1`, `true`, or
  `["ab"]` is string-coerced past `FLEET_PATTERN.test(raw.fleet ?? "")` and kept
  as the non-string (`:256`); `status` then shows the mission as `not-on-wall`.
  Fix: `typeof fleet === "string"` gate. (`SwarmScout28`)
- **M-7.2 Scope dot-segment overlap bypass** (`:150–163`): `normalizeScopePath`
  strips only one leading `./` and admits `.` parts, so `././a` vs `a`,
  `a/./b` vs `a/b`, and `.` vs `src` evade the one-writer-per-path `SCOPE_OVERLAP`
  gate (all exit 0). `scopeOverlaps` (`:165–170`) itself is correct (verified
  truth table). Fix: filter `.` parts and carry component arrays through the gate.
  (`SwarmScout28`, `SwarmConnector30` — counterfactual fix flips exactly the 3
  bad rows, 0 regressions over 21 probes)
- **L-7.3 Placeholder resolution** (`renderPrompt`, `:288–300`): the `key in values`
  test (`:294`) admits prototype-chain names, so `{{constructor}}`/`{{toString}}`
  render `[native code]` instead of refusing; and the `[A-Za-z]+` regex misses
  digit/underscore placeholders (`{{x1}}`), so the residual check does not catch
  them. Fix: `Object.hasOwn(values, key)`. (`SwarmReviewer31` F1/F2)
- **L-7.4 `l1Alias` String coercion** (`:132`): booleans/numbers coerce
  (`true` → `--model @true`, exit 0); harmless in-file due to the `@` prefix +
  charset regex. Fix: `typeof` check. (`SwarmReviewer29`)
- **Info-7.5 Dead clause** `|| maxTime.startsWith("-")` (`:253`) is unreachable —
  `MAXTIME_PATTERN` already forbids a leading dash. (`SwarmScout28`)
- **Info-7.6** `MISSION_ID_PATTERN` and the skill-name pattern hold (reject
  traversal/space/leading-dash); ceiling gates (`L1_CEILING_EXCEEDED`,
  `PANE_CEILING_EXCEEDED`) and every enumerated `CONFIG_UNREADABLE` arm fire
  truthfully (`SwarmScout28`, `SwarmReviewer29`, `SwarmSentinel06`).

---

## What changed vs. the stated contract

| Contract claim (header `:19–31`) | Reality |
|---|---|
| "never `omp worktree clear`" | **holds** — no sweep reachable |
| "never edit anything under `<ufoRoot>`" | **not enforced** — spec-declared roots may point into or under `ufoRoot`; writes follow symlinks (H-5.1/H-5.2) |
| "writes land only under `<stateDir>`, `<worktreeRoot>`, mission worktrees" | **holds literally**, but those roots are unvalidated spec input |
| "every shell-out is `spawnSync` with an explicit argv array — no shell strings" | **holds**; option-flag injection via unvalidated `base` is a separate gap |
| "omp argv stays interactive; `omp --cwd` equals the mission cwd" | **holds**; guard has latent `--print=` hole and a tautological `--cwd` check |
| "launch/close refuse without `--apply`; 0/2/64" | **holds**; `close --mission ''` and untyped `ENOENT` are the exceptions |

## Recommended remediation order (advisory; not applied)

1. H-5.1/H-5.2 — root containment (`realpath` of nearest existing ancestor under
   `realpathSync(repo)`; reject `ufoRoot`/`repo/.git` nesting) + `lstat`/`O_NOFOLLOW`
   on the write sites; lstat-based reuse gate. *Highest impact; closes the
   substrate-write class.*
2. H-3.1 — validate `base` (type + ref pattern) and add `--` before `omp worktree
   add` positionals.
3. M-6.1 — reject empty `--mission` value; M-7.1/M-7.2 — `typeof fleet` gate and
   dot-segment canonicalization.
4. M-4.1/L-4.2 — guard `--print=`/`-p=` forms; assert `--cwd` by token.
5. M-6.2/L-6.3 — write `fleet.json` on mid-loop aborts, honest human-mode failure
   line, type the prompt-template `ENOENT`.

## Provenance

Accepted evidence comes from the 48 lane reports (32 discovery + 16 refutation) in
`.tower/fleets/tower1/reports/tf-audit-launcher/`, the independent L1 probe
(`plan --json` on the real fleet spec; a sandbox `stateDir` confinement probe),
and mutation tests M1/M2. Every lane verified the canonical launcher sha256 and
reported zero writes to the real repo or substrate except its own report file.
No check in this report is claimed unrun; unresolved residuals are marked as
`[INFERENCE]` in the individual lane reports.

---

## Round 2 — refutation pass

16 lanes, each attempting to falsify one accepted round-1 finding with disjoint
methods and the **real** binaries (`omp` 18.8.6, `git` 2.55.0) rather than a PATH
shim. Outcome: **0 findings fully refuted; 5 confirmed and strengthened, 6
partially refuted (claim corrected), 5 confirmed as-is.** Per-lane reports:
`SwarmReviewer01`, `SwarmSentinel02`, `SwarmExecutor03`, `SwarmMutationTester04`,
`SwarmCritic05`, `SwarmReviewer06`, `SwarmReviewer07`, `SwarmScout08`,
`SwarmConnector09`, `SwarmCritic10-2`, `SwarmSentinel11-2`, `SwarmSentinel12`,
`SwarmRevenger13`, `SwarmCritic14-2`, `SwarmCritic15`, `SwarmConnector16`.

| Finding | Refutation verdict | Correction applied |
|---|---|---|
| H-5.1 roots unconfined | not refuted (88-run matrix, 0 containment rejections) / **impact partially refuted** | see below |
| H-5.2 symlink writes / leaf overwrite | not refuted — strengthened with real binaries | remediation insufficient |
| H-3.1 `base` option injection | not refuted (real `omp`, two repos) | wording + exploit class refined |
| M-6.1 `close --mission ''` | not refuted | trigger scope tightened |
| M-7.1 `fleet` coercion | partially refuted | B/D refuted, A/C confirmed |
| M-7.2 scope dot bypass | not refuted | bypass class refined |
| M-4.1 `--print=` guard hole | partially refuted | **Medium → Low** |
| L-2.1 unquoted printed command | partially refuted | claim corrected |
| L-7.3 placeholder prototype bypass | partially refuted | scope narrowed |
| sweep-safety HOLD | supporting bullets partially refuted | wording corrected |
| removal-discipline HOLD | not refuted | low exception added |
| gate-honesty HOLD | not refuted (FIFO proof) | sub-claim corrected |

**H-5.1 — confirmed unenforced; impact scoped.** `Reviewer01` re-audited the whole
pipeline and ran 88 `launch --apply` combinations (22 values × 2 roots, real `omp`)
with **zero containment rejections**: absolute escapes, `..` chains, `<repo>/.git`,
`<ufoRoot>`, and `<ufoRoot>/config` were all accepted and wrote/registered where
the spec said. Correction round 1 missed: **`git`/`omp` do *not* refuse
`.git`-internal or `ufoRoot`-internal worktrees** on omp 18.8.6, so the
reject-nesting check in the remediation is load-bearing, not belt-and-braces.
`Sentinel02` partially refuted the *impact*: a hostile spec is already fully
privileged (it chooses `ufoRoot`, and the launcher runs `bash <ufoRoot>/scripts/ufo-sighting`
at `:371`), so containment guards *benign/buggy* specs, not an adversary; the
reachable-by-name overwrite set is tiny (`<stateDir>/fleet.json`,
`<stateDir>/<id>.prompt.md`, reused-dir `.omp/skills/<name>/**`), and the real
`ufoRoot` today holds no `fleet.json`/`*.prompt.md` to replace — so H-5.1's real
impact is **creation/pollution, not arbitrary overwrite** (that class is H-5.2).
It also showed a read-only root fails closed with a **generic `UNEXPECTED_ERROR`**
(`:739`), not a typed code, and that a mid-loop abort leaves the earlier
worktree/wall-open side effects (`WORKTREE_ADD_FAILED` after `mkdir`).

**H-5.2 — confirmed, remediation corrected.** `Executor03` re-ran the symlink
scenarios with the real `omp` ELF (no shim): symlinked `worktreeRoot` — real `omp
worktree add` accepted and checked out through the link; symlinked state leaves —
`writeFileSync` truncated and replaced the outside victims (sha changed);
`existsSync` reuse (`:507`) "reused" a symlinked slot and skipped `omp` entirely.
`MutationTester04` then falsified the *proposed fix*: an `lstat` leaf refusal kills
the literal leaf scenario but is bypassed by (a) a symlinked `stateDir`,
(b) a symlinked intermediate component, (c) a **dangling** leaf symlink (target
created), and (d) the `copySkill` write site. A stronger design — `realpath`
containment of `stateDir` + `openSync(… O_NOFOLLOW)` — refused all five launcher
vectors with six victims byte-identical and the happy path intact (tested mutant
`tower-fleet-hardened.mjs`, sha256 `2df6cedd…`), though it still does not cover
`copySkill`. **Corrections:** `cpSync` does *not* follow a symlinked leaf target
(`ERR_FS_CP_DIR_TO_NON_DIR`), so round 1's "every write site follows symlinks" was
over-broad; and the escalation is conditional on a shared/outside `stateDir`.

**H-3.1 — confirmed, refined.** `Reviewer06` and `Critic05` reproduced it against
the real `omp`: the `base` slot is an **option-scanned slot** (omp parses flags
interspersed), so `--cwd=<otherrepo>` silently registers the worktree *and* branch
in another repo while the launcher prints `ok:true` and the JSON reports the
lexical (wrong) path; `--branch=<ref>` produces false branch provenance; `-q`,
`-d`, `--detach`, `--` silently swap the base. Unknown flags fail loudly
(`WORKTREE_ADD_FAILED`), so the exploit class is **known flags only**. Inserting
`--` before the positionals was verified to fail closed (exit 2, zero worktree
writes) with the happy path intact — though `--` alone is not zero-write, because
the wall `open` and the `<stateDir>` creation happen before the worktree loop.

**M-6.1 — confirmed, trigger tightened.** `Reviewer07` reproduced 3 `complete`
calls for `close --mission '' --apply` and for `--mission "$UNSET" --apply`;
`--mission '  '` and `--mission nosuch` correctly give `UNKNOWN_MISSION` (exit 2),
`--mission=` is a usage error (64), and `--mission --apply` is caught by the apply
gate. Only the space-separated empty token (or an empty variable) triggers
close-all. Severity Medium holds (completion is irreversible wall-side).

**M-7.1 — partially refuted.** `Critic10-2` refuted the child-token half (spawnSync
`ToString`s argv, and the wall's own gate `ToString`s the same way, so the `--fleet`
token is identical to the string control) and the close-behaviour half (`verbClose`
is fleet-blind; identical `complete --mission` sequences for `"ab"`, `1`, `["ab"]`).
Confirmed: the JSON `fleet` type drift (cosmetic except to strict consumers) and
the `status` row matching via strict `===` (`:613`), which reports **every** live
mission as `not-on-wall` for a non-string `fleet`. Impact therefore lowers from
"behavioural" to "cosmetic + status misreport".

**M-7.2 — confirmed, refined.** `Connector09` re-ran 21 cases end-to-end
(including `launch --apply` with real `omp`: both worktrees live, both prompts on
disk with contradictory edit-bounds) and pinned the exact bypass class: *a `.`
segment surviving at a position before the shorter scope's segment count, or a
bare `.`*; it added new evasion pairs (`a/.` vs `a/b`, `src/././deep` vs
`src/deep`, `.` vs `docs/readme.md`) and showed `./` → `INVALID_SPEC` while `.` →
accept, for the same referent.

**M-4.1 — partially refuted, Medium → Low.** `Sentinel12` showed no spec-controlled
value can place a `--print=`/`-p=` token in the omp argv (the argv template is
fixed; every spec value lands in an absolute-path slot, an `@`-prefixed token, or a
pattern-constrained token), and the **real wall preflight** rejects those forms
(`HEADLESS_MISSION_REJECTED`) before any pane exists. The gap's only failure mode is
a late per-mission `LAUNCH_FAILED` after the worktree/prompt writes — a
defense-in-depth asymmetry, not a live hole.

**L-2.1 — partially refuted, claim corrected.** `Scout08` proved the `:664` string
is never re-parsed or executed by anything in the launcher, its test, or the repo —
so it is **not** a launcher argv-integrity defect. It remains a real *operator*
guidance bug: a repo/worktree path with a space or metachar breaks on paste, and a
pasted `$(…)` executes (demonstrated). Severity Low.

**L-7.3 — partially refuted, scope narrowed.** `Sentinel11-2` showed the
prototype-chain bypass is **template-side only** (a spec `title`/`goal` carrying
`{{constructor}}` *is* refused with `RENDER_UNRESOLVED`, exit 2, zero mutation), that
nothing beyond prompt prose is affected (no code execution, no argv, no
filesystem, no JSON shape), and that only a template editor — already able to write
any prompt prose — can pull it. `{{__proto__}}` never reads the prototype (the
regex excludes `_`). Residual defect: lost diagnostic/gate honesty. Severity Low.

**sweep-safety — invariant HOLDS; two supporting bullets corrected.**
`Connector16` read the wall's `complete`/`status` delete sites: `verbClose` delegates
an automatic recursive delete into the wall (`applyMissionRetention` →
`rmSync(target,{recursive:true,force:true})`, `ufo-sighting.mjs:3294`) and
`verbStatus` triggers the wall's advisory-cache prune/lock sweeps — so
"no delete primitive is imported, so in-process removal is structurally impossible"
is true only *inside the launcher process*. The deletes are scoped to mission
scratch (`*.tmp`/`*.bak`/`core.*`/old snapshots, name- and lstat-guarded) and the
wall's cache/locks, never a worktree, branch, or fleet tree — the invariant stands
with better evidence. `Critic14-2` confirmed removal-discipline holds across the
full verb matrix (including `close ''`/whitespace/unknown `--mission`, partial
launches, re-runs) and added one **low exception**: a *dangling symlink* at the
worktree leaf is unlinked by the spawned real `omp worktree add` (reached because
`existsSync` follows symlinks) — an operator-planted symlink node, not a worktree
or branch.

**gate-honesty — HOLD confirmed decisively.** `Critic15` ran 21 parse/refusal
probes plus a **FIFO proof**: `launch --spec <blocking FIFO>` returns exit 2
immediately (the gate refuses before opening the spec) while the un-gated `status`
control blocks (`timeout 124`) — so no write or read precedes the `--apply` gate.
It corrected one sub-claim: `status` is un-gated and provokes the **wall's** own
`<ufoRoot>/.ufo/**` cache writes (delegated; already noted in §5) — the launcher
gate itself is sound and should not be "hardened".

**Incident attribution (corrected).** `Revenger13` forensically showed the substrate
`config/ufo.json` clobber was **not** the launcher: `config/ufo.json` appears in
`tower-fleet.mjs` only as a read (`:107`/`:110`); the file's inode/birth/mtime and a
sibling `.bak` one millisecond older match a
backup-then-atomic-replace (`copyFileSync` + tmp `writeFileSync` + `renameSync`) —
the operator session's `host/apply.mjs` merge signature — not the launcher's plain
`writeFileSync` (which preserves inode/birth, proven). The three differing integer
lines (`minLanes`, `waveMinLanes`, `waveMaxLanes`) reconcile byte-for-byte to the
committed config blob, which the launcher never emits. `NODE_COMPILE_CACHE` churn is
exonerated (extensionless V8 blobs, no `*.json`). Attribution: a **lane's own
`Bun.write` through a symlink it created** (the class this audit flags), with the
band edits being the operator's `--apply` merges.

### Revised remediation order (post-refutation)

1. **H-5.2 (do this first):** `realpath` containment of both roots (nearest existing
   ancestor under `realpathSync(repo)`) **plus** `openSync(… O_NOFOLLOW)` at the
   write sites — the leaf-only `lstat` fix is provably insufficient (`copySkill`
   still needs coverage). H-5.1 is closed by the same containment check.
2. **H-3.1:** validate `base` (type + ref pattern, mirroring the `maxTime` guard at
   `:253`) and insert `--` before the `omp worktree add` positionals.
3. **M-6.1:** `options.mission !== null` at `:644` (matching `:700`), or reject an
   empty value at the usage layer.
4. **M-7.2 / M-7.1:** canonicalize dot segments in `normalizeScopePath`; add a
   `typeof fleet === "string"` gate at `:189`.
5. **Low:** quote `:664` with `quoteArg`; widen the placeholder regex + use
   `Object.hasOwn` (`:294`); type the prompt-template `ENOENT`.